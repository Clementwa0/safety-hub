"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatKES } from "@/lib/format";
import type { OrderSourceBreakdown, OrderStatusBreakdown } from "@/types/sentinel/sales-dashboard";

const STATUS_COLORS: Record<string, string> = {
  pending: "#94A3B8",
  confirmed: "#0F2D52",
  processing: "#2563EB",
  shipped: "#F59E0B",
  delivered: "#2E7D32",
  cancelled: "#DC2626",
};

export function OrdersByStatusChart({
  data,
  loading = false,
}: {
  data: OrderStatusBreakdown[];
  loading?: boolean;
}) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>Orders by status</CardTitle>
        <CardDescription>Storefront and B2B sales orders combined, current snapshot.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[220px] w-full animate-pulse rounded-md bg-muted" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#64748B" }}
                axisLine={{ stroke: "#E2E8F0" }}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} width={28} />
              <RechartsTooltip
                formatter={(value) => [`${Number(value)} orders`, ""]}
                contentStyle={{ borderRadius: 8, borderColor: "#E2E8F0", fontSize: 12 }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#94A3B8"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function OrdersBySourceCard({
  data,
  loading = false,
}: {
  data: OrderSourceBreakdown[];
  loading?: boolean;
}) {
  const maxValue = Math.max(1, ...data.map((d) => d.value));

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>Orders by source</CardTitle>
        <CardDescription>Where confirmed orders originated from, by value.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 w-full animate-pulse rounded bg-muted" />
            ))
          : data.map((item) => (
              <div key={item.source} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    {item.label}
                    {item.pendingImplementation ? (
                      <Badge variant="secondary" className="text-[10px]">
                        Not yet tracked
                      </Badge>
                    ) : null}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.count} · {formatKES(item.value)}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.max(2, (item.value / maxValue) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
      </CardContent>
    </Card>
  );
}
