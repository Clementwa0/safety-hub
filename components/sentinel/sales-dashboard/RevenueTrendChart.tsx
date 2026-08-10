"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatKES } from "@/lib/format";
import type { DashboardRange, SeriesPoint } from "@/types/sentinel/sales-dashboard";

export interface RevenueTrendChartProps {
  series: SeriesPoint[];
  range: DashboardRange;
  onRangeChange: (range: DashboardRange) => void;
  granularity: "day" | "week" | "month";
  loading?: boolean;
}

const RANGE_OPTIONS: { value: DashboardRange; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "12m", label: "12 months" },
];

function formatPeriod(period: string, granularity: "day" | "week" | "month"): string {
  if (granularity === "month") {
    const [year, month] = period.split("-");
    return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("en-KE", {
      month: "short",
      year: "2-digit",
    });
  }
  return new Date(period).toLocaleDateString("en-KE", { day: "2-digit", month: "short" });
}

export default function RevenueTrendChart({
  series,
  range,
  onRangeChange,
  granularity,
  loading = false,
}: RevenueTrendChartProps) {
  const data = series.map((point) => ({
    ...point,
    label: formatPeriod(point.period, granularity),
  }));

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>Sales, invoiced &amp; cash collected</CardTitle>
          <CardDescription>
            Confirmed sales, invoiced value, cash actually collected, and recognized revenue over
            time — kept as separate lines because they are separate events.
          </CardDescription>
        </div>
        <Select
          value={range}
          onValueChange={(value) => typeof value === "string" && onRangeChange(value as DashboardRange)}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] w-full animate-pulse rounded-md bg-muted" />
        ) : data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            No sales activity in this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0F2D52" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0F2D52" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="fillCash" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2E7D32" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#64748B" }}
                axisLine={{ stroke: "#E2E8F0" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748B" }}
                axisLine={false}
                tickLine={false}
                width={64}
                tickFormatter={(v: number) =>
                  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `${Math.round(v / 1000)}K` : String(v)
                }
              />
              <RechartsTooltip
                formatter={(value, name) => [formatKES(Number(value)), String(name)]}
                contentStyle={{
                  borderRadius: 8,
                  borderColor: "#E2E8F0",
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="confirmedSales"
                name="Confirmed sales"
                stroke="#0F2D52"
                fill="url(#fillSales)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="invoiced"
                name="Invoiced"
                stroke="#F59E0B"
                fill="none"
                strokeWidth={2}
                strokeDasharray="4 3"
              />
              <Area
                type="monotone"
                dataKey="cashCollected"
                name="Cash collected"
                stroke="#2E7D32"
                fill="url(#fillCash)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="revenueRecognized"
                name="Revenue recognized"
                stroke="#2563EB"
                fill="none"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
