"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";
import { sentinelQuickActions } from "./navigation";

export default function QuickActions({ onItemClick }: { onItemClick?: () => void }) {
  return (
    <div className="mt-3 border-t border-sidebar-border pt-3">
      <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-[0.12em] text-sidebar-foreground/50">
        Quick Actions
      </p>
      <ul className="space-y-0.5">
        {sentinelQuickActions.map((action) => {
          const Icon = action.icon;
          return (
            <li key={action.path}>
              <Link
                href={action.path}
                onClick={onItemClick}
                className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-[13.5px] font-medium text-sidebar-foreground/90 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white",
                    action.tint,
                  )}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
                </span>
                <span className="truncate">{action.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
