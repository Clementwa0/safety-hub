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

  const showBadge = Boolean(
    badgeCount !== undefined && badgeCount > 0,
  );

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        tooltip={collapsed ? item.name : undefined}
        className={cn(
          /*
           * Base
           */
          "h-10 rounded-lg text-[13.5px]",
          "transition-all duration-150",
          "text-sidebar-foreground",

          /*
           * Active
           */
          isActive
            ? [
                "bg-sidebar-primary",
                "text-sidebar-primary-foreground",
                "shadow-sm",
                "hover:bg-sidebar-primary",
                "hover:text-sidebar-primary-foreground",
              ]
            : [
                "hover:bg-sidebar-accent",
                "hover:text-sidebar-accent-foreground",
              ],
        )}
      >
        <Link
          href={item.path}
          onClick={onClick}
          className="flex w-full items-center gap-3"
        >
          {/* =================================================
              ICON
          ================================================== */}
          <span className="relative shrink-0">
            <Icon
              className="h-[18px] w-[18px]"
              strokeWidth={2}
            />

            {/* Collapsed notification dot */}
            {showBadge && collapsed && (
              <span
                className="
                  absolute
                  -right-1
                  -top-1
                  h-2
                  w-2
                  rounded-full
                  bg-red-500
                  ring-2
                  ring-sidebar
                "
              />
            )}
          </span>

          {/* =================================================
              LABEL + BADGE
          ================================================== */}
          {!collapsed && (
            <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
              <span className="truncate font-medium">
                {item.name}
              </span>

              {showBadge && (
                <span
                  className={cn(
                    `
                      flex
                      h-5
                      min-w-5
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      px-1.5
                      text-[11px]
                      font-semibold
                    `,
                    isActive
                      ? [
                          "bg-sidebar-primary-foreground/20",
                          "text-sidebar-primary-foreground",
                        ]
                      : [
                          "bg-red-500",
                          "text-white",
                        ],
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
}