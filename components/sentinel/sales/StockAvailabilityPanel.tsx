import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FulfillmentBadge } from "@/components/sentinel/sales/FulfillmentBadge";
import type { LineItem } from "@/types/sentinel/sales";

interface StockAvailabilityPanelProps {
  items: LineItem[];
}

/**
 * Shows the stock snapshot captured when the quotation's items were last
 * saved (availableAtQuote/fulfillmentPlan - see
 * lib/server/availability.ts). Deliberately not a live re-check against
 * current stock: the whole point of the snapshot is that a quotation
 * reflects what was available when it was quoted, not what's available
 * right now while someone happens to be viewing it.
 *
 * Only renders for lines that reference a real product - custom/one-off
 * lines have no stock concept and are silently skipped.
 */
export function StockAvailabilityPanel({ items }: StockAvailabilityPanelProps) {
  const stockLines = items.filter((item) => item.productId && item.availableAtQuote !== undefined);
  if (stockLines.length === 0) return null;

  const needsProcurement = stockLines.some((item) => item.fulfillmentPlan === "procurement");
  const needsPartial = stockLines.some((item) => item.fulfillmentPlan === "partial");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Stock availability</CardTitle>
        {needsProcurement || needsPartial ? (
          <p className="text-xs text-muted-foreground">
            Snapshot from when this quotation was last saved. One or more lines will need
            procurement before this can be fully delivered.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Snapshot from when this quotation was last saved. All lines were available in full.
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {stockLines.map((item) => {
          const available = item.availableAtQuote ?? 0;
          const reserved = Math.max(0, Math.min(item.quantity, available));
          const procurement = Math.max(0, item.quantity - available);
          return (
            <div
              key={item.id}
              className="flex flex-col gap-2 rounded-md border border-border p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">
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
      </CardContent>
    </Card>
  );
}

export default StockAvailabilityPanel;
