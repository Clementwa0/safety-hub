"use client";

import { apiRequest } from "@/lib/http";
import type { Invoice, InvoiceInput, InvoiceStatus } from "@/types/sentinel/invoice";
import { effectiveInvoiceStatus, invoiceOutstandingBalance } from "@/lib/sales";

export interface InvoiceQuery {
  page?: number;
  search?: string;
  status?: InvoiceStatus | "all";
  limit?: number;
  sort?: string;
}

export const invoiceService = {
  async list(query: InvoiceQuery = {}): Promise<Invoice[]> {
    const params = new URLSearchParams();
    if (query.page) params.set("page", String(query.page));
    if (query.search) params.set("q", query.search);
    if (query.status && query.status !== "all") params.set("status", query.status);
    if (query.limit) params.set("limit", String(query.limit));
    if (query.sort) params.set("sort", query.sort);

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
  effectiveStatus: effectiveInvoiceStatus,
  outstandingBalance: invoiceOutstandingBalance,
};
