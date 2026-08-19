import type { Product } from "@/types/product";

/** A product plus what the catalogue page never shows: how much of its
 *  on-hand stock is already committed to accepted-but-not-yet-invoiced
 *  sales orders, and what's actually left to sell. */
export interface InventoryRow extends Product {
  reserved: number;
  available: number;
}

export function inventoryValue(row: InventoryRow): number {
  return row.price * row.stock;
}
