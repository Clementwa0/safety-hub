import Link from "next/link";
import { AlertTriangle, Info, type LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface AttentionItem {
  id: string;
  label: string;
  count: number;
  href: string;
  /** "warning" for stock-outs and similarly urgent items, "info" for
   *  routine follow-ups like drafts or unread messages. */
  severity: "warning" | "info";
}

const SEVERITY_ICON: Record<AttentionItem["severity"], LucideIcon> = {
  warning: AlertTriangle,
  info: Info,
};

const SEVERITY_STYLES: Record<AttentionItem["severity"], string> = {
  warning: "bg-destructive/10 text-destructive",
  info: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

export default function AttentionRequired({
  items,
  loading = false,
}: {
  items: AttentionItem[];
  loading?: boolean;
}) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-medium text-foreground">Attention Required</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-1">
        {loading ? (
          <div className="space-y-1.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 w-full animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex h-[100px] items-center justify-center text-sm text-muted-foreground">
            Nothing needs attention right now.
          </div>
        ) : (
          <div className="space-y-1">
            {items.map((item) => {
              const Icon = SEVERITY_ICON[item.severity];
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-1.5 py-2 text-sm transition-colors hover:bg-accent/60"
                >
                  <span className={cn("shrink-0 rounded-full p-1", SEVERITY_STYLES[item.severity])}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium text-foreground">{item.label}</span>
                  <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
                    {item.count}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
