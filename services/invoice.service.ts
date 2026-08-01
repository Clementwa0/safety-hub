"use client";

import { apiRequest } from "@/lib/http";
import type { Invoice, InvoiceInput, InvoiceStatus } from "@/types/invoice";
import { computeTotals, isOverdue } from "@/lib/sales";

export interface InvoiceQuery {
  search?: string;
  status?: InvoiceStatus | "all";
}

function resolveStatus(invoice: Invoice): InvoiceStatus {
  if (invoice.status === "paid" || invoice.status === "cancelled") return invoice.status;
  if (isOverdue(invoice.dueDate, invoice.status)) return "overdue";
  return invoice.status;
}

export const invoiceService = {
  async list(query: InvoiceQuery = {}): Promise<Invoice[]> {
    const params = new URLSearchParams();
    if (query.search) params.set("q", query.search);
    if (query.status && query.status !== "all") params.set("status", query.status);

    const payload = await apiRequest<{ items: Invoice[]; pagination: unknown }>(`/api/invoices${params.toString() ? `?${params.toString()}` : ""}`);
    return payload.items;
  },
  async getById(id: string): Promise<Invoice> {
    return apiRequest<Invoice>(`/api/invoices/${id}`);
  },
  async create(input: InvoiceInput): Promise<Invoice> {
    return apiRequest<Invoice>("/api/invoices", { method: "POST", body: JSON.stringify(input) });
  },
  async update(id: string, input: Partial<InvoiceInput>): Promise<Invoice> {
    return apiRequest<Invoice>(`/api/invoices/${id}`, { method: "PATCH", body: JSON.stringify(input) });
  },
  async remove(id: string): Promise<void> {
    await apiRequest<void>(`/api/invoices/${id}`, { method: "DELETE" });
  },
  effectiveStatus: resolveStatus,
  outstandingBalance(invoice: Invoice): number {
    const totals = computeTotals(invoice.items);
    return Math.max(0, totals.total - invoice.amountPaid);
  },
};
