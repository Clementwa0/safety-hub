import mongoose from "mongoose";

import { StoreOrderModel, type IStoreOrder } from "@/lib/models/StoreOrder";
import { PaymentModel, type IPayment } from "@/lib/models/Payment";
import { recordAuditEvent } from "@/modules/audit/audit.service";
import { isDuplicateKeyErrorOn } from "@/lib/db/document-number";
import { validatePaymentStatusTransition } from "@/modules/checkout/payment-status";
import {
  assertPaymentMutationAuthorized,
  translateInvoiceServiceError,
  type PaymentMutationRole,
} from "@/modules/invoicing/invoice.service";
import {
  calculateInvoiceBalance,
  roundMoney,
  sumActivePayments,
  MONEY_EPSILON,
} from "@/modules/invoicing/calculations";

/**
 * Server-side payment operations for storefront orders (`StoreOrder`).
 *
 * Before this module, `StoreOrder.paymentStatus` was a bare mutable
 * field staff flipped by hand from the admin panel (PATCH
 * /api/admin/store-orders/[id]) with no ledger behind it at all — no
 * amount, no reference, no history, no protection against recording the
 * same M-Pesa transaction twice or "paying" more than the order is
 * worth. This mirrors modules/invoicing/invoice.service.ts's
 * transactional pattern (and reuses its authorization check and error-
 * tag translation) so B2B invoices and storefront orders are backed by
 * the exact same kind of Payment ledger rather than two different
 * levels of rigor.
 *
 * Known limitation: unlike Invoice, StoreOrder has no "partially_paid"
 * lifecycle status (see StorePaymentStatus in lib/models/StoreOrder.ts)
 * — storefront orders are paid in full at checkout or on delivery, not
 * in installments. A payment that doesn't bring the ledger to the full
 * order total is still recorded (so the ledger stays honest about what
 * was actually collected) but leaves `paymentStatus` at its current
 * value rather than inventing a fourth "partial" state the rest of the
 * storefront UI doesn't understand.
 */

export type StoreOrderPaymentMethod = "cash" | "mpesa" | "cod";

export interface RecordStoreOrderPaymentInput {
  amount: number;
  method: StoreOrderPaymentMethod;
  reference?: string;
  date?: Date;
  notes?: string;
}

export interface RecordStoreOrderPaymentResult {
  payment: IPayment;
  order: IStoreOrder;
}

/**
 * Records one payment against a storefront order and, once the ledger
 * covers the order's full total, marks it paid — atomically, inside a
 * single MongoDB transaction so the Payment row and the order's
 * paymentStatus can never end up out of sync with each other.
 *
 * Concurrency: mirrors recordPayment in invoice.service.ts — the order
 * is re-read *inside* the transaction and the balance check happens
 * against that fresh read, so two concurrent payments against the same
 * order can never both push it past its total.
 */
export async function recordStoreOrderPayment(
  orderId: string,
  input: RecordStoreOrderPaymentInput,
  recordedBy: string | undefined,
  actorRole: PaymentMutationRole | "customer" = "admin",
): Promise<RecordStoreOrderPaymentResult> {
  assertPaymentMutationAuthorized(actorRole, "record");

  const session = await mongoose.startSession();
  try {
    let result: RecordStoreOrderPaymentResult | null = null;

    await session.withTransaction(async () => {
      const order = await StoreOrderModel.findById(orderId).session(session);
      if (!order) {
        throw new Error("__NOT_FOUND__Store order not found");
      }
      if (order.status === "cancelled") {
        throw new Error("__INVALID_STATE__Cancelled orders can't take payments");
      }
      if (order.paymentStatus === "refunded") {
        throw new Error("__INVALID_STATE__A refunded order can't take further payments");
      }

      const existingPayments = await PaymentModel.find({ storeOrderId: order._id })
        .session(session)
        .lean();
      const alreadyPaid = sumActivePayments(existingPayments);
      const balance = calculateInvoiceBalance(order.total, alreadyPaid);

      if (input.amount - balance > MONEY_EPSILON) {
        throw new Error(
          `__OVERPAYMENT__Payment of ${input.amount} exceeds the outstanding balance of ${balance.toFixed(2)}`,
        );
      }

      let payment: IPayment;
      try {
        [payment] = await PaymentModel.create(
          [
            {
              storeOrderId: order._id,
              amount: input.amount,
              method: input.method,
              reference: input.reference,
              date: input.date ?? new Date(),
              recordedBy,
              notes: input.notes,
              status: "recorded",
            },
          ],
          { session },
        );
      } catch (error) {
        if (isDuplicateKeyErrorOn(error, "reference")) {
          throw new Error(
            `__DUPLICATE_REFERENCE__A payment with reference "${input.reference}" has already been recorded`,
          );
        }
        throw error;
      }

      const totalPaid = roundMoney(alreadyPaid + input.amount);
      if (totalPaid >= roundMoney(order.total) - MONEY_EPSILON) {
        const transitionError = validatePaymentStatusTransition(order.paymentStatus, "paid");
        if (!transitionError) {
          order.paymentStatus = "paid";
        }
      }
      await order.save({ session });

      result = { payment, order };

      await recordAuditEvent(
        {
          actor: recordedBy ?? "system",
          action: "payment_recorded",
          entity: "StoreOrder",
          entityId: String(order._id),
          metadata: {
            storeOrderId: String(order._id),
            paymentId: String(payment._id),
            amount: payment.amount,
            method: payment.method,
          },
        },
        session,
      );
    });

    if (!result) {
      throw new Error("__NOT_FOUND__Store order not found");
    }
    return result;
  } finally {
    await session.endSession();
  }
}

