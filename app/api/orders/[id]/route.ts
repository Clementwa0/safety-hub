import mongoose from "mongoose";
import { z } from "zod";
import type { NextRequest } from "next/server";
import { apiError, apiSuccess, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { OrderModel } from "@/lib/models/Order";
import { CustomerModel } from "@/lib/models/Customer";
import { requireStaff } from "@/lib/auth";
import { lineItemSchema, customerInputSchema } from "@/lib/schemas/sales";
import { findOrCreateCustomer } from "@/modules/customers/customers";
import { canDeleteOrderStatus, validateOrderStatusTransition } from "@/modules/orders/order-status";
import {
  areOrderItemsLocked,
  areOrderLineItemsUnchanged,
} from "@/modules/orders/order-line-items";
import {
  InventoryError,
  releaseReservation,
  shipReservedStock,
  shipStock,
} from "@/modules/inventory/inventory.service";

const orderSchema = z.object({
  customer: customerInputSchema.optional(),
  items: z.array(lineItemSchema).optional(),
  status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]).optional(),
  notes: z.string().trim().optional(),
  quotationId: z.string().trim().optional(),
  invoiceId: z.string().trim().optional(),
});

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireStaff();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { id } = await params;
    await connectToDatabase();
    const order = await OrderModel.findById(id).populate("customer").lean();

    if (!order) {
      return apiError("Order not found", [], 404);
    }

    return apiSuccess(serializeDoc(order), "Order loaded");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load order", [], 500);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireStaff();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = orderSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Validation failed", parsed.error.issues.map((issue) => issue.message), 400);
    }

    await connectToDatabase();

    // Resolve/create the customer up front — it doesn't touch stock, so it
    // doesn't need to be inside the transaction below.
    let resolvedCustomerId: mongoose.Types.ObjectId | string | undefined;
    if (parsed.data.customer) {
      if (typeof parsed.data.customer === "string") {
        const customer = await CustomerModel.findById(parsed.data.customer);
        if (!customer) {
          return apiError("Customer not found", [], 404);
        }
        resolvedCustomerId = customer._id as mongoose.Types.ObjectId;
      } else {
        const customer = await findOrCreateCustomer(parsed.data.customer);
        resolvedCustomerId = customer._id as mongoose.Types.ObjectId;
      }
    }

    const session = await mongoose.startSession();
    try {
      let updated: Awaited<ReturnType<typeof OrderModel.findById>> | null = null;

      await session.withTransaction(async () => {
        const order = await OrderModel.findById(id).session(session);
        if (!order) {
          throw new Error("__ORDER_NOT_FOUND__");
        }

        if (
          parsed.data.items &&
          areOrderItemsLocked(order.status) &&
          !areOrderLineItemsUnchanged(order.items, parsed.data.items)
        ) {
          throw new Error("__ITEMS_IMMUTABLE__Shipped and delivered order items cannot be changed");
        }

        if (
          parsed.data.quotationId !== undefined &&
          order.quotationId &&
          String(order.quotationId) !== parsed.data.quotationId
        ) {
          throw new Error("__REFERENCE__A converted order's quotation reference cannot be changed");
        }

        if (
          parsed.data.invoiceId !== undefined &&
          order.invoiceId &&
          String(order.invoiceId) !== parsed.data.invoiceId
        ) {
          throw new Error("__REFERENCE__An invoiced order's invoice reference cannot be changed");
        }

        if (parsed.data.status && parsed.data.status !== order.status) {
          const transitionError = validateOrderStatusTransition(order.status, parsed.data.status);
          if (transitionError) {
            throw new Error(`__TRANSITION__${transitionError}`);
          }

          const previousStatus = order.status;
          if (parsed.data.status === "shipped" && order.fulfillmentStatus && order.fulfillmentStatus !== "AVAILABLE") {
            throw new Error(`__FULFILLMENT__Cannot fulfill this order while inventory status is ${order.fulfillmentStatus}`);
          }
          order.status = parsed.data.status;

          // Stock actually leaves inventory here, at "shipped" — not when
          // the order is converted to an invoice (see
          // app/api/orders/[id]/convert-to-invoice/route.ts, which no
          // longer touches stock at all). Guarded by `stockDecremented`
          // so re-sending the same status can't double-decrement.
          if (parsed.data.status === "shipped" && !order.stockDecremented) {
            for (const item of order.items) {
              if (!item.productId) continue;
              const reservedQuantity = item.reservedQuantity ?? item.quantity;
              if (reservedQuantity <= 0) continue;

              if (order.reservedStock) {
                await shipReservedStock({
                  productId: item.productId,
                  variantSku: item.variantSku,
                  quantity: reservedQuantity,
                  movementType: "order_shipped",
                  reference: order.number,
                  session,
                });
              } else {
                await shipStock({
                  productId: item.productId,
                  variantSku: item.variantSku,
                  quantity: item.reservedQuantity ?? item.quantity,
                  movementType: "order_shipped",
                  reference: order.number,
                  session,
                });
              }
            }
            order.stockDecremented = true;
          }

          // Cancellation is only reachable before "shipped" (enforced by
          // validateOrderStatusTransition above), so `stock` was never
          // touched for this order — only a `reserved` hold (if any)
          // needs releasing. No Movement is logged: nothing actually
          // moved.
          if (parsed.data.status === "cancelled" && previousStatus !== "shipped" && order.reservedStock) {
            for (const item of order.items) {
              if (!item.productId) continue;
              const reservedQuantity = item.reservedQuantity ?? item.quantity;
              if (reservedQuantity <= 0) continue;
              try {
                await releaseReservation({
                  productId: item.productId,
                  variantSku: item.variantSku,
                  quantity: reservedQuantity,
                  session,
                });
              } catch (error) {
                // Cancellation is idempotent with respect to inventory: a
                // hold may already have been released by an earlier retry or
                // a legacy cleanup path. There is then nothing left to undo.
                // Keep strict errors (invalid quantity, missing product, and
                // so on) visible instead of masking real data problems.
                if (!(error instanceof InventoryError) || error.code !== "MISSING_RESERVATION") {
                  throw error;
                }
              }
            }
          }
        }

        if (parsed.data.items) {
          order.items = parsed.data.items;
        }
        if (parsed.data.notes !== undefined) {
          order.notes = parsed.data.notes;
        }
        if (parsed.data.quotationId !== undefined) {
          order.quotationId = parsed.data.quotationId;
        }
        if (parsed.data.invoiceId !== undefined) {
          order.invoiceId = parsed.data.invoiceId;
        }
        if (resolvedCustomerId) {
          order.customer = resolvedCustomerId;
        }

        await order.save({ session });
        updated = order;
      });

      if (!updated) {
        return apiError("Order not found", [], 404);
      }

      return apiSuccess(serializeDoc((updated as InstanceType<typeof OrderModel>).toObject()), "Order updated");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update order";

      if (message === "__ORDER_NOT_FOUND__") {
        return apiError("Order not found", [], 404);
      }
      if (message.startsWith("__TRANSITION__")) {
        return apiError(message.replace("__TRANSITION__", ""), [], 400);
      }
      if (message.startsWith("__FULFILLMENT__")) {
        return apiError(message.replace("__FULFILLMENT__", ""), [], 400);
      }
      if (message.startsWith("__ITEMS_IMMUTABLE__")) {
        return apiError(message.replace("__ITEMS_IMMUTABLE__", ""), [], 400);
      }
      if (message.startsWith("__REFERENCE__")) {
        return apiError(message.replace("__REFERENCE__", ""), [], 400);
      }

      return apiError(message, [], 500);
    } finally {
      await session.endSession();
    }
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update order", [], 500);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireStaff();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { id } = await params;
    await connectToDatabase();
    const order = await OrderModel.findById(id);

    if (!order) {
      return apiError("Order not found", [], 404);
    }

    if (!canDeleteOrderStatus(order.status)) {
      return apiError(
        "Historical orders cannot be deleted; keep the record for auditability and cancel/archive instead.",
        [],
        400,
      );
    }

    await OrderModel.deleteOne({ _id: order._id });
    return apiSuccess(null, "Order deleted");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete order", [], 500);
  }
}
