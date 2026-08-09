import type { DocumentTotals, LineItem } from "@/types/sentinel/sales";

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

export function lineItemTotal(item: LineItem): number {
  const gross = item.quantity * item.unitPrice;
  const discounted = gross - gross * (item.discount / 100);
  return Math.max(0, discounted);
}

export function lineItemTax(item: LineItem): number {
  return lineItemTotal(item) * (item.taxRate / 100);
}

export function computeTotals(items: LineItem[]): DocumentTotals {
  let subtotal = 0;
  let discount = 0;
  let tax = 0;

  for (const item of items) {
    const gross = item.quantity * item.unitPrice;
    const disc = gross * (item.discount / 100);
    const net = gross - disc;
    subtotal += gross;
    discount += disc;
    tax += net * (item.taxRate / 100);
  }

  const total = subtotal - discount + tax;
  return { subtotal, discount, tax, total };
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
