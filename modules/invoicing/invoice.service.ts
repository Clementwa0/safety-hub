import mongoose from "mongoose";

import { InvoiceModel, type IInvoice } from "@/lib/models/Invoice";
import { PaymentModel, type IPayment } from "@/lib/models/Payment";
import {
  calculateInvoiceBalance,
  calculateInvoiceTotals,
  calculatePaymentStatus,
  roundMoney,
  sumActivePayments,
  MONEY_EPSILON,
} from "./calculations";

/**
 * Server-side invoicing operations that touch money. Every function here
 * that mutates both a Payment and its Invoice runs inside a single
 * MongoDB/Mongoose transaction (`session.withTransaction`), so a failure
 * partway through — a validation error, a network blip, a concurrent
 * write conflict — rolls back everything instead of leaving the ledger
 * and the invoice out of sync.
 *
 * Errors are thrown as `Error`s whose `message` starts with a
 * `__TAG__` marker (matching the existing convention in
 * app/api/orders/[id]/route.ts), so the calling route can map them to
 * the right HTTP status without the transaction body needing to know
 * about `NextResponse` at all. `translateInvoiceServiceError` below does
 * that mapping in one place.
 */

export interface RecordPaymentInput {
  amount: number;
  method: "cash" | "mpesa";
  reference?: string;
  date?: Date;
  notes?: string;
}

export interface RecordPaymentResult {
  payment: IPayment;
  invoice: IInvoice;
}

/**
 * Records one payment against an invoice and updates the invoice's
 * amountPaid/status to match, atomically.
 *
 * Concurrency: the invoice is re-read *inside* the transaction (not
 * reused from any earlier read the caller may have done), and the
 * balance check happens against that fresh read. If two requests race
 * to pay the same invoice, MongoDB's transaction snapshot isolation
 * means the second transaction to commit hits a write conflict on the
 * invoice document; `session.withTransaction` retries it automatically,
 * and on retry it re-reads the now-updated amountPaid and correctly
 * rejects the payment if it would overpay. Two concurrent KES 70,000
 * payments against a KES 100,000 invoice can therefore never both
 * succeed — one lands, the other is rejected against the real remaining
 * balance of KES 30,000.
 */
