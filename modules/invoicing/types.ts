/**
 * Shared types for the invoicing module (modules/invoicing/). This module
 * is the single source of truth for invoice/payment money math - see
 * calculations.ts - and for the server-side transactional operations that
 * mutate it - see invoice.service.ts.
 */

/**
 * The minimal shape calculateInvoiceTotals() needs from a line item.
 * Deliberately structural (no `id`, no `name`) so both the persisted
 * Mongoose subdocument (lib/models/Invoice.ts#IInvoiceLineItem) and the
 * client-side LineItem (types/sentinel/sales.ts, which has extra fields
 * like the React-only `id`) satisfy it without a cast - TypeScript allows
 * passing an object with *more* fields than a parameter type requires.
 */
export interface MoneyLineItem {
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount: number;
}

export interface InvoiceTotals {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

/**
 * The three states calculatePaymentStatus() can derive from an invoice's
 * total and amountPaid. Deliberately narrower than the full InvoiceStatus
 * union (types/sentinel/invoice.ts) - "draft", "cancelled", and "overdue"
 * are lifecycle/administrative states no amount-of-money calculation can
 * infer, so they're never returned here.
 */
export type PaymentDerivedStatus = "unpaid" | "partially_paid" | "paid";

/** Ledger status of one recorded Payment - see lib/models/Payment.ts. */
export const PAYMENT_LEDGER_STATUSES = ["recorded", "voided"] as const;
export type PaymentLedgerStatus = (typeof PAYMENT_LEDGER_STATUSES)[number];

/** The minimal shape sumActivePayments() needs from a payment record. */
export interface LedgerPayment {
  amount: number;
  status?: PaymentLedgerStatus | string;
}
