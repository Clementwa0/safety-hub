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
  /** Sends (or re-sends) the M-Pesa STK push for an order. */
  async payWithMpesa(orderId: string): Promise<StoreOrder> {
    return apiRequest<StoreOrder>(`/api/store-orders/${orderId}/mpesa/stk-push`, {
      method: "POST",
    });
  },
  /** Polls the current payment status of an M-Pesa order. */
  async getMpesaStatus(orderId: string): Promise<StoreOrder> {
    return apiRequest<StoreOrder>(`/api/store-orders/${orderId}/mpesa/status`);
  },
};
