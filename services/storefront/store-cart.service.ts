// services/store-cart.service.ts
"use client";

import { apiRequest } from "@/lib/http";
import type { StoreCart } from "@/types/storefront/store-cart";

export const storeCartService = {
  async get(): Promise<StoreCart> {
    return apiRequest<StoreCart>("/api/cart");
  },
  async addItem(productId: string, quantity = 1): Promise<StoreCart> {
    return apiRequest<StoreCart>("/api/cart/items", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    });
  },
  async updateItem(productId: string, quantity: number): Promise<StoreCart> {
    return apiRequest<StoreCart>(`/api/cart/items/${productId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    });
  },
  async removeItem(productId: string): Promise<StoreCart> {
    return apiRequest<StoreCart>(`/api/cart/items/${productId}`, { 
      method: "DELETE" 
    });
  },
  async clear(): Promise<StoreCart> {
    return apiRequest<StoreCart>("/api/cart", { 
      method: "DELETE" 
    });
  },
};