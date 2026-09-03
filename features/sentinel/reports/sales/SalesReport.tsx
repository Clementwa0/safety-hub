"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DollarSign,
  MapPin,
  ShoppingBag,
  TrendingUp,
  Wallet,
} from "lucide-react";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
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
import ReportKpiCard, {
  UnavailableKpiCard,
} from "@/components/sentinel/reports/ReportKpiCard";
import ReportDonut from "@/components/sentinel/reports/ReportDonut";
import StatusBadge from "@/components/sentinel/reports/StatusBadge";
import { formatDashboardCurrency } from "@/features/sentinel/dashboard/computeDashboardData";
import { reportsService } from "@/services/sentinel/reports.service";

import type {
  ReportRange,
  SalesOverviewReport as SalesOverviewData,
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

export default function SalesOverviewReport() {
  const [range, setRange] = useState<ReportRange>("30d");
  const [data, setData] = useState<SalesOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (nextRange: ReportRange) => {
    setLoading(true);
    setError(null);
    try {
      setData(await reportsService.salesOverview({ range: nextRange }));
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not load the sales overview",
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
        title="Couldn't load the sales overview"
        description={error}
      />
    );
  }

  const comparisonLabel = data?.period.previousLabel ?? "";

  // Show only the 4 most recent orders to keep the view compact
  const recentOrders = data?.recentOrders.slice(0, 4) ?? [];

  return (
    <div className="space-y-2.5 sm:space-y-3">
      {/* Range */}
      <div className="flex items-center justify-end">
        <ReportRangePicker value={range} onChange={setRange} />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-2 sm:gap-2.5 lg:grid-cols-4">
        {loading || !data
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-border/60 shadow-sm">
                <CardContent className="p-3">
                  <div className="h-14 animate-pulse rounded bg-muted" />
                </CardContent>
              </Card>
            ))
          : (
              <>
                <ReportKpiCard
                  title="Total Revenue"
                  kpi={data.kpis.totalRevenue}
                  icon={DollarSign}
                  iconTint="bg-blue-100 text-blue-600"
                  accentColor="#2563eb"
                  comparisonLabel={comparisonLabel}
                  formatValue={formatDashboardCurrency}
                />

                <ReportKpiCard
                  title="Total Orders"
                  kpi={data.kpis.totalOrders}
                  icon={ShoppingBag}
                  iconTint="bg-emerald-100 text-emerald-600"
                  accentColor="#10b981"
                  comparisonLabel={comparisonLabel}
                  formatValue={(v) => v.toLocaleString()}
                />

                <ReportKpiCard
                  title="Average Order Value"
                  kpi={data.kpis.averageOrderValue}
                  icon={Wallet}
                  iconTint="bg-purple-100 text-purple-600"
                  accentColor="#8b5cf6"
                  comparisonLabel={comparisonLabel}
                  formatValue={formatDashboardCurrency}
                />

                <UnavailableKpiCard
                  title="Gross Profit"
                  icon={TrendingUp}
                  iconTint="bg-orange-100 text-orange-600"
                  reason={data.kpis.grossProfit.reason}
                />
              </>
            )}
      </div>

      {/* Revenue & Orders Trend + Revenue by Category */}
      <div className="grid gap-2.5 sm:gap-3 lg:grid-cols-3">
        <Card className="border-border/60 shadow-sm lg:col-span-2">
          <CardHeader className="pb-1.5 px-3.5 pt-3 sm:px-5">
            <CardTitle className="text-xs font-semibold text-foreground sm:text-sm">
              Revenue &amp; Orders Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pt-0 pb-2 sm:px-4">
            {loading || !data ? (
              <div className="h-[200px] animate-pulse rounded bg-muted sm:h-[240px]" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <ComposedChart
                  data={data.trend}
                  margin={{ top: 4, right: 6, left: -10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="period"
                    tickFormatter={periodTick}
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip
                    formatter={(value, name) => {
                      const numericValue = typeof value === "number" ? value : Number(value ?? 0);
                      if (name === "revenue") {
                        return [formatDashboardCurrency(numericValue), "Revenue"];
                      }
                      return [numericValue, "Orders"];
                    }}
                    labelFormatter={(label) => periodTick(String(label ?? ""))}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="orders"
                    fill="#bfdbfe"
                    radius={[3, 3, 0, 0]}
                    barSize={12}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <ReportDonut
          title="Revenue by Category"
          data={data?.revenueByCategory ?? []}
          centerLabel="Total Revenue"
          centerValue={data ? formatDashboardCurrency(data.kpis.totalRevenue.value) : "-"}
          loading={loading}
          valueFormatter={formatDashboardCurrency}
        />
      </div>

      {/* Sales by Source / Recent Orders / Sales by Location */}
      <div className="grid gap-2.5 sm:gap-3 lg:grid-cols-3">
        {/* Sales by Source */}
        <Card className="overflow-hidden border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/40 px-3.5 py-2 sm:px-4">
            <CardTitle className="text-xs font-semibold tracking-tight sm:text-sm">
              Sales by Source
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 p-3.5 sm:p-4">
            {loading || !data ? (
              <div className="h-[150px] animate-pulse bg-muted/40" />
            ) : data.salesBySource.every((s) => s.revenue === 0) ? (
              <p className="py-6 text-center text-[11px] text-muted-foreground">
                No sales in this period
              </p>
            ) : (
              data.salesBySource.map((s) => (
                <div key={s.channel} className="space-y-0.5">
                  <div className="flex items-center justify-between text-[11px] sm:text-xs">
                    <span className="font-medium text-foreground">{s.label}</span>
                    <span className="text-muted-foreground">
                      {formatDashboardCurrency(s.revenue)} · {s.percent}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${s.percent}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground sm:text-[11px]">
                    {s.orders} order{s.orders === 1 ? "" : "s"}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Orders – compact and mobile-first */}
        <Card className="overflow-hidden border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/40 px-3.5 py-2 sm:px-4">
            <CardTitle className="text-xs font-semibold tracking-tight sm:text-sm">
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading || !data ? (
              <div className="h-[180px] animate-pulse bg-muted/40" />
            ) : recentOrders.length === 0 ? (
              <p className="px-4 py-6 text-center text-[11px] text-muted-foreground">
                No orders yet
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/40 hover:bg-transparent">
                      <TableHead className="h-7 px-2.5 text-[10px] font-medium text-muted-foreground sm:px-4 sm:text-[11px]">
                        Order
                      </TableHead>
                      <TableHead className="h-7 px-2.5 text-right text-[10px] font-medium text-muted-foreground sm:px-4 sm:text-[11px]">
                        Amount
                      </TableHead>
                      <TableHead className="h-7 px-2.5 text-right text-[10px] font-medium text-muted-foreground sm:px-4 sm:text-[11px]">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((o) => (
                      <TableRow key={o.id} className="border-border/30 hover:bg-muted/40">
                        <TableCell className="px-2.5 py-1.5 sm:px-4 sm:py-2">
                          <div className="text-[10px] font-medium text-foreground sm:text-xs">
                            #{o.number}
                          </div>
                          <div className="truncate text-[9px] text-muted-foreground sm:text-[11px]">
                            {o.customerName} · {formatDate(o.date)}
                          </div>
                        </TableCell>
                        <TableCell className="px-2.5 py-1.5 text-right text-[10px] font-medium tabular-nums text-foreground sm:px-4 sm:py-2 sm:text-xs">
                          {formatDashboardCurrency(o.amount)}
                        </TableCell>
                        <TableCell className="px-2.5 py-1.5 text-right sm:px-4 sm:py-2">
                          <StatusBadge status={o.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sales by Location */}
        <Card className="overflow-hidden border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/40 px-3.5 py-2 sm:px-4">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-xs font-semibold tracking-tight sm:text-sm">
                Sales by Location
              </CardTitle>
              <MapPin className="size-3.5 text-muted-foreground sm:size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5 p-3.5 sm:p-4">
            {loading || !data ? (
              <div className="h-[150px] animate-pulse bg-muted/40" />
            ) : data.salesByLocation.length === 0 ? (
              <p className="py-6 text-center text-[11px] text-muted-foreground">
                No storefront orders in this period
              </p>
            ) : (
              <>
                {data.salesByLocation.map((loc) => (
                  <div key={loc.location} className="space-y-0.5">
                    <div className="flex items-center justify-between text-[11px] sm:text-xs">
                      <span className="font-medium text-foreground">{loc.location}</span>
                      <span className="text-muted-foreground">
                        {formatDashboardCurrency(loc.revenue)} · {loc.percent}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${loc.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
                <p className="pt-0.5 text-[10px] text-muted-foreground sm:text-[11px]">
                  {data.salesByLocationScopeNote}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Period note */}
      {data && (
        <p className="rounded-md bg-muted/40 px-3 py-2 text-[10px] text-muted-foreground sm:text-[11px]">
          All figures are based on your selected date range: {data.period.label}
        </p>
      )}
    </div>
  );
}