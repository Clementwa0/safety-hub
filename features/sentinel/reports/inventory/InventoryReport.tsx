"use client";

import { useMemo } from "react";
import { Lock, PackageCheck, PackageX, Wallet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/EmptyState";
import StatsCard from "@/components/sentinel/shared/StatsCard";
import { formatCurrency } from "@/lib/format";
import StockHealth from "@/features/sentinel/inventory/components/StockHealth";
import { getStockBucket } from "@/features/sentinel/inventory/stockStatus";
import {
  computeInventorySummary,
  computeStockHealthSlices,
} from "@/features/sentinel/inventory/summary";
import { inventoryValue } from "@/features/sentinel/inventory/types";
import { useInventoryRows } from "@/features/sentinel/inventory/useInventoryRows";

interface CategoryValueRow {
  category: string;
  available: number;
  value: number;
}

export default function InventoryReport() {
  const { rows, loading, error } = useInventoryRows();

  const summary = useMemo(() => computeInventorySummary(rows), [rows]);

  const stockHealthSlices = useMemo(
    () => computeStockHealthSlices(summary),
    [summary],
  );

  const byCategory = useMemo<CategoryValueRow[]>(() => {
    const map = new Map<string, CategoryValueRow>();

    for (const row of rows) {
      if ((row.status ?? "active") === "archived") continue;

      const key = String(row.category || "Uncategorized");

      const entry = map.get(key) ?? {
        category: key,
        available: 0,
        value: 0,
      };

      entry.available += row.available;
      entry.value += inventoryValue(row);

      map.set(key, entry);
    }

    return Array.from(map.values()).sort((a, b) => b.value - a.value);
  }, [rows]);

  const attentionRows = useMemo(
    () =>
      rows
        .filter(
          (row) =>
            (row.status ?? "active") !== "archived" &&
            getStockBucket(row.available) !== "in-stock",
        )
        .sort((a, b) => a.available - b.available)
        .slice(0, 15),
    [rows],
  );

  if (error) {
    return (
      <EmptyState
        title="Couldn't load the inventory report"
        description={error}
      />
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        <StatsCard
          title="Available units"
          value={String(summary.totalAvailable)}
          icon={PackageCheck}
          loading={loading}
        />

        <StatsCard
          title="Reserved units"
          value={String(summary.totalReserved)}
          icon={Lock}
          loading={loading}
        />

        <StatsCard
          title="Inventory value"
          value={formatCurrency(summary.totalValue)}
          icon={Wallet}
          loading={loading}
        />

        <StatsCard
          title="Out of stock"
          value={String(summary.outOfStockCount)}
          icon={PackageX}
          loading={loading}
        />
      </div>

      {/* Stock health */}
      <StockHealth slices={stockHealthSlices} loading={loading} />

      {/* Tables */}
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        {/* Value by category */}
        <Card className="overflow-hidden border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/50 px-3.5 py-3 sm:px-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <CardTitle className="text-sm font-semibold tracking-tight">
                  Value by category
                </CardTitle>

                <p className="mt-0.5 truncate text-[11px] text-muted-foreground sm:text-xs">
                  Inventory value grouped by category
                </p>
              </div>

              <span className="shrink-0 rounded-md bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary sm:text-xs">
                {byCategory.length}
                <span className="hidden sm:inline"> categories</span>
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="h-[180px] animate-pulse bg-muted/40 sm:h-[220px]" />
            ) : byCategory.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-muted-foreground">
                No active inventory yet
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead className="h-9 px-3 text-[11px] font-medium text-muted-foreground sm:px-5 sm:text-xs">
                        Category
                      </TableHead>

                      <TableHead className="h-9 px-3 text-right text-[11px] font-medium text-muted-foreground sm:px-5 sm:text-xs">
                        Available
                      </TableHead>

                      <TableHead className="h-9 px-3 text-right text-[11px] font-medium text-muted-foreground sm:px-5 sm:text-xs">
                        Value
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {byCategory.map((row) => (
                      <TableRow
                        key={row.category}
                        className="border-border/40 hover:bg-muted/40"
                      >
                        <TableCell className="max-w-[150px] truncate px-3 py-2.5 text-xs sm:max-w-none sm:px-5 sm:py-3">
                          <span className="font-medium text-foreground">
                            {row.category}
                          </span>
                        </TableCell>

                        <TableCell className="px-3 py-2.5 text-right text-xs tabular-nums text-muted-foreground sm:px-5 sm:py-3">
                          {row.available}
                        </TableCell>

                        <TableCell className="px-3 py-2.5 text-right text-xs font-medium tabular-nums text-foreground sm:px-5 sm:py-3">
                          {formatCurrency(row.value)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Needs attention */}
        <Card className="overflow-hidden border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/50 px-3.5 py-3 sm:px-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <CardTitle className="text-sm font-semibold tracking-tight">
                  Needs attention
                </CardTitle>

                <p className="mt-0.5 truncate text-[11px] text-muted-foreground sm:text-xs">
                  Low or unavailable stock
                </p>
              </div>

              {!loading && attentionRows.length > 0 && (
                <span className="shrink-0 rounded-md bg-destructive/10 px-2 py-1 text-[10px] font-medium text-destructive sm:text-xs">
                  {attentionRows.length}
                  <span className="hidden sm:inline"> items</span>
                </span>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="h-[180px] animate-pulse bg-muted/40 sm:h-[220px]" />
            ) : attentionRows.length === 0 ? (
              <div className="flex min-h-[180px] flex-col items-center justify-center px-4 text-center sm:min-h-[220px]">
                <div className="mb-2.5 flex size-9 items-center justify-center rounded-full bg-emerald-500/10">
                  <PackageCheck className="size-4.5 text-emerald-600" />
                </div>

                <p className="text-sm font-medium text-foreground">
                  Inventory looks healthy
                </p>

                <p className="mt-0.5 max-w-xs text-[11px] leading-5 text-muted-foreground sm:text-xs">
                  Nothing is currently low or out of stock.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead className="h-9 px-3 text-[11px] font-medium text-muted-foreground sm:px-5 sm:text-xs">
                        Product
                      </TableHead>

                      <TableHead className="h-9 px-3 text-right text-[11px] font-medium text-muted-foreground sm:px-5 sm:text-xs">
                        Available
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {attentionRows.map((row) => (
                      <TableRow
                        key={row.id}
                        className="border-border/40 hover:bg-muted/40"
                      >
                        <TableCell className="max-w-[220px] truncate px-3 py-2.5 text-xs sm:max-w-none sm:px-5 sm:py-3">
                          <span className="font-medium text-foreground">
                            {row.name}
                          </span>
                        </TableCell>

                        <TableCell className="px-3 py-2.5 text-right text-xs font-medium tabular-nums text-foreground sm:px-5 sm:py-3">
                          {row.available}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}