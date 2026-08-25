import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { apiError, apiSuccess, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { StoreOrderModel } from "@/lib/models/StoreOrder";
import { ProductModel } from "@/lib/models/Product";
import { requireStaff } from "@/lib/auth";
import { updateStoreOrderSchema } from "@/modules/checkout/validation";
import { validateStatusTransition } from "@/modules/checkout/order-status";
import { validatePaymentStatusTransition } from "@/modules/checkout/payment-status";
import { recordMovement } from "@/modules/inventory/movements";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireStaff();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return apiError("Invalid order id", [], 400);
    }

    await connectToDatabase();
    const order = await StoreOrderModel.findById(id).lean();

    if (!order) {
      return apiError("Order not found", [], 404);
    }

    return apiSuccess(serializeDoc(order), "Order loaded");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load order", [], 500);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireStaff();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return apiError("Invalid order id", [], 400);
    }

    const body = await request.json().catch(() => null);
    const parsed = updateStoreOrderSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validation failed", parsed.error.issues.map((issue) => issue.message), 400);
    }

    await connectToDatabase();

    const session = await mongoose.startSession();
    try {
      let updated: Awaited<ReturnType<typeof StoreOrderModel.findById>> | null = null;

      await session.withTransaction(async () => {
        const order = await StoreOrderModel.findById(id).session(session);
        if (!order) {
          throw new Error("__ORDER_NOT_FOUND__");
        }

        if (parsed.data.status && parsed.data.status !== order.status) {
          const transitionError = validateStatusTransition(order.status, parsed.data.status);
          if (transitionError) {
            throw new Error(`__TRANSITION__${transitionError}`);
          }

          const previousStatus = order.status;
          order.status = parsed.data.status;

          // Stock actually leaves inventory here, at "shipped" — not at
          // checkout (see performCheckout in modules/checkout/checkout.ts,
          // which only places a `reserved` hold) and not at any other
          // status change. Guarded by `stockDecremented` so re-saving or
          // re-sending the same status can't double-decrement.
          if (parsed.data.status === "shipped" && !order.stockDecremented) {
            for (const item of order.items) {
              if (!item.product) continue;

              const updatedProduct = await ProductModel.findOneAndUpdate(
                { _id: item.product },
                item.variantSku
                  ? {
                      $inc: {
                        "variants.$[v].stock": -item.quantity,
                        "variants.$[v].reserved": -item.quantity,
                        stock: -item.quantity,
                        reserved: -item.quantity,
                      },
                    }
                  : { $inc: { stock: -item.quantity, reserved: -item.quantity } },
                {
                  session,
                  returnDocument: "after",
                  arrayFilters: item.variantSku ? [{ "v.sku": item.variantSku }] : undefined,
                },
              );

              if (updatedProduct) {
                await recordMovement({
                  productId: item.product,
                  type: "store_order_shipped",
                  delta: -item.quantity,
                  resultingStock: updatedProduct.stock,
                  reference: order.orderNumber,
                  session,
                });
              }
            }
            order.stockDecremented = true;
          }

          // Cancellation is only reachable before "shipped" (enforced by
          // validateStatusTransition above), so `stock` was never touched
          // for this order — only the checkout-time reservation needs
          // releasing. No Movement is logged: nothing actually moved.
          if (parsed.data.status === "cancelled" && previousStatus !== "shipped") {
            for (const item of order.items) {
              if (!item.product) continue;
              await ProductModel.updateOne(
                { _id: item.product },
                item.variantSku
                  ? { $inc: { "variants.$[v].reserved": -item.quantity, reserved: -item.quantity } }
                  : { $inc: { reserved: -item.quantity } },
                {
                  session,
                  arrayFilters: item.variantSku ? [{ "v.sku": item.variantSku }] : undefined,
                },
              );
            }
          }
        }

        if (parsed.data.paymentStatus && parsed.data.paymentStatus !== order.paymentStatus) {
          const paymentTransitionError = validatePaymentStatusTransition(
            order.paymentStatus,
            parsed.data.paymentStatus,
          );
          if (paymentTransitionError) {
            throw new Error(`__TRANSITION__${paymentTransitionError}`);
          }

          order.paymentStatus = parsed.data.paymentStatus;
        }

        await order.save({ session });
        updated = order;
      });

      if (!updated) {
        return apiError("Order not found", [], 404);
      }

      return apiSuccess(serializeDoc((updated as InstanceType<typeof StoreOrderModel>).toObject()), "Order updated");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update order";

      if (message === "__ORDER_NOT_FOUND__") {
        return apiError("Order not found", [], 404);
      }
      if (message.startsWith("__TRANSITION__")) {
        return apiError(message.replace("__TRANSITION__", ""), [], 400);
      }

      return apiError(message, [], 500);
    } finally {
      await session.endSession();
    }
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update order", [], 500);
  }
}
