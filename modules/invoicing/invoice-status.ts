export type InvoiceLifecycleStatus = "draft" | "unpaid" | "partially_paid" | "paid" | "overdue" | "cancelled";

export function canEditInvoiceItems(status: InvoiceLifecycleStatus): boolean {
  return status === "draft";
}
