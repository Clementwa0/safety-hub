"use client";

import { Info } from "lucide-react";
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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RevenueOrdersPoint, TrendRange } from "../computeDashboardData";
import { formatDashboardCurrency } from "../computeDashboardData";

interface SalesOverviewChartProps {
  data: RevenueOrdersPoint[];
  range: TrendRange;
  onRangeChange: (range: TrendRange) => void;
  loading?: boolean;
}

export default function SalesOverviewChart({
  data,
  range,
  onRangeChange,
  loading = false,
}: SalesOverviewChartProps) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-1.5 py-1.5 px-3">
        <CardTitle className="flex items-center gap-1 text-[11px] font-semibold">
          Revenue & Orders
          <Info className="h-2.5 w-2.5 text-muted-foreground" aria-hidden="true" />
        </CardTitle>
        <Select
          value={range}
          onValueChange={(v) => typeof v === "string" && onRangeChange(v as TrendRange)}
        >
          <SelectTrigger className="h-6 w-[100px] text-[10px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last 7 days</SelectItem>
            <SelectItem value="month">This month</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pb-2 pt-0">
        <div className="mb-1.5 flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            Revenue
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-200" />
            Orders
          </span>
        </div>

        {loading ? (
          <div className="h-[200px] w-full animate-pulse rounded bg-muted" />
        ) : data.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-[10px] text-muted-foreground">
            No data for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 2 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 9, fill: "#64748B" }}
                axisLine={false}
                tickLine={false}
                interval={Math.max(0, Math.floor(data.length / 5))}
              />
              <YAxis
                yAxisId="revenue"
                tick={{ fontSize: 9, fill: "#64748B" }}
                axisLine={false}
                tickLine={false}
                width={32}
                tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}K` : String(v))}
                label={{
                  value: "KES",
                  position: "insideTopLeft",
                  fontSize: 8,
                  fill: "#94A3B8",
                  offset: 2,
                }}
              />
              <YAxis
                yAxisId="orders"
                orientation="right"
                tick={{ fontSize: 9, fill: "#64748B" }}
                axisLine={false}
                tickLine={false}
                width={24}
                allowDecimals={false}
                label={{
                  value: "Orders",
                  position: "insideTopRight",
                  fontSize: 8,
                  fill: "#94A3B8",
                  offset: 2,
                }}
              />
              <RechartsTooltip
                formatter={(value, name) =>
                  name === "revenue" ? formatDashboardCurrency(Number(value)) : String(value)
                }
                labelFormatter={(label) => label}
                contentStyle={{ fontSize: 10, padding: "4px 6px", borderRadius: 4 }}
              />
              <Bar
                yAxisId="orders"
                dataKey="orders"
                name="orders"
                fill="#BFDBFE"
                radius={[2, 2, 0, 0]}
                barSize={14}
              />
              <Line
                yAxisId="revenue"
                type="monotone"
                dataKey="revenue"
                name="revenue"
                stroke="#2563EB"
                strokeWidth={1.5}
                dot={{ r: 2.5, fill: "#2563EB", strokeWidth: 0 }}
                activeDot={{ r: 3.5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}