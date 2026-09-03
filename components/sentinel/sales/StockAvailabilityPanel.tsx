import { FulfillmentBadge } from "@/components/sentinel/sales/FulfillmentBadge";
import type { LineItem } from "@/types/sentinel/sales";

interface StockAvailabilityPanelProps {
  items: LineItem[];
}

export function StockAvailabilityPanel({ items }: StockAvailabilityPanelProps) {
  const stockLines = items.filter((item) => item.productId && item.availableAtQuote !== undefined);
  if (stockLines.length === 0) return null;

  const needsProcurement = stockLines.some((item) => item.fulfillmentPlan === "procurement");
  const needsPartial = stockLines.some((item) => item.fulfillmentPlan === "partial");

  return (
    <div className="rounded-lg border border-border/30 bg-background p-1.5 sm:p-3 shadow-sm">
      <h3 className="text-xs font-medium text-muted-foreground sm:text-sm">Stock availability</h3>
      <p className="text-[10px] text-muted-foreground sm:text-xs">
        {needsProcurement || needsPartial
          ? "Snapshot from when this quotation was last saved. One or more lines will need procurement before this can be fully delivered."
          : "Snapshot from when this quotation was last saved. All lines were available in full."}
      </p>

      <div className="mt-1.5 space-y-1.5 sm:space-y-2">
        {stockLines.map((item, index) => {
          const available = item.availableAtQuote ?? 0;
          const reserved = Math.max(0, Math.min(item.quantity, available));
          const procurement = Math.max(0, item.quantity - available);
          // Use a stable key: prefer item.id, fallback to index if missing
          const key = item.id ? `stock-${item.id}` : `stock-${index}`;
          return (
            <div
              key={key}
              className="flex flex-col gap-1 rounded-md border border-border/40 p-2 text-xs sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:p-2.5 sm:text-sm"
            >
              <div className="min-w-0">
                <p className="font-medium text-foreground">{item.name}</p>
                <p className="text-[10px] text-muted-foreground sm:text-xs">
                  Requested {item.quantity} · Available at quote time {available}
                  {procurement > 0 ? ` · Reserved ${reserved} · Procurement ${procurement}` : ""}
                </p>
              </div>
              <div>
                <FulfillmentBadge plan={item.fulfillmentPlan} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StockAvailabilityPanel;