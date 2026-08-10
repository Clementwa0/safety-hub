import type { LucideIcon } from "lucide-react";
import { Info } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatKES } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface KpiCardProps {
  title: string;
  value: number;
  count: number;
  countLabel: string;
  explanation: string;
  icon: LucideIcon;
  tone?: "default" | "success" | "warning" | "info";
  loading?: boolean;
}

const TONE_CLASSES: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
};

export default function KpiCard({
  title,
  value,
  count,
  countLabel,
  explanation,
  icon: Icon,
  tone = "default",
  loading = false,
}: KpiCardProps) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {title}
            </p>
            <Tooltip>
              <TooltipTrigger className="text-muted-foreground/70 hover:text-muted-foreground">
                <Info className="h-3.5 w-3.5" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[260px] text-left">
                {explanation}
              </TooltipContent>
            </Tooltip>
          </div>
          <span className={cn("shrink-0 rounded-xl p-2", TONE_CLASSES[tone])}>
            <Icon className="h-4 w-4" />
          </span>
        </div>

        {loading ? (
          <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
        ) : (
          <p className="truncate text-2xl font-semibold tabular-nums text-foreground">
            {formatKES(value)}
          </p>
        )}

        {loading ? (
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
        ) : (
          <p className="text-xs text-muted-foreground">
            {count} {countLabel}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
