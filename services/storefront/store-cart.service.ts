// services/store-cart.service.ts
"use client";

import { apiRequest } from "@/lib/http";
import type { StoreCart } from "@/types/storefront/store-cart";

export const storeCartService = {
  async get(): Promise<StoreCart> {
    return apiRequest<StoreCart>("/api/cart");
  },
  async addItem(productId: string, variantSku?: string, quantity = 1): Promise<StoreCart> {
    return apiRequest<StoreCart>("/api/cart/items", {
      method: "POST",
      body: JSON.stringify({ productId, variantSku, quantity }),
    });
  },
  async updateItem(productId: string, variantSku: string | undefined, quantity: number): Promise<StoreCart> {
    return apiRequest<StoreCart>(`/api/cart/items/${productId}`, {
      method: "PATCH",
      body: JSON.stringify({ variantSku, quantity }),
    });
  },
  async removeItem(productId: string, variantSku?: string): Promise<StoreCart> {
    const query = variantSku ? `?variantSku=${encodeURIComponent(variantSku)}` : "";
    return apiRequest<StoreCart>(`/api/cart/items/${productId}${query}`, {
      method: "DELETE",
    });
  },
  async clear(): Promise<StoreCart> {
    return apiRequest<StoreCart>("/api/cart", { 
      method: "DELETE" 
    });
  },
};