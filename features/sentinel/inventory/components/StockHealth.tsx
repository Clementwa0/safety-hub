import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { StockHealthSlice } from "../summary";

const SLICE_BAR_COLOR: Record<StockHealthSlice["level"], string> = {
  "in-stock": "bg-success",
  low: "bg-amber-500",
  out: "bg-destructive",
};

const SLICE_DOT_COLOR: Record<StockHealthSlice["level"], string> = {
  "in-stock": "bg-success",
  low: "bg-amber-500",
  out: "bg-destructive",
};

export default function StockHealth({
  slices,
  loading = false,
}: {
  slices: StockHealthSlice[];
  loading?: boolean;
}) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-medium text-foreground">Stock Health</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-1">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-4 w-full animate-pulse rounded-full bg-muted" />
            ))}
          </div>
        ) : (
          <>
            {/* Stacked bar */}
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
              {slices.map((slice) =>
                slice.percent > 0 ? (
                  <div
                    key={slice.level}
                    className={cn("h-full", SLICE_BAR_COLOR[slice.level])}
                    style={{ width: `${slice.percent}%` }}
                  />
                ) : null,
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              {slices.map((slice) => (
                <div key={slice.level} className="flex items-center gap-1.5 text-xs">
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", SLICE_DOT_COLOR[slice.level])} />
                  <span className="text-muted-foreground">{slice.label}</span>
                  <span className="font-semibold tabular-nums text-foreground">{slice.percent}%</span>
                  <span className="text-muted-foreground">({slice.count})</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
