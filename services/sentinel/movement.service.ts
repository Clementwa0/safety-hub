import { apiRequest } from "@/lib/http";

export type MovementType = "manual_adjustment" | "order_shipped" | "store_order_shipped";

export interface Movement {
  id: string;
  product: { _id: string; name: string; sku?: string } | null;
  type: MovementType;
  delta: number;
  resultingStock: number;
  reference?: string;
  createdAt: string;
}

export const movementService = {
  async listRecent(limit = 20): Promise<Movement[]> {
    const payload = await apiRequest<{ items: Movement[] }>(
      `/api/inventory/movements?limit=${limit}`,
    );
    return payload.items;
  },
};
