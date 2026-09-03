"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Database,
  Package,
  PackageX,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { EmptyState } from "@/components/shared/EmptyState";
import { formatDate } from "@/lib/format";
import ReportRangePicker from "@/components/sentinel/reports/ReportRangePicker";
import ReportKpiCard from "@/components/sentinel/reports/ReportKpiCard";
import ReportDonut from "@/components/sentinel/reports/ReportDonut";
import { formatDashboardCurrency } from "@/features/sentinel/dashboard/computeDashboardData";
import { reportsService } from "@/services/sentinel/reports.service";

import type {
  InventoryReportResponse,
  ReportRange,
} from "@/types/sentinel/reports";

function periodTick(key: string): string {
  if (/^\d{4}-\d{2}$/.test(key)) {
    const [y, m] = key.split("-");
    return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-US", {
      month: "short",
    });
  }
  return new Date(key).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const STATUS_BAR_COLOR: Record<string, string> = {
  "in-stock": "bg-emerald-500",
  low: "bg-amber-500",
  out: "bg-red-500",
  discontinued: "bg-muted-foreground/40",
  total: "bg-primary",
};

export default function InventoryReport() {
  const [range, setRange] = useState<ReportRange>("30d");
  const [data, setData] = useState<InventoryReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (nextRange: ReportRange) => {
    setLoading(true);
    setError(null);
    try {
      setData(await reportsService.inventory({ range: nextRange }));
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not load the inventory report",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(range);
  }, [range, load]);

  if (error) {
    return (
      <EmptyState
        title="Couldn't load the inventory report"
        description={error}
      />
    );
  }

  const comparisonLabel = data?.period.previousLabel ?? "";

  return (
    <div className="space-y-2.5 sm:space-y-3">
      {/* Range */}
      <div className="flex items-center justify-end">
        <ReportRangePicker value={range} onChange={setRange} />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-2 sm:gap-2.5 lg:grid-cols-5">
        {loading || !data
          ? Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="border-border/60 shadow-sm">
                <CardContent className="p-3">
                  <div className="h-14 animate-pulse rounded bg-muted" />
                </CardContent>
              </Card>
            ))
          : (
              <>
                <ReportKpiCard
                  title="Total Inventory Value"
                  kpi={data.kpis.totalInventoryValue}
                  icon={Database}
                  iconTint="bg-blue-100 text-blue-600"
                  accentColor="#2563eb"
                  comparisonLabel={comparisonLabel}
                  formatValue={formatDashboardCurrency}
                />

                <ReportKpiCard
                  title="Total Items"
                  kpi={data.kpis.totalItems}
                  icon={Package}
                  iconTint="bg-emerald-100 text-emerald-600"
                  accentColor="#10b981"
                  comparisonLabel="units on hand"
                  formatValue={(v) => v.toLocaleString()}
                />

                <ReportKpiCard
                  title="Low Stock Items"
                  kpi={data.kpis.lowStockItems}
                  icon={TriangleAlert}
                  iconTint="bg-amber-100 text-amber-600"
                  accentColor="#f59e0b"
                  comparisonLabel="right now"
                  formatValue={(v) => v.toLocaleString()}
                />

                <ReportKpiCard
                  title="Out of Stock Items"
                  kpi={data.kpis.outOfStockItems}
                  icon={PackageX}
                  iconTint="bg-red-100 text-red-600"
                  accentColor="#ef4444"
                  comparisonLabel="right now"
                  formatValue={(v) => v.toLocaleString()}
                />
              </>
            )}
      </div>

      {/* Value Trend + Category Donut */}
      <div className="grid gap-2.5 sm:gap-3 lg:grid-cols-3">
        <Card className="border-border/60 shadow-sm lg:col-span-2">
          <CardHeader className="pb-1.5 px-3.5 pt-3 sm:px-5">
            <CardTitle className="text-xs font-semibold text-foreground sm:text-sm">
              Inventory Value Trend
            </CardTitle>
            {data && (
              <p className="text-[10px] text-muted-foreground sm:text-[11px]">
                {data.valueTrendNote}
              </p>
            )}
          </CardHeader>
          <CardContent className="px-2 pt-0 pb-2 sm:px-4">
            {loading || !data ? (
              <div className="h-[200px] animate-pulse rounded bg-muted sm:h-[240px]" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart
                  data={data.valueTrend}
                  margin={{ top: 4, right: 6, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="inv-value" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="period"
                    tickFormatter={periodTick}
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${Math.round(Number(value) / 1000)}K`}
                  />
                  <RechartsTooltip
                    formatter={(value) => {
                      const numericValue = typeof value === "number" ? value : Number(value ?? 0);
                      return [formatDashboardCurrency(numericValue), "Value"];
                    }}
                    labelFormatter={(label) => periodTick(String(label ?? ""))}
                  />
                  <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} fill="url(#inv-value)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <ReportDonut
          title="Inventory by Category (Value)"
          data={data?.inventoryByCategory ?? []}
          centerLabel="Total Value"
          centerValue={data ? formatDashboardCurrency(data.kpis.totalInventoryValue.value) : "-"}
          loading={loading}
          valueFormatter={formatDashboardCurrency}
        />
      </div>

      {/* Stock Status / Low Stock / Movements */}
      <div className="grid gap-2.5 sm:gap-3 lg:grid-cols-3">
        {/* Stock Status Overview */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-1.5 px-3.5 pt-3 sm:px-5">
            <CardTitle className="text-xs font-semibold text-foreground sm:text-sm">
              Stock Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 p-3.5 sm:p-4 pt-0">
            {loading || !data ? (
              <div className="h-[150px] animate-pulse rounded bg-muted" />
            ) : (
              data.stockStatus.map((s) => (
                <div key={s.status} className="space-y-0.5">
                  <div className="flex items-center justify-between text-[11px] sm:text-xs">
                    <span className="font-medium text-foreground">{s.label}</span>
                    <span className="text-muted-foreground">
                      {s.count} · {s.percent}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${STATUS_BAR_COLOR[s.status] ?? "bg-primary"}`}
                      style={{ width: `${s.percent}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Top Low Stock Items */}
        <Card className="overflow-hidden border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/40 px-3.5 py-2 sm:px-4">
            <CardTitle className="text-xs font-semibold tracking-tight sm:text-sm">
              Top Low Stock Items
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading || !data ? (
              <div className="h-[180px] animate-pulse bg-muted/40" />
            ) : data.topLowStockItems.length === 0 ? (
              <div className="flex min-h-[160px] items-center justify-center px-4 text-center text-[11px] text-muted-foreground">
                Everything is well stocked.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/40 hover:bg-transparent">
                      <TableHead className="h-8 px-2.5 text-[10px] font-medium text-muted-foreground sm:px-4 sm:text-[11px]">
                        Product
                      </TableHead>
                      <TableHead className="h-8 px-2.5 text-right text-[10px] font-medium text-muted-foreground sm:px-4 sm:text-[11px]">
                        Stock
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.topLowStockItems.map((item) => (
                      <TableRow key={item.id} className="border-border/30 hover:bg-muted/40">
                        <TableCell className="max-w-[140px] truncate px-2.5 py-2 sm:px-4">
                          <div className="text-[11px] font-medium text-foreground sm:text-xs">{item.name}</div>
                          {item.sku && (
                            <div className="text-[10px] text-muted-foreground sm:text-[11px]">{item.sku}</div>
                          )}
                        </TableCell>
                        <TableCell className="px-2.5 py-2 text-right sm:px-4">
                          <span
                            className={`text-[11px] font-semibold tabular-nums sm:text-xs ${
                              item.status === "out" ? "text-red-600" : "text-amber-600"
                            }`}
                          >
                            {item.currentStock}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Stock Movements */}
        <Card className="overflow-hidden border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/40 px-3.5 py-2 sm:px-4">
            <CardTitle className="text-xs font-semibold tracking-tight sm:text-sm">
              Recent Stock Movements
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading || !data ? (
              <div className="h-[180px] animate-pulse bg-muted/40" />
            ) : data.recentMovements.length === 0 ? (
              <div className="flex min-h-[160px] items-center justify-center px-4 text-center text-[11px] text-muted-foreground">
                No stock movements recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/40 hover:bg-transparent">
                      <TableHead className="h-8 px-2.5 text-[10px] font-medium text-muted-foreground sm:px-4 sm:text-[11px]">
                        Product
                      </TableHead>
                      <TableHead className="h-8 px-2.5 text-[10px] font-medium text-muted-foreground sm:px-4 sm:text-[11px]">
                        Type
                      </TableHead>
                      <TableHead className="h-8 px-2.5 text-right text-[10px] font-medium text-muted-foreground sm:px-4 sm:text-[11px]">
                        Qty
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recentMovements.map((m) => (
                      <TableRow key={m.id} className="border-border/30 hover:bg-muted/40">
                        <TableCell className="max-w-[120px] truncate px-2.5 py-2 sm:px-4">
                          <div className="text-[11px] font-medium text-foreground sm:text-xs">{m.productName}</div>
                          <div className="text-[10px] text-muted-foreground sm:text-[11px]">
                            {formatDate(m.date)}
                            {m.reference ? ` · ${m.reference}` : ""}
                          </div>
                        </TableCell>
                        <TableCell className="px-2.5 py-2 sm:px-4">
                          <span
                            className={`text-[11px] font-medium sm:text-xs ${
                              m.qty >= 0 ? "text-emerald-600" : "text-red-600"
                            }`}
                          >
                            {m.typeLabel}
                          </span>
                        </TableCell>
                        <TableCell className="px-2.5 py-2 text-right text-[11px] font-semibold tabular-nums sm:px-4 sm:text-xs">
                          {m.qty >= 0 ? `+${m.qty}` : m.qty}
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

      {/* Period Note */}
      {data && (
        <p className="rounded-md bg-muted/40 px-3 py-2 text-[10px] text-muted-foreground sm:text-[11px]">
          All inventory figures are based on your selected date range: {data.period.label}
        </p>
      )}
    </div>
  );
}