"use client";

import Link from "next/link";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { statusColor, type StatusSlice } from "../computeDashboardData";

export default function OrderStatusDonut({
  data,
  total,
  loading = false,
}: {
  data: StatusSlice[];
  total: number;
  loading?: boolean;
}) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-sm font-medium text-foreground">Order Status</CardTitle>
        <Button
          variant="link"
          size="sm"
          className="p-0 text-xs"
        >
          <Link href="/sentinel/store-orders">View all</Link>
        </Button>
      </CardHeader>
      <CardContent className=" pt-1">
        {loading ? (
          <div className="h-[200px] w-full animate-pulse rounded bg-muted" />
        ) : data.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            No orders yet
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:items-center">
            <div className="relative h-[120px] w-[150px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="count"
                    nameKey="label"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {data.map((slice) => (
                      <Cell key={slice.status} fill={statusColor(slice.status)} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-foreground">{total}</span>
                <span className="text-[10px] text-muted-foreground">Total</span>
              </div>
            </div>

            <ul className="flex w-full flex-col gap-1.5">
              {data.map((slice) => (
                <li key={slice.status} className="flex items-center gap-2 text-xs">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: statusColor(slice.status) }}
                  />
                  <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                    {slice.label}
                  </span>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {slice.count} ({slice.percent}%)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}