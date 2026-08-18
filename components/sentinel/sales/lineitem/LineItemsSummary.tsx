"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatKES } from "@/lib/format";
import { computeTotals } from "@/lib/sales";

interface LineItemsSummaryProps {
  totals: ReturnType<typeof computeTotals>;
  onAddItem: () => void;
  error?: string;
}

export function LineItemsSummary({
  totals,
  onAddItem,
  error,
}: LineItemsSummaryProps) {
  return (
    <div className="border-t border-border/60 px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Add button – full width on mobile */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onAddItem}
          className="w-full gap-1 text-muted-foreground hover:text-foreground sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add item
        </Button>

        {/* Totals – single column on mobile, horizontal on desktop */}
        <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <div className="flex items-center justify-between gap-2 sm:justify-start">
            <span className="text-xs text-muted-foreground">Subtotal</span>
            <span className="text-sm tabular-nums">{formatKES(totals.subtotal)}</span>
          </div>

          <div className="flex items-center justify-between gap-2 sm:justify-start">
            <span className="text-xs text-muted-foreground">Discount</span>
            <span className="text-sm tabular-nums text-muted-foreground">
              -{formatKES(totals.discount)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 sm:justify-start">
            <span className="text-xs text-muted-foreground">Tax</span>
            <span className="text-sm tabular-nums">{formatKES(totals.tax)}</span>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-border/30 pt-1 sm:border-t-0 sm:border-l sm:border-border/60 sm:pl-4 sm:pt-0">
            <span className="text-sm font-medium">Total</span>
            <span className="text-base font-semibold tabular-nums text-primary">
              {formatKES(totals.total)}
            </span>
          </div>
        </div>
      </div>

      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}