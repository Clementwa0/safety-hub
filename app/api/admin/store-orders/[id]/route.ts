import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { apiError, apiSuccess, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { StoreOrderModel, type IStoreOrder } from "@/lib/models/StoreOrder";
import { requireStaff } from "@/lib/auth";
import { updateStoreOrderSchema } from "@/modules/checkout/validation";
import { validateStatusTransition } from "@/modules/checkout/order-status";
import { validatePaymentStatusTransition } from "@/modules/checkout/payment-status";
import { releaseReservation, shipReservedStock } from "@/modules/inventory/inventory.service";
import { recordAuditEvent } from "@/modules/audit/audit.service";
import {
  recordStoreOrderPayment,
  refundStoreOrderPayment,
  translateStoreOrderPaymentError,
} from "@/modules/payments/store-order-payment.service";
import { PaymentModel } from "@/lib/models/Payment";
import { sumActivePayments, calculateInvoiceBalance } from "@/modules/invoicing/calculations";

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

    const actorName = user.name || user.email || undefined;

    // A transition to "paid" or "refunded" actually moves money and must
    // go through the Payment ledger (modules/payments/store-order-payment.service.ts)
    // rather than a bare field assignment — that's what gives it a
    // ledger row, overpayment/duplicate-reference protection, and an
    // audit trail. "pending"/"failed" don't move money (a payment
    // attempt that hasn't landed or didn't go through), so those still
    // flow through as a direct status field update below. This does mean
    // a request that changes BOTH `status` and `paymentStatus: "paid"`
    // in one call runs as two separate transactions rather than one —
    // an acceptable trade-off for keeping the ledger's own invariants
    // (overpayment/duplicate-reference checks re-read fresh state) in
    // one well-tested place rather than duplicating them inline here.
    const wantsPaymentLedger =
      parsed.data.paymentStatus === "paid" || parsed.data.paymentStatus === "refunded";

    const session = await mongoose.startSession();
    try {
      let updated: IStoreOrder | null = null;

      await session.withTransaction(async () => {
        const order = await StoreOrderModel.findById(id).session(session);
        if (!order) {
          throw new Error("__ORDER_NOT_FOUND__");
        }

        const before = { status: order.status, paymentStatus: order.paymentStatus };

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

              await shipReservedStock({
                productId: item.product,
                variantSku: item.variantSku,
                quantity: item.quantity,
                movementType: "store_order_shipped",
                reference: order.orderNumber,
                session,
              });
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
              await releaseReservation({
                productId: item.product,
                variantSku: item.variantSku,
                quantity: item.quantity,
                session,
              });
            }
          }
        }

        // "pending"/"failed" only — "paid"/"refunded" are handled after
        // this transaction commits, via the Payment ledger (see above).
        if (
          parsed.data.paymentStatus &&
          !wantsPaymentLedger &&
          parsed.data.paymentStatus !== order.paymentStatus
        ) {
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

        const after = { status: order.status, paymentStatus: order.paymentStatus };
        if (before.status !== after.status || before.paymentStatus !== after.paymentStatus) {
          await recordAuditEvent(
            {
              actor: actorName ?? "system",
              action: "store_order_mutated",
              entity: "StoreOrder",
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

      let committedOrder: IStoreOrder = updated;

      // Money-moving payment transitions run as their own transaction,
      // against the just-committed order, so the ledger's overpayment
      // and duplicate-reference checks always see fresh state.
      if (wantsPaymentLedger) {
        if (parsed.data.paymentStatus === "paid") {
          if (committedOrder.paymentStatus !== "paid") {
            const existingPayments = await PaymentModel.find({ storeOrderId: committedOrder._id }).lean();
            const alreadyPaid = sumActivePayments(existingPayments);
            const balance = calculateInvoiceBalance(committedOrder.total, alreadyPaid);
            const amount = parsed.data.paymentAmount ?? balance;

            const { order: paidOrder } = await recordStoreOrderPayment(
              id,
              {
                amount,
                method: committedOrder.paymentMethod,
                reference: parsed.data.paymentReference,
                notes: parsed.data.paymentNotes,
              },
              actorName,
              user.role === "admin" || user.role === "staff" ? user.role : "customer",
            );
            committedOrder = paidOrder;
          }
        } else {
          const { order: refundedOrder } = await refundStoreOrderPayment(
            id,
            undefined,
            actorName,
            parsed.data.refundReason,
            user.role === "admin" || user.role === "staff" ? user.role : "customer",
          );
          committedOrder = refundedOrder;
        }
      }

      return apiSuccess(serializeDoc(committedOrder.toObject()), "Order updated");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update order";

      if (message === "__ORDER_NOT_FOUND__") {
        return apiError("Order not found", [], 404);
      }
      if (message.startsWith("__TRANSITION__")) {
        return apiError(message.replace("__TRANSITION__", ""), [], 400);
      }
      if (
        message.startsWith("__NOT_FOUND__") ||
        message.startsWith("__INVALID_STATE__") ||
        message.startsWith("__OVERPAYMENT__") ||
        message.startsWith("__ALREADY_VOIDED__") ||
        message.startsWith("__DUPLICATE_REFERENCE__")
      ) {
        const { message: translated, status } = translateStoreOrderPaymentError(error);
        return apiError(translated, [], status);
      }

      return apiError(message, [], 500);
    } finally {
      await session.endSession();
    }
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update order", [], 500);
  }
}
