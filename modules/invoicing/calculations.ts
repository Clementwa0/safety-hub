import type {
  InvoiceTotals,
  LedgerPayment,
  MoneyLineItem,
  PaymentDerivedStatus,
} from "./types";

/**
 * ONE SOURCE OF TRUTH for invoice/payment money math.
 *
 * Before this module, the same gross → discount → tax → total formula was
 * copy-pasted in three places (lib/sales.ts#computeTotals,
 * app/api/invoices/[id]/payments/route.ts#invoiceTotal, and
 * modules/analytics/sales-dashboard.ts#total), each commented "must stay
 * identical to the others - if one changes, so must the rest". That's
 * exactly the kind of duplication that silently drifts. Every one of
 * those call sites now delegates here instead.
 *
 * A tolerance for floating-point comparisons ("is this payment within a
 * cent of the balance") and for output rounding, in KES. Money is never
 * meaningfully precise below a cent, so this both absorbs float drift
 * (0.1 + 0.2 !== 0.3) and gives every caller the same rounding rule
 * instead of each inventing its own EPSILON.
 */
export const MONEY_EPSILON = 0.01;

/**
 * Rounds a monetary value to 2 decimal places (cents), passing through
 * `Number.EPSILON` first so values like 1.005 round the way a person
 * would expect instead of falling on the wrong side of a binary
 * floating-point representation.
 */
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * One line item's total after its own discount (before tax). Matches the
 * per-line math every call site already used: gross → subtract discount
 * → floor at zero.
 */
export function calculateLineItemTotal(item: MoneyLineItem): number {
  const gross = item.quantity * item.unitPrice;
  const discounted = gross - gross * (item.discount / 100);
  return roundMoney(Math.max(0, discounted));
}

/**
 * Computes subtotal/discount/tax/total for a full set of line items.
 * Summation happens in full float precision across all lines (matching
 * the previous behavior everywhere) and is rounded to the cent only once,
 * on the way out - rounding per-line first would compound error over an
 * invoice with many lines instead of cancelling it out.
 */
export function calculateInvoiceTotals(items: MoneyLineItem[]): InvoiceTotals {
  let subtotal = 0;
  let discount = 0;
  let tax = 0;

  for (const item of items) {
    const gross = item.quantity * item.unitPrice;
    const disc = gross * (item.discount / 100);
    const net = Math.max(0, gross - disc);
    subtotal += gross;
    discount += disc;
    tax += net * (item.taxRate / 100);
  }

  const total = subtotal - discount + tax;

  return {
    subtotal: roundMoney(subtotal),
    discount: roundMoney(discount),
    tax: roundMoney(tax),
    total: roundMoney(total),
  };
}

/** Just the tax portion of calculateInvoiceTotals(), for callers that only need it. */
export function calculateInvoiceTax(items: MoneyLineItem[]): number {
  return calculateInvoiceTotals(items).tax;
}

/**
 * Outstanding balance for an invoice, floored at zero so a
 * (deliberately impossible, but defensively handled) amountPaid that
 * somehow exceeds total never reports a negative balance.
 */
export function calculateInvoiceBalance(total: number, amountPaid: number): number {
  return roundMoney(Math.max(0, roundMoney(total) - roundMoney(amountPaid)));
}

/**
 * Derives the payment-driven status ("unpaid" / "partially_paid" /
 * "paid") from an invoice's total and its actual amountPaid. This is the
 * ONLY place that decides those three statuses - callers must never set
 * them from client input (see the PATCH /api/invoices/[id] and the
 * invoice-form UI, both of which now treat status as staff-editable only
 * for the lifecycle states this function doesn't cover: "draft" and
 * "cancelled").
 *
 * Uses MONEY_EPSILON so a payment that's off by a fraction of a cent due
 * to float arithmetic upstream still reads as "paid" rather than getting
 * stuck at "partially_paid" forever.
 */
export function calculatePaymentStatus(total: number, amountPaid: number): PaymentDerivedStatus {
  const paid = roundMoney(amountPaid);
  const grand = roundMoney(total);
  if (paid <= 0) return "unpaid";
  if (grand - paid <= MONEY_EPSILON) return "paid";
  return "partially_paid";
}

/**
 * Sums the payments that actually count toward an invoice's amountPaid -
 * i.e. every recorded payment except ones that have been voided/refunded.
 * This is the authoritative way to recompute Invoice.amountPaid from the
 * Payment ledger (used after a void - see invoice.service.ts#voidPayment)
 * rather than trusting whatever the invoice document currently holds.
 */
export function sumActivePayments(payments: LedgerPayment[]): number {
  return roundMoney(
    payments.filter((payment) => payment.status !== "voided").reduce((sum, payment) => sum + payment.amount, 0),
  );
}
