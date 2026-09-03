"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  Package,
  ShoppingCart,
  Tag,
  TrendingDown,
} from "lucide-react";

import {
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  CartesianGrid,
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
import ReportRangePicker from "@/components/sentinel/reports/ReportRangePicker";
import ReportKpiCard from "@/components/sentinel/reports/ReportKpiCard";
import ReportDonut from "@/components/sentinel/reports/ReportDonut";
import { formatDashboardCurrency } from "@/features/sentinel/dashboard/computeDashboardData";
import { reportsService } from "@/services/sentinel/reports.service";

import type {
  ProductPerformanceReport as ProductPerformanceData,
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

function TrendIcon({ trend }: { trend: "up" | "down" | "flat" }) {
  if (trend === "up") return <ArrowUpRight className="size-3 text-emerald-600 sm:size-3.5" />;
  if (trend === "down") return <ArrowDownRight className="size-3 text-red-600 sm:size-3.5" />;
  return <Minus className="size-3 text-muted-foreground sm:size-3.5" />;
}

export default function ProductPerformanceReport() {
  const [range, setRange] = useState<ReportRange>("30d");
  const [data, setData] = useState<ProductPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (nextRange: ReportRange) => {
    setLoading(true);
    setError(null);
    try {
      setData(await reportsService.productPerformance({ range: nextRange }));
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not load the product performance report",
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
        title="Couldn't load the product performance report"
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
                  title="Total Products Sold"
                  kpi={data.kpis.totalProductsSold}
                  icon={ShoppingCart}
                  iconTint="bg-blue-100 text-blue-600"
                  accentColor="#2563eb"
                  comparisonLabel={comparisonLabel}
                  formatValue={(v) => v.toLocaleString()}
                />

                <ReportKpiCard
                  title="Total Revenue"
                  kpi={data.kpis.totalRevenue}
                  icon={Tag}
                  iconTint="bg-emerald-100 text-emerald-600"
                  accentColor="#10b981"
                  comparisonLabel={comparisonLabel}
                  formatValue={formatDashboardCurrency}
                />

                <Card className="border-border/60 shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
                        Best Seller
                      </p>
                      <span className="shrink-0 rounded-lg bg-purple-100 p-1.5 text-purple-600 sm:p-2">
                        <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs font-bold text-foreground sm:text-sm">
                      {data.kpis.topPerformingProduct?.name ?? "-"}
                    </p>
                    <p className="text-[10px] text-muted-foreground sm:text-xs">
                      {data.kpis.topPerformingProduct
                        ? formatDashboardCurrency(data.kpis.topPerformingProduct.revenue)
                        : "No sales yet"}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/60 shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
                        Slow Moving
                      </p>
                      <span className="shrink-0 rounded-lg bg-red-100 p-1.5 text-red-600 sm:p-2">
                        <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </span>
                    </div>
                    <p className="mt-0.5 text-xl font-bold tabular-nums text-foreground sm:text-2xl">
                      {data.kpis.slowMovingItemsCount}
                    </p>
                    <p className="text-[10px] text-muted-foreground sm:text-xs">
                      active products with no sales
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
      </div>

      {/* Sales Performance Trend */}
      <div className="grid gap-2.5 sm:gap-3 lg:grid-cols-2">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-1.5 px-3.5 pt-3 sm:px-5">
            <CardTitle className="text-xs font-semibold text-foreground sm:text-sm">
              Sales Performance Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pt-0 pb-2 sm:px-4">
            {loading || !data ? (
              <div className="h-[200px] animate-pulse rounded bg-muted sm:h-[260px]" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <ComposedChart
                  data={data.salesPerformanceTrend}
                  margin={{ top: 4, right: 6, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="period"
                    tickFormatter={periodTick}
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip
                    formatter={(value, name) => {
                      const numericValue = typeof value === "number" ? value : Number(value ?? 0);
                      if (name === "revenue") return [formatDashboardCurrency(numericValue), "Revenue"];
                      return [numericValue, "Units Sold"];
                    }}
                    labelFormatter={(label) => periodTick(String(label ?? ""))}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="unitsSold"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top / Low Performing Tables + Category Donut */}
      <div className="grid gap-2.5 sm:gap-3 lg:grid-cols-3">
        {/* Top Performing Products */}
        <Card className="overflow-hidden border-border/60 shadow-sm lg:col-span-1">
          <CardHeader className="border-b border-border/40 px-3.5 py-2 sm:px-4">
            <CardTitle className="text-xs font-semibold tracking-tight sm:text-sm">
              Top Performing
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading || !data ? (
              <div className="h-[180px] animate-pulse bg-muted/40" />
            ) : data.topPerformingProducts.length === 0 ? (
              <p className="px-4 py-6 text-center text-[11px] text-muted-foreground">
                No sales in this period
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/40 hover:bg-transparent">
                      <TableHead className="h-8 px-2.5 text-[10px] font-medium text-muted-foreground sm:px-4 sm:text-[11px]">
                        Product
                      </TableHead>
                      <TableHead className="h-8 px-2.5 text-right text-[10px] font-medium text-muted-foreground sm:px-4 sm:text-[11px]">
                        Revenue
                      </TableHead>
                      <TableHead className="h-8 w-8 px-2.5 text-right text-[10px] font-medium text-muted-foreground sm:px-4 sm:text-[11px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.topPerformingProducts.map((p) => (
                      <TableRow key={p.name} className="border-border/30 hover:bg-muted/40">
                        <TableCell className="max-w-[100px] truncate px-2.5 py-2 sm:px-4">
                          <div className="text-[11px] font-medium text-foreground sm:text-xs">{p.name}</div>
                          <div className="text-[10px] text-muted-foreground sm:text-[11px]">
                            {p.category} · {p.unitsSold} sold
                          </div>
                        </TableCell>
                        <TableCell className="px-2.5 py-2 text-right text-[11px] font-medium tabular-nums text-foreground sm:px-4 sm:text-xs">
                          {formatDashboardCurrency(p.revenue)}
                        </TableCell>
                        <TableCell className="px-2.5 py-2 text-right sm:px-4">
                          <TrendIcon trend={p.trend} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Performing Products */}
        <Card className="overflow-hidden border-border/60 shadow-sm lg:col-span-1">
          <CardHeader className="border-b border-border/40 px-3.5 py-2 sm:px-4">
            <CardTitle className="text-xs font-semibold tracking-tight sm:text-sm">
              Low Performing
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading || !data ? (
              <div className="h-[180px] animate-pulse bg-muted/40" />
            ) : data.lowPerformingProducts.length === 0 ? (
              <p className="px-4 py-6 text-center text-[11px] text-muted-foreground">
                No active products yet
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/40 hover:bg-transparent">
                      <TableHead className="h-8 px-2.5 text-[10px] font-medium text-muted-foreground sm:px-4 sm:text-[11px]">
                        Product
                      </TableHead>
                      <TableHead className="h-8 px-2.5 text-right text-[10px] font-medium text-muted-foreground sm:px-4 sm:text-[11px]">
                        Units
                      </TableHead>
                      <TableHead className="h-8 px-2.5 text-right text-[10px] font-medium text-muted-foreground sm:px-4 sm:text-[11px]">
                        Revenue
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.lowPerformingProducts.map((p) => (
                      <TableRow key={p.id} className="border-border/30 hover:bg-muted/40">
                        <TableCell className="max-w-[100px] truncate px-2.5 py-2 text-[11px] font-medium text-foreground sm:px-4 sm:text-xs">
                          {p.name}
                        </TableCell>
                        <TableCell className="px-2.5 py-2 text-right text-[11px] tabular-nums text-muted-foreground sm:px-4 sm:text-xs">
                          {p.unitsSold}
                        </TableCell>
                        <TableCell className="px-2.5 py-2 text-right text-[11px] font-medium tabular-nums text-foreground sm:px-4 sm:text-xs">
                          {formatDashboardCurrency(p.revenue)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance by Category */}
        <ReportDonut
          title="Performance by Category"
          data={data?.performanceByCategory ?? []}
          centerLabel="Total Revenue"
          centerValue={data ? formatDashboardCurrency(data.kpis.totalRevenue.value) : "-"}
          loading={loading}
          valueFormatter={formatDashboardCurrency}
        />
      </div>

      {/* Period Note */}
      {data && (
        <p className="rounded-md bg-muted/40 px-3 py-2 text-[10px] text-muted-foreground sm:text-[11px]">
          Performance metrics are calculated from completed sales within the selected date range:{" "}
          {data.period.label}
        </p>
      )}
    </div>
  );
}