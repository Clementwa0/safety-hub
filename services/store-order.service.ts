"use client";

import { apiRequest } from "@/lib/http";
import type { CheckoutInput, StoreOrder } from "@/types/store-order";

export const storeOrderService = {
  async checkout(input: CheckoutInput): Promise<StoreOrder> {
    return apiRequest<StoreOrder>("/api/checkout", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  async myOrders(): Promise<StoreOrder[]> {
    return apiRequest<StoreOrder[]>("/api/store-orders");
  },
  async getById(id: string): Promise<StoreOrder> {
    return apiRequest<StoreOrder>(`/api/store-orders/${id}`);
  },
};
