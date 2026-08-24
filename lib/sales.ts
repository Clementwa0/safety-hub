import type { DocumentTotals, LineItem } from "@/types/sentinel/sales";
import type { Invoice, InvoiceStatus } from "@/types/sentinel/invoice";
import {
  calculateInvoiceBalance,
  calculateInvoiceTotals,
  calculateLineItemTotal,
} from "@/modules/invoicing/calculations";

export function createLineItem(overrides: Partial<LineItem> = {}): LineItem {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `li_${Math.random().toString(36).slice(2, 10)}`,
    name: "",
    description: "",
    quantity: 1,
    unitPrice: 0,
    taxRate: 16,
    discount: 0,
    ...overrides,
  };
}

// lineItemTotal/lineItemTax/computeTotals below all delegate to
// modules/invoicing/calculations.ts, the single source of truth for this
// math (see that file's doc comment). They used to each carry their own
// copy of the gross → discount → tax formula; this file, the payments
// route, and the sales dashboard all had to be kept in sync by hand.
// Signatures are unchanged so every existing caller (quotations, orders,
// invoices, the PDF renderer) keeps working as-is.
export function lineItemTotal(item: LineItem): number {
  return calculateLineItemTotal(item);
}

export function lineItemTax(item: LineItem): number {
  const gross = item.quantity * item.unitPrice;
  const net = Math.max(0, gross - gross * (item.discount / 100));
  return net * (item.taxRate / 100);
}

export function computeTotals(items: LineItem[]): DocumentTotals {
  return calculateInvoiceTotals(items);
}

function pad(value: number, size = 4): string {
  return value.toString().padStart(size, "0");
}

export function nextDocumentNumber(prefix: string, existing: string[]): string {
  const year = new Date().getFullYear();
  const scoped = existing.filter((value) => value.startsWith(`${prefix}-${year}-`));
  const numbers = scoped
    .map((value) => Number.parseInt(value.split("-").pop() ?? "0", 10))
    .filter((value) => Number.isFinite(value));
  const next = (numbers.length ? Math.max(...numbers) : 0) + 1;
  return `${prefix}-${year}-${pad(next)}`;
}

export function isOverdue(dueDate: number, status: string): boolean {
  if (status === "paid" || status === "cancelled") return false;
  return dueDate < Date.now();
}

export function computeDocumentTotals(items: LineItem[]): DocumentTotals {
  return computeTotals(items);
}

/**
 * The status an invoice should be treated as *right now* — same as
 * `invoice.status` except a still-open invoice past its due date reads as
 * "overdue" without needing a background job to flip the stored value.
 * Pulled out of the "use client" invoiceService so server code (e.g. the
 * PDF route) can compute it without crossing the client boundary.
 */
export function effectiveInvoiceStatus(invoice: Invoice): InvoiceStatus {
  if (invoice.status === "paid" || invoice.status === "cancelled") return invoice.status;
  if (isOverdue(invoice.dueDate, invoice.status)) return "overdue";
  return invoice.status;
}

export function invoiceOutstandingBalance(invoice: Invoice): number {
  const totals = computeTotals(invoice.items);
  return calculateInvoiceBalance(totals.total, invoice.amountPaid);
}
