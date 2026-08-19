import { getStockBucket } from "./stockStatus";
import { inventoryValue, type InventoryRow } from "./types";

export interface InventorySummary {
  totalAvailable: number;
  totalReserved: number;
  totalValue: number;
  /** Counts below are over active (non-archived) rows only, bucketed by
   *  `available` stock — the same field and thresholds the Inventory
   *  table/filters already use, so these numbers always agree with what's
   *  on screen. */
  healthyCount: number;
  runningLowCount: number;
  lowCount: number;
  outOfStockCount: number;
  activeCount: number;
}

/** Single source of truth for the Inventory page's summary cards and its
 *  Stock Health breakdown, so the two never drift apart. */
export function computeInventorySummary(rows: InventoryRow[]): InventorySummary {
  const active = rows.filter((r) => (r.status ?? "active") !== "archived");

  let healthyCount = 0;
  let runningLowCount = 0;
  let lowCount = 0;
  let outOfStockCount = 0;

  for (const row of active) {
    const bucket = getStockBucket(row.available);
    if (bucket === "in-stock") healthyCount += 1;
    else if (bucket === "running-low") runningLowCount += 1;
    else if (bucket === "low") lowCount += 1;
    else outOfStockCount += 1;
  }

  return {
    totalAvailable: active.reduce((sum, r) => sum + r.available, 0),
    totalReserved: active.reduce((sum, r) => sum + r.reserved, 0),
    totalValue: active.reduce((sum, r) => sum + inventoryValue(r), 0),
    healthyCount,
    runningLowCount,
    lowCount,
    outOfStockCount,
    activeCount: active.length,
  };
}

export interface StockHealthSlice {
  /** Deliberately its own 3-value type, not `StockLevel` — this bar merges
   *  "low" and "running-low" into a single "Low Stock" slice (see below),
   *  so it never actually emits `StockLevel`'s "running-low" or "all". */
  level: "in-stock" | "low" | "out";
  label: string;
  count: number;
  percent: number;
}

/** Groups "Low" and "Running Low" under one "Low Stock" bucket for the
 *  Stock Health bar — the table keeps them separate for filtering, but a
 *  three-way health bar (Healthy / Low Stock / Out of Stock) reads better
 *  than four thin slices. */
export function computeStockHealthSlices(summary: InventorySummary): StockHealthSlice[] {
  const total = summary.activeCount || 1;
  const lowStock = summary.lowCount + summary.runningLowCount;

  return [
    {
      level: "in-stock",
      label: "Healthy",
      count: summary.healthyCount,
      percent: Math.round((summary.healthyCount / total) * 1000) / 10,
    },
    {
      level: "low",
      label: "Low Stock",
      count: lowStock,
      percent: Math.round((lowStock / total) * 1000) / 10,
    },
    {
      level: "out",
      label: "Out of Stock",
      count: summary.outOfStockCount,
      percent: Math.round((summary.outOfStockCount / total) * 1000) / 10,
    },
  ];
}
