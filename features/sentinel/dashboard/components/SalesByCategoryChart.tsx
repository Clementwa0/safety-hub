import Link from "next/link";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, Cell } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { CategorySalesRow } from "../computeDashboardData";
import { formatCurrency } from "@/lib/format";

const BAR_COLORS = ["#2563EB", "#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE", "#DBEAFE"];

export default function SalesByCategoryChart({
  data,
  loading = false,
}: {
  data: CategorySalesRow[];
  loading?: boolean;
}) {
  const chartHeight = Math.max(data.length * 40, 160);

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>Sales by Category</CardTitle>
        <Button
          variant="link"
          size="sm"
          nativeButton={false}
          render={<Link href="/sentinel/categories" />}
          className="h-auto p-0"
        >
          View report
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[240px] w-full animate-pulse rounded-md bg-muted" />
        ) : data.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No category sales yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ left: 8, right: 24, top: 4, bottom: 4 }}
              barCategoryGap={14}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="category"
                width={112}
                tick={{ fontSize: 12, fill: "#334155" }}
                axisLine={false}
                tickLine={false}
              />
              <RechartsTooltip
                formatter={(value) => formatCurrency(Number(value ?? 0))} contentStyle={{ borderRadius: 8, borderColor: "#E2E8F0", fontSize: 12 }}
                cursor={{ fill: "rgba(37, 99, 235, 0.06)" }}
              />
              <Bar dataKey="revenue" radius={[0, 6, 6, 0]} barSize={16}>
                {data.map((entry, index) => (
                  <Cell key={entry.category} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
