"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Info,
  MapPin,
  Repeat,
  ShoppingCart,
  Target,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

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
import { formatDate } from "@/lib/format";
import ReportRangePicker from "@/components/sentinel/reports/ReportRangePicker";
import ReportKpiCard from "@/components/sentinel/reports/ReportKpiCard";
import ReportDonut from "@/components/sentinel/reports/ReportDonut";
import { formatDashboardCurrency } from "@/features/sentinel/dashboard/computeDashboardData";
import { reportsService } from "@/services/sentinel/reports.service";
import type {
  CustomerInsightsReport as CustomerInsightsData,
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

const INSIGHT_ICON = {
  "high-value": Target,
  reengagement: UserPlus,
  repeat: Repeat,
};

export default function CustomerInsightsReport() {
  const [range, setRange] = useState<ReportRange>("30d");
  const [data, setData] = useState<CustomerInsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (nextRange: ReportRange) => {
    setLoading(true);
    setError(null);
    try {
      setData(await reportsService.customerInsights({ range: nextRange }));
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not load customer insights",
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
      <EmptyState title="Couldn't load customer insights" description={error} />
    );
  }

  const comparisonLabel = data?.period.previousLabel ?? "";

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-end">
        <ReportRangePicker value={range} onChange={setRange} />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-5">
        {loading || !data ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="border-border/70 shadow-sm">
              <CardContent className="p-4">
                <div className="h-16 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <ReportKpiCard
              title="Total Customers"
              kpi={data.kpis.totalCustomers}
              icon={Users}
              iconTint="bg-blue-100 text-blue-600"
              accentColor="#2563eb"
              comparisonLabel={comparisonLabel}
              formatValue={(v) => v.toLocaleString()}
            />
            <ReportKpiCard
              title="New Customers"
              kpi={data.kpis.newCustomers}
              icon={UserPlus}
              iconTint="bg-emerald-100 text-emerald-600"
              accentColor="#10b981"
              comparisonLabel={comparisonLabel}
              formatValue={(v) => v.toLocaleString()}
            />
            <ReportKpiCard
              title="Repeat Customers"
              kpi={data.kpis.repeatCustomers}
              icon={Repeat}
              iconTint="bg-purple-100 text-purple-600"
              accentColor="#8b5cf6"
              comparisonLabel={comparisonLabel}
              formatValue={(v) => v.toLocaleString()}
            />
            <ReportKpiCard
              title="Avg. Customer Value"
              kpi={data.kpis.averageCustomerValue}
              icon={Wallet}
              iconTint="bg-amber-100 text-amber-600"
              accentColor="#f59e0b"
              comparisonLabel={comparisonLabel}
              formatValue={formatDashboardCurrency}
            />
            <ReportKpiCard
              title="Customer Retention Rate"
              kpi={data.kpis.retentionRate}
              icon={MapPin}
              iconTint="bg-teal-100 text-teal-600"
              accentColor="#14b8a6"
              comparisonLabel={comparisonLabel}
              formatValue={(v) => `${v}%`}
            />
          </>
        )}
      </div>

      {/* Trend + segment donut */}
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
        <Card className="border-border/70 shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">
              Customer Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loading || !data ? (
              <div className="h-[260px] animate-pulse rounded bg-muted" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart
                  data={data.customerTrend}
                  margin={{ top: 4, right: 8, left: -12, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="period"
                    tickFormatter={periodTick}
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip
                    formatter={(value, name) => {
                      const numericValue =
                        typeof value === "number" ? value : Number(value ?? 0);

                      return [
                        numericValue,
                        name === "newCustomers"
                          ? "New Customers"
                          : "Repeat Customers",
                      ];
                    }}
                    labelFormatter={(label) => periodTick(String(label ?? ""))}
                  />{" "}
                  <Line
                    type="monotone"
                    dataKey="newCustomers"
                    name="New Customers"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="repeatCustomers"
                    name="Repeat Customers"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <ReportDonut
          title="Customers by Segment"
          data={data?.customersBySegment ?? []}
          centerLabel="Total Customers"
          centerValue={
            data ? data.kpis.totalCustomers.value.toLocaleString() : "-"
          }
          loading={loading}
        />
      </div>
      {data && (
        <p className="flex items-start gap-1.5 rounded-lg bg-muted/40 px-3.5 py-2.5 text-[11px] text-muted-foreground sm:text-xs">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          {data.segmentDefinitions}
        </p>
      )}

      {/* Top customers / frequency / activity */}
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/50 px-3.5 py-3 sm:px-5">
            <CardTitle className="text-sm font-semibold tracking-tight">
              Top Customers by Spend
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading || !data ? (
              <div className="h-[240px] animate-pulse bg-muted/40" />
            ) : data.topCustomersBySpend.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-muted-foreground">
                No customer orders yet
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead className="h-9 px-3 text-[11px] font-medium text-muted-foreground sm:px-5 sm:text-xs">
                        Customer
                      </TableHead>
                      <TableHead className="h-9 px-3 text-right text-[11px] font-medium text-muted-foreground sm:px-5 sm:text-xs">
                        Spend
                      </TableHead>
                      <TableHead className="h-9 px-3 text-right text-[11px] font-medium text-muted-foreground sm:px-5 sm:text-xs">
                        Orders
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.topCustomersBySpend.map((c) => (
                      <TableRow
                        key={c.id}
                        className="border-border/40 hover:bg-muted/40"
                      >
                        <TableCell className="max-w-[120px] truncate px-3 py-2.5 text-xs font-medium text-foreground sm:px-5 sm:py-3">
                          {c.name}
                        </TableCell>
                        <TableCell className="px-3 py-2.5 text-right text-xs font-medium tabular-nums text-foreground sm:px-5 sm:py-3">
                          {formatDashboardCurrency(c.totalSpend)}
                        </TableCell>
                        <TableCell className="px-3 py-2.5 text-right text-xs tabular-nums text-muted-foreground sm:px-5 sm:py-3">
                          {c.orders}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">
              Customer Purchase Frequency
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {loading || !data ? (
              <div className="h-[220px] animate-pulse rounded bg-muted" />
            ) : (
              data.purchaseFrequency.map((f) => (
                <div key={f.bucket} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">
                      {f.bucket}
                    </span>
                    <span className="text-muted-foreground">
                      {f.customers} · {f.percent}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${f.percent}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/50 px-3.5 py-3 sm:px-5">
            <CardTitle className="text-sm font-semibold tracking-tight">
              Recent Customer Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading || !data ? (
              <div className="h-[240px] animate-pulse bg-muted/40" />
            ) : data.recentActivity.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-muted-foreground">
                No recent activity
              </p>
            ) : (
              <ul className="divide-y divide-border/40">
                {data.recentActivity.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 sm:px-5"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <ShoppingCart className="size-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-foreground">
                        {a.customerName}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {a.activity} · {formatDate(a.date)}
                      </p>
                    </div>
                    {a.amount !== undefined && (
                      <span className="shrink-0 text-xs font-semibold tabular-nums text-foreground">
                        {formatDashboardCurrency(a.amount)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      {data && data.insights.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          {data.insights.map((insight) => {
            const Icon = INSIGHT_ICON[insight.icon];
            return (
              <Card key={insight.title} className="border-border/70 shadow-sm">
                <CardContent className="flex items-start gap-3 p-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {insight.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {insight.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {data && (
        <p className="rounded-lg bg-muted/40 px-3.5 py-2.5 text-[11px] text-muted-foreground sm:text-xs">
          All customer insights are based on your selected date range:{" "}
          {data.period.label}
        </p>
      )}
    </div>
  );
}
