import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Info } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import KpiSparkline from "@/features/sentinel/dashboard/components/KpiSparkline";
import type { ReportKpi } from "@/types/sentinel/reports";

export default function ReportKpiCard({
  title,
  kpi,
  icon: Icon,
  iconTint,
  accentColor,
  comparisonLabel,
  loading = false,
  formatValue = (v: number) => v.toLocaleString(),
}: {
  title: string;
  kpi: ReportKpi;
  icon: LucideIcon;
  iconTint: string;
  accentColor: string;
  comparisonLabel: string;
  loading?: boolean;
  formatValue?: (value: number) => string;
}) {
  const isUp = (kpi.changePct ?? 0) >= 0;

  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
            {title}
          </p>
          <span className={cn("shrink-0 rounded-lg p-1.5 sm:p-2", iconTint)}>
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </span>
        </div>

        {loading ? (
          <div className="mt-1.5 h-6 w-20 animate-pulse rounded bg-muted sm:mt-2 sm:h-7 sm:w-24" />
        ) : (
          <p className="mt-1 text-xl font-bold tabular-nums text-foreground sm:mt-1.5 sm:text-2xl">
            {formatValue(kpi.value)}
          </p>
        )}

        {!loading && kpi.changePct !== undefined && (
          <div className="mt-1 flex items-center gap-1 text-[10px] sm:mt-1.5 sm:text-xs">
            <span
              className={cn(
                "flex items-center gap-0.5 font-semibold",
                isUp ? "text-emerald-600" : "text-red-600"
              )}
            >
              {isUp ? (
                <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              ) : (
                <ArrowDownRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              )}
              {Math.abs(kpi.changePct)}%
            </span>
            <span className="truncate text-muted-foreground">{comparisonLabel}</span>
          </div>
        )}

        {!loading && kpi.sparkline.length > 1 && (
          <div className="-mx-0.5 mt-1.5 sm:-mx-1 sm:mt-2">
            <KpiSparkline data={kpi.sparkline} color={accentColor} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function UnavailableKpiCard({
  title,
  icon: Icon,
  iconTint,
  reason,
}: {
  title: string;
  icon: LucideIcon;
  iconTint: string;
  reason: string;
}) {
  return (
    <Card className="border-border/70 border-dashed shadow-sm">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
            {title}
          </p>
          <span className={cn("shrink-0 rounded-lg p-1.5 sm:p-2", iconTint)}>
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </span>
        </div>
        <p className="mt-1 text-xl font-bold tabular-nums text-muted-foreground sm:mt-1.5 sm:text-2xl">-</p>
        <div className="mt-1 flex items-start gap-1 text-[10px] text-muted-foreground sm:mt-1.5 sm:text-xs">
          <Info className="mt-0.5 h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
          <span>{reason}</span>
        </div>
      </CardContent>
    </Card>
  );
}