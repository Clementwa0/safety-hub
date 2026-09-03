import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import KpiSparkline from "./KpiSparkline";

interface DashboardStatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  iconTint: string;
  accentColor: string;
  loading?: boolean;
  sparkline?: number[];
  trend?: {
    isUp: boolean;
    label: string;
  };
  comparisonLabel?: string;
}

export default function DashboardStatCard({
  title,
  value,
  icon: Icon,
  iconTint,
  accentColor,
  loading = false,
  sparkline,
  trend,
  comparisonLabel,
}: DashboardStatCardProps) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="p-2.5">
        <div className="flex items-center justify-between gap-1.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
          <span className={cn("shrink-0 rounded-lg p-1.5", iconTint)}>
            <Icon className="h-3.5 w-3.5" />
          </span>
        </div>

        {loading ? (
          <div className="mt-1.5 h-6 w-20 animate-pulse rounded bg-muted" />
        ) : (
          <p className="mt-0.5 text-xl font-bold tabular-nums text-foreground">{value}</p>
        )}

        {trend && !loading && (
          <div className="mt-1 flex items-center gap-1 text-[11px]">
            <span
              className={cn(
                "flex items-center gap-0.5 font-semibold",
                trend.isUp ? "text-emerald-600" : "text-red-600",
              )}
            >
              {trend.isUp ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {trend.label}
            </span>
            {comparisonLabel && (
              <span className="truncate text-muted-foreground">{comparisonLabel}</span>
            )}
          </div>
        )}

        {sparkline && sparkline.length > 1 && !loading && (
          <div className="-mx-0.5 mt-1">
            <KpiSparkline data={sparkline} color={accentColor} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}