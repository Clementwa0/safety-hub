import mongoose from "mongoose";
import { CartModel } from "@/lib/models/Cart";
import { ProductModel } from "@/lib/models/Product";
import { StoreOrderModel, type IStoreOrder, type IStoreOrderItem } from "@/lib/models/StoreOrder";
import { calculateShippingFee, calculateSubtotal, calculateTax, calculateTotal } from "@/lib/storefront/pricing";
import { getNextOrderNumber } from "@/lib/storefront/order-number";
import type { CartIdentity } from "@/lib/storefront/session";
import { CartError } from "@/lib/storefront/cart";

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
        if (cartItem.quantity > product.stock) {
          throw new CartError(
            product.stock > 0
              ? `Only ${product.stock} unit(s) of "${product.name}" are in stock`
              : `"${product.name}" is out of stock`,
            400,
          );
        }

        // Server reads the current price — the frontend's price is never trusted.
        const price = product.price;
        const subtotal = Math.round(price * cartItem.quantity * 100) / 100;

        orderItems.push({
          product: product._id as mongoose.Types.ObjectId,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          image: product.image,
          price,
          quantity: cartItem.quantity,
          subtotal,
        });
      }

      const subtotal = calculateSubtotal(orderItems.map((item) => ({ price: item.price, quantity: item.quantity })));
      const shippingFee = calculateShippingFee(subtotal);
      const tax = calculateTax(subtotal);
      const total = calculateTotal(subtotal, shippingFee, tax);

      const orderNumber = await getNextOrderNumber(session);

      const [order] = await StoreOrderModel.create(
        [
          {
            orderNumber,
            user: identity.userId,
            sessionId: identity.sessionId,
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

      // Reduce stock atomically per product, guarding against a stock change
      // between the check above and this write (e.g. a concurrent order).
      for (const item of orderItems) {
        const result = await ProductModel.updateOne(
          { _id: item.product, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { session },
        );

        if (result.matchedCount === 0) {
          throw new CartError(`"${item.name}" went out of stock while placing your order`, 409);
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