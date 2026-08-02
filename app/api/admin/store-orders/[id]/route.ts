import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { apiError, apiSuccess, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { StoreOrderModel } from "@/lib/models/StoreOrder";
import { ProductModel } from "@/lib/models/Product";
import { requireAdmin } from "@/lib/auth";
import { updateStoreOrderSchema } from "@/lib/storefront/validation";
import { validateStatusTransition } from "@/lib/storefront/order-status";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireAdmin();
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
    const user = await requireAdmin();
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

          order.status = parsed.data.status;

          // Restore stock exactly once when an order is cancelled.
          if (parsed.data.status === "cancelled" && !order.stockRestored) {
            for (const item of order.items) {
              if (!item.product) continue;
              await ProductModel.updateOne(
                { _id: item.product },
                { $inc: { stock: item.quantity } },
                { session },
              );
            }
            order.stockRestored = true;
          }
        }

        if (parsed.data.paymentStatus) {
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
