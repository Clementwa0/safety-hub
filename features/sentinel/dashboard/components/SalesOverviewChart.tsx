"use client";

import {
  Line,
  LineChart,
  CartesianGrid,
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
import type { TrendPoint, TrendRange } from "../computeDashboardData";
import { formatCurrency } from "@/lib/format";

interface SalesOverviewChartProps {
  data: TrendPoint[];
  range: TrendRange;
  onRangeChange: (range: TrendRange) => void;
  loading?: boolean;
  /** Defaults to "Sales" — the Dashboard's restrained overview passes
   *  "Business Activity" so the card doesn't read as a revenue chart. */
  title?: string;
}

export default function SalesOverviewChart({
  data,
  range,
  onRangeChange,
  loading = false,
  title = "Sales",
}: SalesOverviewChartProps) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-1.5">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        <Select 
          value={range} 
          onValueChange={(v) => typeof v === "string" && onRangeChange(v as TrendRange)}
        >
          <SelectTrigger className="h-7 w-[110px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="quarter">Quarter</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="mb-2 flex items-center gap-3 text-[10px] font-medium text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            Current
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
            Previous
          </span>
        </div>

        {loading ? (
          <div className="h-[250px] w-full animate-pulse rounded bg-muted" />
        ) : data.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-xs text-muted-foreground">
            No data
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "#64748B" }}
                axisLine={false}
                tickLine={false}
                interval={Math.max(0, Math.floor(data.length / 8))}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#64748B" }}
                axisLine={false}
                tickLine={false}
                width={40}
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
                dataKey="current"
                stroke="#2563EB"
                strokeWidth={2}
                dot={{ r: 2 }}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="previous"
                stroke="#CBD5E1"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}