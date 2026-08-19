/**
 * Bucket a quantity into the same "Out / Low / Running Low / In Stock"
 * levels used across Sentinel (see the dashboard's stock alerts). Used
 * here against `available` (on-hand stock minus what's reserved for
 * pending sales orders) rather than raw stock, since that's the number
 * that actually determines whether a product can still be sold.
 */
export const STOCK_LEVELS = ["all", "in-stock", "running-low", "low", "out"] as const;

export type StockLevel = (typeof STOCK_LEVELS)[number];

export const STOCK_LEVEL_LABELS: Record<StockLevel, string> = {
  all: "All availability",
  "in-stock": "Available",
  "running-low": "Running Low",
  low: "Low",
  out: "Unavailable",
};

export function getStockBucket(quantity: number): Exclude<StockLevel, "all"> {
  if (quantity <= 0) return "out";
  if (quantity <= 5) return "low";
  if (quantity <= 20) return "running-low";
  return "in-stock";
}
