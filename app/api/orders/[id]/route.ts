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
import {
  canDeleteOrderStatus,
  canMutateCommercialReference,
  validateOrderStatusTransition,
} from "@/modules/orders/order-status";
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
import { reconcileOrderInventory } from "@/modules/inventory/order-reservations";
import {
  assertInvoiceBelongsToCustomer,
  assertQuotationBelongsToCustomer,
  CommercialReferenceError,
} from "@/modules/orders/commercial-references";
import { recordAuditEvent } from "@/modules/audit/audit.service";

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

        const before = {
          status: order.status,
          notes: order.notes,
          customer: String(order.customer),
          quotationId: order.quotationId ? String(order.quotationId) : undefined,
          invoiceId: order.invoiceId ? String(order.invoiceId) : undefined,
        };

        if (
          parsed.data.items &&
          areOrderItemsLocked(order.status) &&
          !areOrderLineItemsUnchanged(order.items, parsed.data.items)
        ) {
          throw new Error("__ITEMS_IMMUTABLE__Shipped and delivered order items cannot be changed");
        }

        if (
          parsed.data.quotationId !== undefined &&
          !canMutateCommercialReference(
            order.quotationId ? String(order.quotationId) : undefined,
            parsed.data.quotationId,
          )
        ) {
          throw new Error("__REFERENCE_CONFLICT__A converted order's quotation reference cannot be changed");
        }

        if (
          parsed.data.invoiceId !== undefined &&
          !canMutateCommercialReference(
            order.invoiceId ? String(order.invoiceId) : undefined,
            parsed.data.invoiceId,
          )
        ) {
          throw new Error("__REFERENCE_CONFLICT__An invoiced order's invoice reference cannot be changed");
        }

        // The customer this order will end up with once this PATCH
        // applies — the just-resolved new customer if one was sent,
        // otherwise the order's existing customer. Any quotation/invoice
        // link (new or already established) must agree with this value:
        // a link whose own customer doesn't match would make the order
        // traceable to the wrong commercial history.
        const effectiveCustomerId = resolvedCustomerId ?? order.customer;

        // A quotationId/invoiceId being set on this order for the first
        // time must reference a real document that belongs to the same
        // customer as this order — otherwise a staff member (or a buggy
        // client) could link an order to someone else's quotation or
        // invoice.
        if (parsed.data.quotationId !== undefined && !order.quotationId) {
          try {
            await assertQuotationBelongsToCustomer(parsed.data.quotationId, effectiveCustomerId, session);
          } catch (error) {
            if (error instanceof CommercialReferenceError) {
              throw new Error(`__REFERENCE_INVALID_${error.status}__${error.message}`);
            }
            throw error;
          }
        }
        if (parsed.data.invoiceId !== undefined && !order.invoiceId) {
          try {
            await assertInvoiceBelongsToCustomer(parsed.data.invoiceId, effectiveCustomerId, session);
          } catch (error) {
            if (error instanceof CommercialReferenceError) {
              throw new Error(`__REFERENCE_INVALID_${error.status}__${error.message}`);
            }
            throw error;
          }
        }

        // A customer change on an order that's already linked to a
        // quotation/invoice must not silently detach it from that
        // link's real customer — the two have to keep agreeing.
        if (resolvedCustomerId && (order.quotationId || order.invoiceId)) {
          try {
            if (order.quotationId) {
              await assertQuotationBelongsToCustomer(String(order.quotationId), resolvedCustomerId, session);
            }
            if (order.invoiceId) {
              await assertInvoiceBelongsToCustomer(String(order.invoiceId), resolvedCustomerId, session);
            }
          } catch (error) {
            if (error instanceof CommercialReferenceError) {
              throw new Error(
                "__REFERENCE_INVALID_409__Cannot change customer: this order is linked to a quotation/invoice for a different customer",
              );
            }
            throw error;
          }
        }

        // Reconcile inventory reservations for the new line items BEFORE
        // any status transition below runs, so that a simultaneous
        // ship/cancel in this same request sees up-to-date
        // `reservedQuantity` values rather than the pre-edit snapshot.
        // Legacy orders that never placed a reservation (`reservedStock`
        // false) are passed through unchanged — there is no hold to
        // reconcile and nothing to touch.
        if (parsed.data.items) {
          if (order.reservedStock) {
            const reservedByIndex = await reconcileOrderInventory(order.items, parsed.data.items, session);
            order.items = parsed.data.items.map((item, index) => ({
              ...item,
              reservedQuantity: reservedByIndex.get(index),
            }));

            const fullyAvailable = order.items.every(
              (item) => !item.productId || (item.reservedQuantity ?? 0) >= item.quantity,
            );
            const partiallyAvailable = order.items.some(
              (item) => item.productId && (item.reservedQuantity ?? 0) > 0 && (item.reservedQuantity ?? 0) < item.quantity,
            );
            order.fulfillmentStatus = fullyAvailable
              ? "AVAILABLE"
              : partiallyAvailable
                ? "PARTIALLY_AVAILABLE"
                : "BACKORDERED";
          } else {
            order.items = parsed.data.items;
          }
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

        const after = {
          status: order.status,
          notes: order.notes,
          customer: String(order.customer),
          quotationId: order.quotationId ? String(order.quotationId) : undefined,
          invoiceId: order.invoiceId ? String(order.invoiceId) : undefined,
        };
        if (JSON.stringify(before) !== JSON.stringify(after)) {
          await recordAuditEvent(
            {
              actor: user.name || user.email || "system",
              action: "order_mutated",
              entity: "Order",
              entityId: String(order._id),
              metadata: { before, after },
            },
            session,
          );
        }
      });

      if (!updated) {
        return apiError("Order not found", [], 404);
      }

      return apiSuccess(serializeDoc((updated as InstanceType<typeof OrderModel>).toObject()), "Order updated");
    } catch (error) {
      if (error instanceof InventoryError) {
        // A domain-level inventory failure (e.g. insufficient available
        // stock for a requested increase) — not a server bug, so this is
        // reported as a client-facing conflict/validation error rather
        // than a 500. The transaction has already been rolled back by
        // `session.withTransaction`, so no partial reservation change
        // remains.
        const status = error.code === "INSUFFICIENT_STOCK" ? 409 : 400;
        return apiError(error.message, [], status);
      }

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
      if (message.startsWith("__REFERENCE_CONFLICT__")) {
        return apiError(message.replace("__REFERENCE_CONFLICT__", ""), [], 409);
      }
      const invalidReferenceMatch = message.match(/^__REFERENCE_INVALID_(\d+)__([\s\S]*)$/);
      if (invalidReferenceMatch) {
        return apiError(invalidReferenceMatch[2], [], Number(invalidReferenceMatch[1]));
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
    await recordAuditEvent({
      actor: user.name || user.email || "system",
      action: "order_mutated",
      entity: "Order",
      entityId: String(order._id),
      metadata: { deleted: true, status: order.status, number: order.number },
    });
    return apiSuccess(null, "Order deleted");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete order", [], 500);
  }
}
