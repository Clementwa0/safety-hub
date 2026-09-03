import Link from "next/link";
import { AlertTriangle, ChevronRight, Info, type LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface AttentionItem {
  id: string;
  label: string;
  description: string;
  href: string;
  severity: "warning" | "info";
}

const SEVERITY_ICON: Record<AttentionItem["severity"], LucideIcon> = {
  warning: AlertTriangle,
  info: Info,
};

const SEVERITY_STYLES: Record<AttentionItem["severity"], string> = {
  warning: "bg-red-100 text-red-600",
  info: "bg-amber-100 text-amber-600",
};

export default function AttentionRequired({
  items,
  loading = false,
}: {
  items: AttentionItem[];
  loading?: boolean;
}) {
  return (
    <Card className="flex h-full flex-col border-border/70 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-2 py-1.5 px-4">
        <CardTitle className="text-xs font-semibold text-foreground">
          Needs Your Attention
        </CardTitle>
        {items.length > 0 && (
          <Link
            href="/sentinel/inventory"
            className="flex items-center gap-0.5 text-[11px] font-semibold text-primary hover:underline"
          >
            View all alerts
            <ChevronRight className="h-3 w-3" />
          </Link>
        )}
      </CardHeader>
      <CardContent className="flex-1 px-4 pb-3 pt-0">
        {loading ? (
          <div className="space-y-1.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 w-full animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex h-[120px] items-center justify-center text-xs text-muted-foreground">
            Nothing needs attention right now.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => {
              const Icon = SEVERITY_ICON[item.severity];
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-2.5 rounded-lg px-0.5 py-2 transition-colors hover:bg-accent/60"
                  >
                    <span
                      className={cn(
                        "shrink-0 rounded-lg p-1.5",
                        SEVERITY_STYLES[item.severity]
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-foreground">
                        {item.label}
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {item.description}
                      </span>
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}