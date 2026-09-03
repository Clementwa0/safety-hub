import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { StockAlertRow } from "../computeDashboardData";

const LOW_STOCK_CEILING = 20;

const SEVERITY_LABEL: Record<StockAlertRow["severity"], string> = {
  out: "Out of stock",
  low: "Low stock",
  "running-low": "Running low",
};

const SEVERITY_TEXT: Record<StockAlertRow["severity"], string> = {
  out: "text-red-600",
  low: "text-amber-600",
  "running-low": "text-amber-600",
};

const SEVERITY_BAR: Record<StockAlertRow["severity"], string> = {
  out: "bg-red-500",
  low: "bg-amber-500",
  "running-low": "bg-amber-400",
};

export default function LowStockItemsCard({
  items,
  loading = false,
}: {
  items: (StockAlertRow & { image?: string | null })[];
  loading?: boolean;
}) {
  return (
    <Card className="flex h-full flex-col border-border/70 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-2 py-1.5 px-4">
        <CardTitle className="text-xs font-semibold text-foreground">
          Low Stock Items
        </CardTitle>
        <Link
          href="/sentinel/inventory"
          className="text-[11px] font-semibold text-primary hover:underline"
        >
          View all inventory →
        </Link>
      </CardHeader>
      <CardContent className="flex-1 px-4 pb-3 pt-0">
        {loading ? (
          <div className="space-y-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 w-full animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex h-[140px] items-center justify-center text-xs text-muted-foreground">
            Everything is well stocked.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => {
              const percent = Math.min(100, Math.round((item.stock / LOW_STOCK_CEILING) * 100));
              return (
                <li key={item.id} className="flex items-center gap-2 py-1.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt=""
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Package className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-foreground">
                      {item.name}
                    </p>
                    <div className="mt-0.5 h-1 w-full max-w-[120px] overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full", SEVERITY_BAR[item.severity])}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-[11px] tabular-nums text-muted-foreground">
                      {item.stock} / {LOW_STOCK_CEILING}
                    </p>
                    <p
                      className={cn(
                        "text-[11px] font-semibold leading-tight",
                        SEVERITY_TEXT[item.severity]
                      )}
                    >
                      {SEVERITY_LABEL[item.severity]}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}