"use client";

import { apiRequest } from "@/lib/http";
import type {
  Customer,
  CustomerInput,
  CustomerPagination,
  CustomerQuery,
} from "@/types/sentinel/customer";

export interface CustomerListResult {
  items: Customer[];
  pagination: CustomerPagination;
}

export const customerService = {
  async list(query: CustomerQuery = {}): Promise<CustomerListResult> {
    const params = new URLSearchParams();
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));
    if (query.sort) params.set("sort", query.sort);
    if (query.q) params.set("q", query.q);

    return apiRequest<CustomerListResult>(
      `/api/customers${params.toString() ? `?${params.toString()}` : ""}`,
    );
  },
  async getById(id: string): Promise<Customer> {
    return apiRequest<Customer>(`/api/customers/${id}`);
  },
  async create(input: CustomerInput): Promise<Customer> {
    return apiRequest<Customer>("/api/customers", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  async update(id: string, input: Partial<CustomerInput>): Promise<Customer> {
    return apiRequest<Customer>(`/api/customers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },
  async remove(id: string): Promise<void> {
    await apiRequest<void>(`/api/customers/${id}`, { method: "DELETE" });
  },
  /**
   * Authoritative customer count from the Customer domain. Uses `limit=1`
   * so callers that only need the total (e.g. the Dashboard KPI) don't pull
   * every customer record — the count comes from `pagination.total`.
   */
  async count(): Promise<number> {
    const result = await this.list({ limit: 1 });
    return result.pagination.total;
  },
};
