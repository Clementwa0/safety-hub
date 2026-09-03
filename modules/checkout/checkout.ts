import mongoose from "mongoose";
import { CartModel } from "@/lib/models/Cart";
import { ProductModel, type IProductVariant } from "@/lib/models/Product";
import { StoreOrderModel, type IStoreOrder, type IStoreOrderItem } from "@/lib/models/StoreOrder";
import { calculateShippingFee, calculateSubtotal, calculateTax, calculateTotal } from "@/modules/cart/pricing";
import { getNextOrderNumber } from "@/modules/checkout/order-number";
import type { CartIdentity } from "@/modules/cart/session";
import { CartError } from "@/modules/cart/cart";
import { findOrCreateCustomer } from "@/modules/customers/customers";
import { getSettings } from "@/lib/settings/get-settings.server";
import { InventoryError, reserveStock } from "@/modules/inventory/inventory.service";
import { resolveFinancialSettingsForMutation } from "@/modules/settings/financial-settings";
import { createNotification } from "@/modules/notifications/notifications.service";

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
  // page (see `MpesaPaymentCard`) - there is no STK push or automated
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
        // variantSku - resolve stock/reserved/price against that variant
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
        // pending/unshipped orders and accepted quotations - not raw
        // stock. Checkout no longer decrements `stock` directly (that now
        // only happens once an order actually ships, see
        // app/api/admin/store-orders/[id]/route.ts); it holds a
        // reservation instead, the same mechanism the B2B quotation flow
        // already uses (see modules/inventory/availability.ts).
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

        // Server reads the current price - the frontend's price is never trusted.
        const price = variant ? variant.price : product.price;
        const subtotal = Math.round(price * cartItem.quantity * 100) / 100;

        const productId = product._id as mongoose.Types.ObjectId;

        orderItems.push({
          product: productId,
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

      // Tax rate is read fresh from admin Settings on every checkout - never
      // hardcoded - so a rate of 0 (or any change) takes effect immediately.
      const settings = resolveFinancialSettingsForMutation(await getSettings());

      const subtotal = calculateSubtotal(orderItems.map((item) => ({ price: item.price, quantity: item.quantity })));
      const shippingFee = calculateShippingFee(subtotal);
      const tax = calculateTax(subtotal, settings.taxRate);
      const total = calculateTotal(subtotal, shippingFee, tax);

      const orderNumber = await getNextOrderNumber(session);

      // Matches/creates a CRM Customer record from the checkout details,
      // the same findOrCreateCustomer used by the Quotation/Order/Invoice
      // forms - so a storefront shopper shows up in the Customers list
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

      // The inventory service makes the availability check and reservation
      // one atomic operation. The earlier reads provide useful validation
      // messages; this remains the authoritative concurrency guard.
      for (const item of orderItems) {
        const productId = item.product;
        if (!productId) {
          throw new CartError(`"${item.name}" is missing the product reference required to reserve inventory`, 400);
        }

        try {
          await reserveStock({
            productId,
            variantSku: item.variantSku,
            quantity: item.quantity,
            session,
          });
        } catch (error) {
          if (!(error instanceof InventoryError) || error.code !== "INSUFFICIENT_STOCK") {
            throw error;
          }
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

    // Captured into a const so the narrowed (non-null) type survives the
    // function call below - TS re-widens a captured `let` back to its
    // declared type across a call expression, since the call could in
    // theory reach the `withTransaction` closure that reassigns it.
    const confirmedOrder: IStoreOrder = createdOrder;

    // Best-effort, fire-and-forget - mirrors the contact form's "never
    // block or fail the primary operation over a notification" approach
    // (see app/api/contact/route.ts). Intentionally not awaited: the
    // customer's order confirmation should never wait on this write, and
    // it happens after the transaction has already committed so a failure
    // here can never roll back a real order.
    const orderNotification = {
      type: "new_order" as const,
      title: "New order received",
      message: `Order #${confirmedOrder.orderNumber} from ${input.customer.name} - KSh ${confirmedOrder.total.toLocaleString()}`,
      link: `/sentinel/store-orders/${confirmedOrder._id}`,
      entity: "StoreOrder",
      entityId: String(confirmedOrder._id),
    };
    createNotification(orderNotification).catch((error) => {
      console.error("[checkout] Failed to create order notification:", error);
    });

    return confirmedOrder;
  } finally {
    await session.endSession();
  }
}
