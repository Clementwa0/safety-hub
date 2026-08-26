"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatCurrency, formatDate } from "@/lib/format";
import { salesDashboardService } from "@/services/sentinel/sales-dashboard.service";
import {
  DASHBOARD_RANGES,
  type DashboardRange,
  type SalesDashboardResponse,
} from "@/types/sentinel/sales-dashboard";

const RANGE_LABELS: Record<DashboardRange, string> = {
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
  "12m": "12 months",
  custom: "Custom",
};

function Kpi({
  label,
  value,
  count,
}: {
  label: string;
  value: number;
  count: number;
}) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="space-y-1 p-4 sm:p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-md font-semibold tabular-nums text-foreground sm:text-xl">
          {formatCurrency(value)}
        </p>
        <p className="text-xs text-muted-foreground">
          {count} {count === 1 ? "record" : "records"}
        </p>
      </CardContent>
    </Card>
  );
}

export default function SalesReport() {
  const [range, setRange] = useState<DashboardRange>("30d");
  const [data, setData] = useState<SalesDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (nextRange: DashboardRange) => {
    setLoading(true);
    setError(null);
    try {
      const result = await salesDashboardService.get({ range: nextRange });
      setData(result);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not load the sales report",
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
      <EmptyState title="Couldn't load the sales report" description={error} />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-foreground">
          Sales overview
        </span>
        <Select
          value={range}
          onValueChange={(v) => setRange(v as DashboardRange)}
        >
          <SelectTrigger className="h-8 w-[130px] text-xs">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            {DASHBOARD_RANGES.filter((r) => r !== "custom").map((r) => (
              <SelectItem key={r} value={r}>
                {RANGE_LABELS[r]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {loading || !data ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-[86px] animate-pulse rounded-2xl bg-muted"
            />
          ))
        ) : (
          <>
            <Kpi
              label="Confirmed sales"
              value={data.kpis.confirmedSales.value}
              count={data.kpis.confirmedSales.count}
            />
            <Kpi
              label="Invoiced"
              value={data.kpis.invoiced.value}
              count={data.kpis.invoiced.count}
            />
            <Kpi
              label="Cash collected"
              value={data.kpis.cashCollected.value}
              count={data.kpis.cashCollected.count}
            />
            <Kpi
              label="Outstanding"
              value={data.kpis.outstanding.value}
              count={data.kpis.outstanding.count}
            />
            <Kpi
              label="Revenue recognized"
              value={data.kpis.revenueRecognized.value}
              count={data.kpis.revenueRecognized.count}
            />
          </>
        )}
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardHeader className="pb-1.5">
          <CardTitle className="text-sm font-semibold">Trend</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {loading || !data ? (
            <div className="h-[260px] w-full animate-pulse rounded bg-muted" />
          ) : data.series.length === 0 ? (
            <div className="flex h-[260px] items-center justify-center text-xs text-muted-foreground">
              No data for this range
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart
                data={data.series}
                margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E2E8F0"
                  vertical={false}
                />
                <XAxis
                  dataKey="period"
                  tick={{ fontSize: 10, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                  tickFormatter={(v: number) =>
                    v >= 1000 ? `${Math.round(v / 1000)}K` : String(v)
                  }
                />
                <RechartsTooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{ fontSize: 11, padding: "4px 8px" }}
                />
                <Line
                  type="monotone"
                  dataKey="confirmedSales"
                  name="Confirmed sales"
                  stroke="#2563EB"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="cashCollected"
                  name="Cash collected"
                  stroke="#16A34A"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="revenueRecognized"
                  name="Revenue recognized"
                  stroke="#F59E0B"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-1.5">
            <CardTitle className="text-sm font-semibold">Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {loading || !data ? (
              <div className="h-[180px] animate-pulse rounded bg-muted" />
            ) : (
              data.pipeline.map((stage) => (
                <div
                  key={stage.key}
                  className="flex items-center justify-between border-b border-border/50 py-1.5 text-sm last:border-0"
                >
                  <span className="text-muted-foreground">{stage.label}</span>
                  <span className="flex items-center gap-2 tabular-nums">
                    <span className="font-medium text-foreground">
                      {formatCurrency(stage.value)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({stage.count})
                    </span>
                    {stage.conversionRate !== undefined ? (
                      <Badge variant="outline" className="text-[10px]">
                        {stage.conversionRate}%
                      </Badge>
                    ) : null}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-1.5">
            <CardTitle className="text-sm font-semibold">
              Outstanding aging
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {loading || !data ? (
              <div className="h-[180px] animate-pulse rounded bg-muted" />
            ) : data.outstandingAging.every((b) => b.count === 0) ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                Nothing outstanding
              </p>
            ) : (
              data.outstandingAging.map((bucket) => (
                <div
                  key={bucket.label}
                  className="flex items-center justify-between border-b border-border/50 py-1.5 text-sm last:border-0"
                >
                  <span className="text-muted-foreground">{bucket.label}</span>
                  <span className="tabular-nums">
                    <span className="font-medium text-foreground">
                      {formatCurrency(bucket.value)}
                    </span>{" "}
                    <span className="text-xs text-muted-foreground">
                      ({bucket.count})
                    </span>
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-1.5">
            <CardTitle className="text-sm font-semibold">
              Orders by source
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {loading || !data ? (
              <div className="h-[140px] animate-pulse rounded bg-muted" />
            ) : (
              data.ordersBySource.map((source) => (
                <div
                  key={source.source}
                  className="flex items-center justify-between border-b border-border/50 py-1.5 text-sm last:border-0"
                >
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    {source.label}
                    {source.pendingImplementation ? (
                      <Badge variant="outline" className="text-[10px]">
                        not tracked yet
                      </Badge>
                    ) : null}
                  </span>
                  <span className="tabular-nums">
                    <span className="font-medium text-foreground">
                      {formatCurrency(source.value)}
                    </span>{" "}
                    <span className="text-xs text-muted-foreground">
                      ({source.count})
                    </span>
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-1.5">
            <CardTitle className="text-sm font-semibold">
              Payment methods
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {loading || !data ? (
              <div className="h-[140px] animate-pulse rounded bg-muted" />
            ) : data.paymentMethods.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                No payments recorded in this range
              </p>
            ) : (
              data.paymentMethods.map((method) => (
                <div
                  key={method.method}
                  className="flex items-center justify-between border-b border-border/50 py-1.5 text-sm last:border-0"
                >
                  <span className="text-muted-foreground">{method.label}</span>
                  <span className="tabular-nums">
                    <span className="font-medium text-foreground">
                      {formatCurrency(method.value)}
                    </span>{" "}
                    <span className="text-xs text-muted-foreground">
                      ({method.count})
                    </span>
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardHeader className="pb-1.5">
          <CardTitle className="text-sm font-semibold">
            Top products by revenue
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {loading || !data ? (
            <div className="h-[160px] animate-pulse rounded bg-muted" />
          ) : data.topProducts.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              No product sales in this range
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topProducts.map((product) => (
                  <TableRow key={product.name}>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {product.quantity}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(product.revenue)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {!loading && data ? (
        <p className="text-right text-xs text-muted-foreground">
          Generated {formatDate(data.generatedAt)} · {RANGE_LABELS[data.range]}
        </p>
      ) : null}
    </div>
  );
}
