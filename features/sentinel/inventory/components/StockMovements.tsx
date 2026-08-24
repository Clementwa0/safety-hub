import { ArrowDownRight, ArrowUpRight, History } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StockMovementRow {
  id: string;
  productName: string;
  quantity: number;
  reason: string;
  occurredAt: string;
}

export default function StockMovements({
  data,
  loading = false,
}: {
  data: StockMovementRow[] | null;
  loading?: boolean;
}) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-medium text-foreground">
          Recent Movements
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 pt-1">
        {loading ? (
          <div className="space-y-1.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-9 w-full animate-pulse rounded bg-muted"
              />
            ))}
          </div>
        ) : data === null ? (
          <div className="flex flex-col items-center justify-center gap-1.5 py-6 text-center">
            <History className="h-5 w-5 text-muted-foreground/60" />

            <p className="text-sm text-muted-foreground">
              No inventory movement data available.
            </p>

            <p className="max-w-[220px] text-xs text-muted-foreground/70">
              Stock changes aren&apos;t tracked as individual events yet —
              this panel is ready to populate once that&apos;s added.
            </p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-[100px] items-center justify-center text-sm text-muted-foreground">
            No recent movements.
          </div>
        ) : (
          <div className="space-y-1">
            {data.slice(0, 6).map((row) => (
              <div
                key={row.id}
                className="flex items-center gap-3 rounded-lg px-1.5 py-2 text-sm"
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                    row.quantity >= 0
                      ? "bg-success/10 text-success"
                      : "bg-destructive/10 text-destructive",
                  )}
                >
                  {row.quantity >= 0 ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                  )}
                </span>

                <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                  {row.productName}
                </span>

                <span className="shrink-0 text-xs text-muted-foreground">
                  {row.reason}
                </span>

                <span
                  className={cn(
                    "shrink-0 text-xs font-semibold tabular-nums",
                    row.quantity >= 0
                      ? "text-success"
                      : "text-destructive",
                  )}
                >
                  {row.quantity >= 0 ? "+" : ""}
                  {row.quantity}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}