export interface RefundStoreOrderPaymentResult {
  payments: IPayment[];
  order: IStoreOrder;
}

/**
 * Refunds/reverses recorded storefront payment(s) without ever deleting
 * them: each row stays in the ledger with `status: "voided"` plus
 * who/when/why, exactly like invoice.service.ts#voidPayment. If the
 * order had reached "paid", it moves to "refunded" — the only allowed
 * exit from "paid" (see modules/checkout/payment-status.ts) — since a
 * paid order can never silently drift back to looking unpaid through
 * this operation. An order that hadn't yet reached "paid" (a partial,
 * not-yet-complete payment being corrected) keeps its current
 * paymentStatus; only the ledger entry/entries are voided.
 *
 * When `paymentId` is omitted, every currently-active payment recorded
 * against the order is voided — this backs the admin panel's simple
 * "mark refunded" action, where staff refund the order as a whole
 * rather than picking one specific ledger row. Pass an explicit
 * `paymentId` to void just that one entry (e.g. correcting a single
 * erroneous payment on an order with several).
 */
export async function refundStoreOrderPayment(
  orderId: string,
  paymentId: string | undefined,
  voidedBy: string | undefined,
  reason: string | undefined,
  actorRole: PaymentMutationRole | "customer" = "admin",
): Promise<RefundStoreOrderPaymentResult> {
  assertPaymentMutationAuthorized(actorRole, "void");

  const session = await mongoose.startSession();
  try {
    let result: RefundStoreOrderPaymentResult | null = null;

    await session.withTransaction(async () => {
      const order = await StoreOrderModel.findById(orderId).session(session);
      if (!order) {
        throw new Error("__NOT_FOUND__Store order not found");
      }

      const targets = paymentId
        ? await PaymentModel.find({ _id: paymentId, storeOrderId: order._id }).session(session)
        : await PaymentModel.find({ storeOrderId: order._id, status: "recorded" }).session(session);

      if (paymentId && targets.length === 0) {
        throw new Error("__NOT_FOUND__Payment not found on this order");
      }
      if (paymentId && targets[0].status === "voided") {
        throw new Error("__ALREADY_VOIDED__This payment has already been refunded");
      }
      // A "refund the whole order" call (no explicit paymentId) that
      // finds no active ledger rows is NOT an error: an order marked
      // "paid" before this ledger existed has nothing recorded against
      // it to void. The status transition below still applies — the
      // audit entry that follows notes the missing ledger history
      // rather than silently pretending a payment was voided.

      for (const payment of targets) {
        payment.status = "voided";
        payment.voidedAt = new Date();
        payment.voidedBy = voidedBy;
        payment.voidReason = reason;
        await payment.save({ session });
      }

      if (order.paymentStatus === "paid") {
        const transitionError = validatePaymentStatusTransition(order.paymentStatus, "refunded");
        if (!transitionError) {
          order.paymentStatus = "refunded";
        }
      }
      await order.save({ session });

      result = { payments: targets, order };

      if (targets.length === 0) {
        // No ledger rows existed to void (a legacy paid order predating
        // this ledger) — still record that a refund/status-reset was
        // performed, so the audit trail doesn't go silent just because
        // there was nothing to void.
        await recordAuditEvent(
          {
            actor: voidedBy ?? "system",
            action: "payment_refunded",
            entity: "StoreOrder",
            entityId: String(order._id),
            metadata: {
              storeOrderId: String(order._id),
              paymentId: null,
              reason: reason ?? null,
              note: "No ledger entries existed for this order; status reset only",
            },
          },
          session,
        );
      }

      for (const payment of targets) {
        await recordAuditEvent(
          {
            actor: voidedBy ?? "system",
            action: "payment_refunded",
            entity: "StoreOrder",
            entityId: String(order._id),
            metadata: {
              storeOrderId: String(order._id),
              paymentId: String(payment._id),
              reason: reason ?? null,
              amount: payment.amount,
            },
          },
          session,
        );
      }
    });

    if (!result) {
      throw new Error("__NOT_FOUND__Store order not found");
    }
    return result;
  } finally {
    await session.endSession();
  }
}

/** Same error-tag vocabulary as modules/invoicing/invoice.service.ts — reuse its translator. */
export const translateStoreOrderPaymentError = translateInvoiceServiceError;
