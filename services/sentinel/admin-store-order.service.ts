"use client";

import { apiRequest } from "@/lib/http";
import type {
  AdminStoreOrderQuery,
  Paginated,
  StoreOrder,
  StoreOrderStats,
  StoreOrderStatus,
  StorePaymentStatus,
} from "@/types/storefront/store-order";

export const adminStoreOrderService = {
  async list(query: AdminStoreOrderQuery = {}): Promise<Paginated<StoreOrder>> {
    const params = new URLSearchParams();
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));
    if (query.sort) params.set("sort", query.sort);
    if (query.q) params.set("q", query.q);
    if (query.status && query.status !== "all") params.set("status", query.status);
    if (query.paymentStatus && query.paymentStatus !== "all") params.set("paymentStatus", query.paymentStatus);

    return apiRequest<Paginated<StoreOrder>>(
      `/api/admin/store-orders${params.toString() ? `?${params.toString()}` : ""}`,
    );
  },
  async getById(id: string): Promise<StoreOrder> {
    return apiRequest<StoreOrder>(`/api/admin/store-orders/${id}`);
  },
  async updateStatus(id: string, status: StoreOrderStatus): Promise<StoreOrder> {
    return apiRequest<StoreOrder>(`/api/admin/store-orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
  async updatePaymentStatus(id: string, paymentStatus: StorePaymentStatus): Promise<StoreOrder> {
    return apiRequest<StoreOrder>(`/api/admin/store-orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ paymentStatus }),
    });
  },
  async stats(p0: { signal: AbortSignal; }): Promise<StoreOrderStats> {
    return apiRequest<StoreOrderStats>("/api/admin/store-orders/stats");
  },
};
