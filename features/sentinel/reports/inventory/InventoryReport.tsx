"use client";

import { useMemo } from "react";
import { Lock, PackageCheck, PackageX, Wallet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/EmptyState";
import StatsCard from "@/components/sentinel/shared/StatsCard";
import { formatCurrency } from "@/lib/format";
import StockHealth from "@/features/sentinel/inventory/components/StockHealth";
import { getStockBucket } from "@/features/sentinel/inventory/stockStatus";
import { computeInventorySummary, computeStockHealthSlices } from "@/features/sentinel/inventory/summary";
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
  const stockHealthSlices = useMemo(() => computeStockHealthSlices(summary), [summary]);

  const byCategory = useMemo<CategoryValueRow[]>(() => {
    const map = new Map<string, CategoryValueRow>();
    for (const row of rows) {
      if ((row.status ?? "active") === "archived") continue;
      const key = String(row.category || "Uncategorized");
      const entry = map.get(key) ?? { category: key, available: 0, value: 0 };
      entry.available += row.available;
      entry.value += inventoryValue(row);
      map.set(key, entry);
    }
    return Array.from(map.values()).sort((a, b) => b.value - a.value);
  }, [rows]);

  const attentionRows = useMemo(
    () =>
      rows
        .filter((row) => (row.status ?? "active") !== "archived" && getStockBucket(row.available) !== "in-stock")
        .sort((a, b) => a.available - b.available)
        .slice(0, 15),
    [rows],
  );

  if (error) {
    return <EmptyState title="Couldn't load the inventory report" description={error} />;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatsCard title="Available units" value={String(summary.totalAvailable)} icon={PackageCheck} loading={loading} />
        <StatsCard title="Reserved units" value={String(summary.totalReserved)} icon={Lock} loading={loading} />
        <StatsCard title="Inventory value" value={formatCurrency(summary.totalValue)} icon={Wallet} loading={loading} />
        <StatsCard title="Out of stock" value={String(summary.outOfStockCount)} icon={PackageX} loading={loading} />
      </div>

      <StockHealth slices={stockHealthSlices} loading={loading} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-1.5">
            <CardTitle className="text-sm font-semibold">Value by category</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="h-[220px] animate-pulse rounded bg-muted" />
            ) : byCategory.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">No active inventory yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Available</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byCategory.map((row) => (
                    <TableRow key={row.category}>
                      <TableCell className="font-medium">{row.category}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.available}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrency(row.value)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-1.5">
            <CardTitle className="text-sm font-semibold">Needs attention</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="h-[220px] animate-pulse rounded bg-muted" />
            ) : attentionRows.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">Everything is healthy — nothing low or out of stock</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Available</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attentionRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.available}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
