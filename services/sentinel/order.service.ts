"use client";

import { apiRequest } from "@/lib/http";
import type { Order, OrderInput, OrderStatus } from "@/types/sentinel/order";
import type { Invoice } from "@/types/sentinel/invoice";

export interface OrderQuery {
  page?: number;
  search?: string;
  status?: OrderStatus | "all";
  limit?: number;
  sort?: string;
}

export const orderService = {
  async list(query: OrderQuery = {}): Promise<Order[]> {
    const params = new URLSearchParams();
    if (query.page) params.set("page", String(query.page));
    if (query.search) params.set("q", query.search);
    if (query.status && query.status !== "all") params.set("status", query.status);
    if (query.limit) params.set("limit", String(query.limit));
    if (query.sort) params.set("sort", query.sort);

    const payload = await apiRequest<{ items: Order[]; pagination: unknown }>(`/api/orders${params.toString() ? `?${params.toString()}` : ""}`);
    return payload.items;
  },
  async getById(id: string): Promise<Order> {
    return apiRequest<Order>(`/api/orders/${id}`);
  },
  async create(input: OrderInput): Promise<Order> {
    return apiRequest<Order>("/api/orders", { method: "POST", body: JSON.stringify(input) });
  },
  async update(id: string, input: Partial<OrderInput>): Promise<Order> {
    return apiRequest<Order>(`/api/orders/${id}`, { method: "PATCH", body: JSON.stringify(input) });
  },
  async remove(id: string): Promise<void> {
    await apiRequest<void>(`/api/orders/${id}`, { method: "DELETE" });
  },
  async convertToInvoice(id: string): Promise<Invoice> {
    return apiRequest<Invoice>(`/api/orders/${id}/convert-to-invoice`, { method: "POST" });
  },
};
