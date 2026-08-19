import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type SystemStatus = "operational" | "degraded" | "unknown";

export interface SystemHealthRow {
  id: string;
  label: string;
  status: SystemStatus;
  /** Shown next to the dot, e.g. "Operational", "Not monitored". */
  statusLabel: string;
}

const STATUS_DOT: Record<SystemStatus, string> = {
  operational: "bg-emerald-500",
  degraded: "bg-destructive",
  unknown: "bg-muted-foreground/40",
};

const STATUS_TEXT: Record<SystemStatus, string> = {
  operational: "text-emerald-600 dark:text-emerald-400",
  degraded: "text-destructive",
  unknown: "text-muted-foreground",
};

export default function SystemHealth({ rows, loading = false }: { rows: SystemHealthRow[]; loading?: boolean }) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-medium text-foreground">System Health</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-1">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-6 w-full animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            {rows.map((row) => (
              <div key={row.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2 text-foreground">
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", STATUS_DOT[row.status])} />
                  {row.label}
                </span>
                <span className={cn("text-xs font-medium", STATUS_TEXT[row.status])}>{row.statusLabel}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