export async function recordPayment(
  invoiceId: string,
  input: RecordPaymentInput,
  recordedBy: string | undefined,
): Promise<RecordPaymentResult> {
  const session = await mongoose.startSession();
  try {
    let result: RecordPaymentResult | null = null;

    await session.withTransaction(async () => {
      const invoice = await InvoiceModel.findById(invoiceId).session(session);
      if (!invoice) {
        throw new Error("__NOT_FOUND__Invoice not found");
      }

      if (invoice.status === "draft") {
        throw new Error("__INVALID_STATE__Draft invoices can't take payments - send the invoice first");
      }
      if (invoice.status === "cancelled") {
        throw new Error("__INVALID_STATE__Cancelled invoices can't take payments");
      }

      // Authoritative figures, computed server-side from the invoice's
      // own line items and its just-read amountPaid — never trust a
      // client-provided total/balance/status for this check.
      const total = calculateInvoiceTotals(invoice.items).total;
      const balance = calculateInvoiceBalance(total, invoice.amountPaid);

      if (input.amount - balance > MONEY_EPSILON) {
        throw new Error(
          `__OVERPAYMENT__Payment of ${input.amount} exceeds the outstanding balance of ${balance.toFixed(2)}`,
        );
      }

      const [payment] = await PaymentModel.create(
        [
          {
            invoiceId: invoice._id,
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

      // Clamped to `total` as a defensive floor, not because the guard
      // above can be beaten — it can't — but so a hypothetical future
      // caller of this function can never push amountPaid past total.
      invoice.amountPaid = roundMoney(Math.min(total, invoice.amountPaid + input.amount));
      invoice.status = calculatePaymentStatus(total, invoice.amountPaid);
      await invoice.save({ session });

      result = { payment, invoice };
    });

    if (!result) {
      throw new Error("__NOT_FOUND__Invoice not found");
    }
    return result;
  } finally {
    await session.endSession();
  }
}

export interface VoidPaymentResult {
  payment: IPayment;
  invoice: IInvoice;
}

/**
 * Voids a recorded payment (refund or correction) without ever deleting
 * it: the row stays in the ledger with `status: "voided"` plus who/when,
 * and the invoice's amountPaid/status are recalculated from scratch off
 * the remaining active payments — not by simply subtracting the voided
 * amount — so the invoice can never drift from what the ledger actually
 * shows. A `cancelled` invoice's status is left alone (voiding a payment
 * shouldn't silently un-cancel it).
 */
export async function voidPayment(
  invoiceId: string,
  paymentId: string,
  voidedBy: string | undefined,
  reason: string | undefined,
): Promise<VoidPaymentResult> {
  const session = await mongoose.startSession();
  try {
    let result: VoidPaymentResult | null = null;

    await session.withTransaction(async () => {
      const invoice = await InvoiceModel.findById(invoiceId).session(session);
      if (!invoice) {
        throw new Error("__NOT_FOUND__Invoice not found");
      }

      const payment = await PaymentModel.findOne({ _id: paymentId, invoiceId: invoice._id }).session(session);
      if (!payment) {
        throw new Error("__NOT_FOUND__Payment not found on this invoice");
      }
      if (payment.status === "voided") {
        throw new Error("__ALREADY_VOIDED__This payment has already been voided");
      }

      payment.status = "voided";
      payment.voidedAt = new Date();
      payment.voidedBy = voidedBy;
      payment.voidReason = reason;
      await payment.save({ session });

      // Recompute from the full ledger rather than subtracting this one
      // payment's amount, so amountPaid is always derived from what the
      // Payment collection actually shows, never accumulated drift.
      const remainingPayments = await PaymentModel.find({ invoiceId: invoice._id }).session(session).lean();
      const total = calculateInvoiceTotals(invoice.items).total;

      invoice.amountPaid = sumActivePayments(remainingPayments);
      if (invoice.status !== "cancelled") {
        invoice.status = calculatePaymentStatus(total, invoice.amountPaid);
      }
      await invoice.save({ session });

      result = { payment, invoice };
    });

    if (!result) {
      throw new Error("__NOT_FOUND__Invoice not found");
    }
    return result;
  } finally {
    await session.endSession();
  }
}

/**
 * Deletes an invoice, but only when it's safe to physically remove:
 * still a draft (never a real financial document) AND has no Payment
 * rows recorded against it (defensive - the payments route already
 * blocks recording a payment on a draft invoice, so this should always
 * be zero, but the check runs anyway so a hard delete can never silently
 * orphan a ledger row). Any issued invoice (unpaid, partially_paid,
 * paid, overdue, cancelled) is rejected outright - callers should
 * cancel it instead (PATCH status: "cancelled"), which keeps the
 * invoice and its full payment history intact. The check and the delete
 * happen inside one transaction so nothing can be recorded against the
 * invoice in the gap between them.
 */
export async function deleteDraftInvoice(invoiceId: string): Promise<void> {
  const session = await mongoose.startSession();
  try {
    let deleted = false;

    await session.withTransaction(async () => {
      const invoice = await InvoiceModel.findById(invoiceId).session(session);
      if (!invoice) {
        throw new Error("__NOT_FOUND__Invoice not found");
      }

      if (invoice.status !== "draft") {
        throw new Error(
          "__ISSUED__Issued invoices can't be deleted - cancel the invoice instead to preserve its financial history.",
        );
      }

      const paymentCount = await PaymentModel.countDocuments({ invoiceId: invoice._id }).session(session);
      if (paymentCount > 0) {
        throw new Error(
          "__HAS_PAYMENTS__This invoice has recorded payments and can't be deleted - cancel it instead.",
        );
      }

      await InvoiceModel.deleteOne({ _id: invoice._id }).session(session);
      deleted = true;
    });

    if (!deleted) {
      throw new Error("__NOT_FOUND__Invoice not found");
    }
  } finally {
    await session.endSession();
  }
}

/**
 * Maps the `__TAG__message` errors thrown above to an HTTP status. Kept
 * here (rather than duplicated in every route) so both the payments
 * route and the void route stay in sync if a new error tag is added.
 */
export function translateInvoiceServiceError(error: unknown): { message: string; status: number } {
  const message = error instanceof Error ? error.message : "Operation failed";

  if (message.startsWith("__NOT_FOUND__")) {
    return { message: message.replace("__NOT_FOUND__", ""), status: 404 };
  }
  if (message.startsWith("__INVALID_STATE__")) {
    return { message: message.replace("__INVALID_STATE__", ""), status: 400 };
  }
  if (message.startsWith("__OVERPAYMENT__")) {
    return { message: message.replace("__OVERPAYMENT__", ""), status: 400 };
  }
  if (message.startsWith("__ALREADY_VOIDED__")) {
    return { message: message.replace("__ALREADY_VOIDED__", ""), status: 400 };
  }

  return { message, status: 500 };
}
