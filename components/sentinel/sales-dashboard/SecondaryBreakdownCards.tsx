"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatKES } from "@/lib/format";
import type {
  AgingBucket,
  PaymentMethodBreakdown,
  TopProduct,
} from "@/types/sentinel/sales-dashboard";

const AGING_COLORS = ["#2E7D32", "#F59E0B", "#F97316", "#DC2626", "#991B1B"];

export function OutstandingAgingChart({
  data,
  loading = false,
}: {
  data: AgingBucket[];
  loading?: boolean;
}) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>Outstanding invoice aging</CardTitle>
        <CardDescription>Unpaid balances on issued invoices, by days past due.</CardDescription>
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
                tick={{ fontSize: 10, fill: "#64748B" }}
                axisLine={{ stroke: "#E2E8F0" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748B" }}
                axisLine={false}
                tickLine={false}
                width={56}
                tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}K` : String(v))}
              />
              <RechartsTooltip
                formatter={(value) => [formatKES(Number(value)), "Outstanding"]}
                contentStyle={{ borderRadius: 8, borderColor: "#E2E8F0", fontSize: 12 }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((entry, i) => (
                  <Cell key={entry.label} fill={AGING_COLORS[i] ?? "#94A3B8"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function PaymentMethodsCard({
  data,
  caveat,
  loading = false,
}: {
  data: PaymentMethodBreakdown[];
  caveat: string;
  loading?: boolean;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>Payment methods</CardTitle>
        <CardDescription>{caveat}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="h-24 w-full animate-pulse rounded bg-muted" />
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No payments recorded in this period.</p>
        ) : (
          data.map((item) => (
            <div key={item.method} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{item.label}</span>
                <span className="text-xs text-muted-foreground">
                  {item.count} · {formatKES(item.value)}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-secondary"
                  style={{ width: `${Math.max(2, (item.value / total) * 100)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function TopProductsCard({
  data,
  loading = false,
}: {
  data: TopProduct[];
  loading?: boolean;
}) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>Top products</CardTitle>
        <CardDescription>By recognized revenue — delivered and fully paid.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-6 w-full animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recognized revenue in this period yet.</p>
        ) : (
          <ol className="space-y-2.5">
            {data.map((product, index) => (
              <li key={product.name} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
                    {index + 1}
                  </span>
                  <span className="truncate text-foreground">{product.name}</span>
                </span>
                <span className="shrink-0 text-right text-xs text-muted-foreground">
                  {product.quantity} units · {formatKES(product.revenue)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
