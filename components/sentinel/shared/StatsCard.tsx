import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StatsCardProps {
  title: string;
  value: string;
  icon?: LucideIcon;
  hint?: string;
  trend?: string;
  loading?: boolean;
  className?: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  hint,
  trend,
  loading = false,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn("border-border/70 shadow-sm", className)}>
      <CardContent className="flex items-start justify-between gap-3 p-4 sm:gap-4 sm:p-5">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </p>

          {loading ? (
            <div className="h-6 w-20 animate-pulse rounded-md bg-muted sm:h-7 sm:w-24" />
          ) : (
            <p className="break-words text-md font-semibold tabular-nums text-foreground sm:text-xl">
              {value}
            </p>
          )}

          {hint ? (
            <p className="truncate text-xs text-muted-foreground">{hint}</p>
          ) : null}
        </div>

        {Icon || trend ? (
          <div className="flex shrink-0 flex-col items-end gap-2">
            {Icon ? (
              <span className="rounded-xl bg-primary/10 p-2 text-primary sm:p-2.5">
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </span>
            ) : null}
            {trend ? (
              <span className="text-xs font-medium text-emerald-600">{trend}</span>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}