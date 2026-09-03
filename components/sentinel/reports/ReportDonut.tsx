"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DonutSlice } from "@/types/sentinel/reports";

const PALETTE = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#94a3b8"];

export default function ReportDonut({
  title,
  subtitle,
  data,
  centerLabel,
  centerValue,
  loading = false,
  valueFormatter = (v: number) => v.toLocaleString(),
}: {
  title: string;
  subtitle?: string;
  data: DonutSlice[];
  centerLabel: string;
  centerValue: string;
  loading?: boolean;
  valueFormatter?: (v: number) => string;
}) {
  return (
    <Card className="flex h-full flex-col border-border/70 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-foreground">{title}</CardTitle>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center pt-0">
        {loading ? (
          <div className="h-[220px] w-full animate-pulse rounded bg-muted" />
        ) : data.length === 0 ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
            No data for this period
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="relative h-[170px] w-[170px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={55}
                    outerRadius={82}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {data.map((slice, i) => (
                      <Cell key={slice.key} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-2 text-center">
                <span className="text-lg font-bold text-foreground">{centerValue}</span>
                <span className="text-[11px] text-muted-foreground">{centerLabel}</span>
              </div>
            </div>

            <ul className="flex min-w-0 flex-1 flex-col gap-2.5">
              {data.map((slice, i) => (
                <li key={slice.key} className="flex items-center gap-2 text-sm">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
                  />
                  <span className="min-w-0 flex-1 truncate text-foreground">{slice.label}</span>
                  <span className="shrink-0 text-xs font-semibold tabular-nums text-foreground">
                    {valueFormatter(slice.value)}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">({slice.percent}%)</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
