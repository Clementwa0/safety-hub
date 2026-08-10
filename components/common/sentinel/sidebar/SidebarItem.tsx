"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";
import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import type { NavigationItem } from "./navigation";

interface SidebarItemProps {
  item: NavigationItem;
  collapsed: boolean;
  isActive: boolean;
  badgeCount?: number;
  onClick?: () => void;
}

export default function SidebarItem({
  item,
  collapsed,
  isActive,
  badgeCount,
  onClick,
}: SidebarItemProps) {
  const Icon = item.icon;
  const showBadge = Boolean(badgeCount && badgeCount > 0);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        tooltip={collapsed ? item.name : undefined}
        className={cn(
          "h-11 rounded-lg transition-all duration-200",
          isActive
            ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <Link
          href={item.path}
          onClick={onClick}
          className="flex w-full items-center gap-3"
        >
          <span className="relative shrink-0">
            <Icon className="h-5 w-5" />
            {showBadge && collapsed && (
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive" />
            )}
          </span>

          {!collapsed && (
            <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
              <span className="truncate text-sm font-medium">{item.name}</span>
              {showBadge && (
                <span
                  className={cn(
                    "flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold",
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-destructive text-destructive-foreground"
                  )}
                >
                  {badgeCount && badgeCount > 99 ? "99+" : badgeCount}
                </span>
              )}
            </span>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}