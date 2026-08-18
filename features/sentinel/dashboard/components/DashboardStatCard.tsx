import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ChangeStat } from "../computeDashboardData";

interface DashboardStatCardProps {
  title: string;
  value: string;
  icon?: LucideIcon; 
  iconTint?: string;
  loading?: boolean;
  trend?: ChangeStat;
  lines?: { label: string; tone: "success" | "warning" | "muted" }[];
}

export default function DashboardStatCard({
  title,
  value,
  icon: Icon,
  iconTint,
  loading = false,
  trend,
  lines,
}: DashboardStatCardProps) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          {Icon && iconTint && (
            <span className={cn("shrink-0 rounded-lg p-1.5", iconTint)}>
              <Icon className="h-4 w-4" />
            </span>
          )}
        </div>

        {loading ? (
          <div className="mt-1 h-6 w-20 animate-pulse rounded bg-muted" />
        ) : (
          <p className="text-xl font-bold tabular-nums text-foreground">{value}</p>
        )}

        {trend && !loading && (
          <div className="mt-1 flex items-center gap-1 text-[10px]">
            <span
              className={cn(
                "font-semibold",
                trend.isUp ? "text-emerald-600" : "text-red-600",
              )}
            >
              {trend.isUp ? "+" : "-"}
              {trend.change === null ? "—" : `${Math.abs(trend.change).toFixed(1)}%`}
            </span>
            <span className="text-muted-foreground">{trend.comparisonLabel}</span>
          </div>
        )}

        {lines && !loading && lines.length > 0 && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {lines.map((line) => (
              <span
                key={line.label}
                className={cn(
                  "text-[9px] font-medium",
                  line.tone === "success" && "text-emerald-600",
                  line.tone === "warning" && "text-amber-600",
                  line.tone === "muted" && "text-muted-foreground",
                )}
              >
                {line.label}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}