"use client";

import { apiRequest } from "@/lib/http";
import type {
  Quotation,
  QuotationInput,
  QuotationStatus,
} from "@/types/sentinel/quotation";
import type { Invoice } from "@/types/sentinel/invoice";
import { computeTotals } from "@/lib/sales";

export interface QuotationQuery {
  search?: string;
  status?: QuotationStatus | "all";
}

export const quotationService = {
  async list(query: QuotationQuery = {}): Promise<Quotation[]> {
    const params = new URLSearchParams();
    if (query.search) params.set("q", query.search);
    if (query.status && query.status !== "all") params.set("status", query.status);

    const payload = await apiRequest<{ items: Quotation[]; pagination: unknown }>(`/api/quotations${params.toString() ? `?${params.toString()}` : ""}`);
    return payload.items;
  },
  async getById(id: string): Promise<Quotation> {
    return apiRequest<Quotation>(`/api/quotations/${id}`);
  },
  async create(input: QuotationInput): Promise<Quotation> {
    return apiRequest<Quotation>("/api/quotations", { method: "POST", body: JSON.stringify(input) });
  },
  async update(id: string, input: Partial<QuotationInput>): Promise<Quotation> {
    return apiRequest<Quotation>(`/api/quotations/${id}`, { method: "PATCH", body: JSON.stringify(input) });
  },
  async remove(id: string): Promise<void> {
    await apiRequest<void>(`/api/quotations/${id}`, { method: "DELETE" });
  },
  async duplicate(id: string): Promise<Quotation> {
    return apiRequest<Quotation>(`/api/quotations/${id}`, { method: "POST", body: JSON.stringify({ duplicate: true }) });
  },
  async convertToInvoice(id: string): Promise<Invoice> {
    return apiRequest<Invoice>(`/api/quotations/${id}`, { method: "POST" });
  },
  async totals(id: string) {
    const quotation = await this.getById(id);
    return computeTotals(quotation.items);
  },
};
