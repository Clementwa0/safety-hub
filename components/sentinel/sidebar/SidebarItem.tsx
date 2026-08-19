"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

import type { NavigationItem } from "./navigation";

interface SidebarItemProps {
  item: NavigationItem;
  collapsed: boolean;
  isActive: boolean;
  badgeCount?: number;
  onClick?: () => void;
}

const SidebarItem = ({
  item,
  collapsed,
  isActive,
  badgeCount,
  onClick,
}: SidebarItemProps) => {
  const Icon = item.icon;
  const showBadge = Boolean(badgeCount && badgeCount > 0);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        tooltip={collapsed ? item.name : undefined}
        className={cn(
          // Base
          "relative h-10 rounded-lg text-[13.5px] font-medium",
          "transition-all duration-200",

          // Normal hover
          "hover:bg-sidebar-accent",
          "hover:text-sidebar-accent-foreground",
          "hover:shadow-sm",

          // Desktop hover
          "md:hover:scale-[1.01]",

          // Active
          isActive && [
            "bg-sidebar-primary",
            "text-sidebar-primary-foreground",
            "shadow-sm",

            // Active indicator
            "before:absolute",
            "before:left-0",
            "before:top-1/2",
            "before:h-6",
            "before:w-0.5",
            "before:-translate-y-1/2",
            "before:rounded-full",
            "before:bg-sidebar-primary-foreground/60",
          ],

          // Mobile
          "max-sm:hover:scale-100",
          "max-sm:hover:shadow-none",
        )}
      >
        <Link
          href={item.path}
          onClick={onClick}
          className={cn(
            "flex w-full items-center",
            collapsed ? "justify-center" : "gap-3",
          )}
        >
          {/* Icon */}
          <span className="relative flex shrink-0 items-center justify-center">
            <Icon
              className="!h-[21px] !w-[21px] shrink-0"
              strokeWidth={2}
              aria-hidden="true"
            />

            {/* Collapsed notification indicator */}
            {showBadge && collapsed && (
              <span
                aria-label={`${badgeCount} notifications`}
                className="
                  absolute
                  -right-1
                  -top-1
                  h-2.5
                  w-2.5
                  rounded-full
                  bg-red-500
                  ring-2
                  ring-sidebar
                "
              />
            )}
          </span>

          {/* Label + badge */}
          {!collapsed && (
            <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
              <span className="truncate">{item.name}</span>

              {showBadge && (
                <span
                  className={cn(
                    "flex h-5 min-w-[20px] shrink-0",
                    "items-center justify-center",
                    "rounded-full px-1.5",
                    "text-[11px] font-semibold leading-none",
                    "badge-pop",
                    isActive
                      ? "bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground"
                      : "bg-red-500 text-white",
                  )}
                >
                  {badgeCount! > 99 ? "99+" : badgeCount}
                </span>
              )}
            </span>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export default SidebarItem;
