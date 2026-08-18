import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { StockAlertRow } from "../computeDashboardData";

const SEVERITY_STYLES: Record<StockAlertRow["severity"], string> = {
  out: "bg-destructive/10 text-destructive",
  low: "bg-destructive/10 text-destructive",
  "running-low": "bg-warning/10 text-warning",
};

const SEVERITY_LABELS: Record<StockAlertRow["severity"], string> = {
  out: "Out",
  low: "Low",
  "running-low": "Running Low",
};

export default function InventoryAlerts({
  data,
  loading = false,
}: {
  data: StockAlertRow[];
  loading?: boolean;
}) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-1">
        <CardTitle className="text-sm font-medium text-foreground">Inventory Alerts</CardTitle>
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0 text-xs"
        >
          <Link href="/sentinel/inventory">View all</Link>
        </Button>
      </CardHeader>
      <CardContent className="p-3 pt-1">
        {loading ? (
          <div className="space-y-1.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 w-full animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-[140px] items-center justify-center text-sm text-muted-foreground">
            No alerts
          </div>
        ) : (
          <div className="space-y-1">
            {data.map((item) => (
              <Link
                key={item.id}
                href={`/sentinel/products/${item.id}/edit`}
                className="flex items-center gap-3 rounded-lg px-1.5 py-2 text-sm transition-colors hover:bg-accent/60"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-foreground">{item.name}</span>
                  {item.sku ? (
                    <span className="block truncate text-[10px] text-muted-foreground">
                      SKU: {item.sku}
                    </span>
                  ) : null}
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                    SEVERITY_STYLES[item.severity],
                  )}
                >
                  {SEVERITY_LABELS[item.severity]}
                </span>
                <span className="w-12 shrink-0 text-right text-[10px] font-medium text-muted-foreground">
                  {item.stock}
                </span>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}