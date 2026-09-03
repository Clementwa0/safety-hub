"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="flex h-full flex-col border-border/70 shadow-sm">
      <CardHeader className="py-1.5 px-4">
        <CardTitle className="text-xs font-semibold text-foreground">
          Order Status
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between px-4 pb-3 pt-0">
        {loading ? (
          <div className="h-[150px] w-full animate-pulse rounded bg-muted" />
        ) : data.length === 0 ? (
          <div className="flex h-[150px] items-center justify-center text-xs text-muted-foreground">
            No orders yet
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="relative h-[120px] w-[120px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      dataKey="count"
                      nameKey="label"
                      innerRadius={40}
                      outerRadius={58}
                      paddingAngle={1.5}
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
                  <span className="text-[10px] text-muted-foreground">Total Orders</span>
                </div>
              </div>

              <ul className="flex min-w-0 flex-1 flex-col gap-2">
                {data.map((slice) => (
                  <li key={slice.status} className="flex items-center gap-1.5 text-xs">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: statusColor(slice.status) }}
                    />
                    <span className="min-w-0 flex-1 truncate text-foreground">{slice.label}</span>
                    <span className="shrink-0 text-xs font-semibold tabular-nums text-foreground">
                      {slice.count}
                    </span>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      ({slice.percent}%)
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/sentinel/store-orders"
              className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
            >
              View all orders
              <ArrowRight className="h-3 w-3" />
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}