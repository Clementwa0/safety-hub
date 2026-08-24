import mongoose from "mongoose";
import { CartModel } from "@/lib/models/Cart";
import { ProductModel, type IProductVariant } from "@/lib/models/Product";
import { StoreOrderModel, type IStoreOrder, type IStoreOrderItem } from "@/lib/models/StoreOrder";
import { calculateShippingFee, calculateSubtotal, calculateTax, calculateTotal } from "@/lib/storefront/pricing";
import { getNextOrderNumber } from "@/lib/storefront/order-number";
import type { CartIdentity } from "@/lib/storefront/session";
import { CartError } from "@/lib/storefront/cart";
import { findOrCreateCustomer } from "@/lib/server/customers";
import { getSettings } from "@/lib/settings/get-settings.server";

export interface CheckoutInput {
  customer: { name: string; email: string; phone: string };
  shippingAddress: { address: string; city: string; country: string };
  paymentMethod: "mpesa" | "cod";
}


export async function performCheckout(
  identity: CartIdentity,
  input: CheckoutInput,
): Promise<IStoreOrder> {
  // M-Pesa is available to guests as well as signed-in customers. Order
  // ownership already falls back to the guest session cookie whenever
  // there's no signed-in userId (see `identity.sessionId` below). M-Pesa
  // orders are paid manually to the Paybill/Till shown on the checkout
  // page (see `MpesaPaymentCard`) — there is no STK push or automated
  // callback; staff mark `paymentStatus` as paid from the admin panel
  // once they see the payment come through.

  const filter = identity.userId ? { user: identity.userId } : { sessionId: identity.sessionId };

  const session = await mongoose.startSession();

  try {
    let createdOrder: IStoreOrder | null = null;

    await session.withTransaction(async () => {
      const cart = await CartModel.findOne(filter).session(session);

      if (!cart || cart.items.length === 0) {
        throw new CartError("Your cart is empty", 400);
      }

      const productIds = cart.items.map((item) => item.product);
      const products = await ProductModel.find({ _id: { $in: productIds } }).session(session);
      const productMap = new Map(products.map((product) => [String(product._id), product]));

      const orderItems: IStoreOrderItem[] = [];

      for (const cartItem of cart.items) {
        const product = productMap.get(String(cartItem.product));

        if (!product) {
          throw new CartError("One of the products in your cart no longer exists", 400);
        }
        if (product.status === "archived") {
          throw new CartError(`"${product.name}" is no longer available`, 400);
        }
        if (cartItem.quantity <= 0) {
          throw new CartError("Invalid quantity in cart", 400);
        }

        // A cart item selected a specific size/variant when it carries a
        // variantSku — resolve stock/reserved/price against that variant
        // rather than the parent product in that case (mirrors the
        // pre-validate rollup in lib/models/Product.ts, which treats the
        // parent's stock/reserved as just the sum across variants).
        const variant = cartItem.variantSku
          ? product.variants.find(
              (v: IProductVariant) => v.sku === cartItem.variantSku,
            )
          : undefined;

        if (cartItem.variantSku && !variant) {
          throw new CartError(`The selected size for "${product.name}" is no longer available`, 400);
        }

        // Available = stock minus whatever's already reserved by other
        // pending/unshipped orders and accepted quotations — not raw
        // stock. Checkout no longer decrements `stock` directly (that now
        // only happens once an order actually ships, see
        // app/api/admin/store-orders/[id]/route.ts); it holds a
        // reservation instead, the same mechanism the B2B quotation flow
        // already uses (see lib/server/availability.ts).
        const stockSource = variant ?? product;
        const available = Math.max(0, stockSource.stock - stockSource.reserved);
        if (cartItem.quantity > available) {
          throw new CartError(
            available > 0
              ? `Only ${available} unit(s) of "${product.name}"${variant ? ` (${variant.size})` : ""} are in stock`
              : `"${product.name}"${variant ? ` (${variant.size})` : ""} is out of stock`,
            400,
          );
        }

        // Server reads the current price — the frontend's price is never trusted.
        const price = variant ? variant.price : product.price;
        const subtotal = Math.round(price * cartItem.quantity * 100) / 100;

        orderItems.push({
          product: product._id as mongoose.Types.ObjectId,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          variantSku: variant?.sku,
          size: variant?.size,
          image: variant?.image || product.image,
          price,
          quantity: cartItem.quantity,
          subtotal,
        });
      }

      // Tax rate is read fresh from admin Settings on every checkout — never
      // hardcoded — so a rate of 0 (or any change) takes effect immediately.
      const settings = await getSettings();

      const subtotal = calculateSubtotal(orderItems.map((item) => ({ price: item.price, quantity: item.quantity })));
      const shippingFee = calculateShippingFee(subtotal);
      const tax = calculateTax(subtotal, settings.taxRate);
      const total = calculateTotal(subtotal, shippingFee, tax);

      const orderNumber = await getNextOrderNumber(session);

      // Matches/creates a CRM Customer record from the checkout details,
      // the same findOrCreateCustomer used by the Quotation/Order/Invoice
      // forms — so a storefront shopper shows up in the Customers list
      // too, deduped against an existing B2B contact if they share an
      // email or phone. Runs inside this transaction so it commits or
      // rolls back atomically with the rest of the order.
      const customerRecord = await findOrCreateCustomer(
        {
          name: input.customer.name,
          email: input.customer.email,
          phone: input.customer.phone,
          address: [input.shippingAddress.address, input.shippingAddress.city, input.shippingAddress.country]
            .filter(Boolean)
            .join(", "),
        },
        session,
      );

      const [order] = await StoreOrderModel.create(
        [
          {
            orderNumber,
            user: identity.userId,
            sessionId: identity.sessionId,
            customerId: customerRecord._id,
            items: orderItems,
            subtotal,
            shippingFee,
            tax,
            total,
            status: "pending",
            paymentStatus: "pending",
            paymentMethod: input.paymentMethod,
            customer: input.customer,
            shippingAddress: input.shippingAddress,
          },
        ],
        { session },
      );

      // Hold a reservation atomically per product, guarding against an
      // availability change between the check above and this write (e.g.
      // a concurrent order or an accepted quotation landing in between).
      // `stock` itself is untouched here — it only moves when the order
      // ships (see the "shipped" transition in
      // app/api/admin/store-orders/[id]/route.ts).
      for (const item of orderItems) {
        // $expr can only appear at the TOP level of a query document — it
        // cannot be nested inside $elemMatch (MongoDB rejects that with
        // "$expr can only be applied to the top-level document"). For the
        // variant case, the "does this specific variant have enough
        // available stock" check is instead expressed as a top-level $expr
        // that scans the variants array with $filter/$anyElementTrue.
        const result = item.variantSku
          ? await ProductModel.updateOne(
              {
                _id: item.product,
                $expr: {
                  $anyElementTrue: {
                    $map: {
                      input: "$variants",
                      as: "v",
                      in: {
                        $and: [
                          { $eq: ["$$v.sku", item.variantSku] },
                          { $gte: [{ $subtract: ["$$v.stock", "$$v.reserved"] }, item.quantity] },
                        ],
                      },
                    },
                  },
                },
              },
              // $inc bypasses the schema's pre-validate rollup hook (that
              // hook only runs on .save()), so the parent-level `reserved`
              // — which is supposed to be the sum across variants — has to
              // be incremented in the same atomic op or it drifts out of
              // sync with the variant it's tracking.
              { $inc: { "variants.$[v].reserved": item.quantity, reserved: item.quantity } },
              { session, arrayFilters: [{ "v.sku": item.variantSku }] },
            )
          : await ProductModel.updateOne(
              {
                _id: item.product,
                $expr: { $gte: [{ $subtract: ["$stock", "$reserved"] }, item.quantity] },
              },
              { $inc: { reserved: item.quantity } },
              { session },
            );

        if (result.matchedCount === 0) {
          throw new CartError(
            `"${item.name}"${item.size ? ` (${item.size})` : ""} went out of stock while placing your order`,
            409,
          );
        }
      }


      cart.items = [] as typeof cart.items;
      await cart.save({ session });

      createdOrder = order;
    });

    if (!createdOrder) {
      throw new CartError("Checkout failed", 500);
    }

    return createdOrder;
  } finally {
    await session.endSession();
  }
}