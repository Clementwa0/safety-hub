import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
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
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </p>

          {loading ? (
            <div className="h-7 w-24 animate-pulse rounded-md bg-muted" />
          ) : (
            <p className="truncate text-2xl font-semibold text-foreground">
              {value}
            </p>
          )}

          {hint ? (
            <p className="truncate text-xs text-muted-foreground">{hint}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="rounded-xl bg-primary/10 p-2.5 text-primary">
            <Icon className="h-5 w-5" />
          </span>
          {trend ? (
            <span className="text-xs font-medium text-emerald-600">{trend}</span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
