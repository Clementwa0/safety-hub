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
  onClick?: () => void;
}

export default function SidebarItem({
  item,
  collapsed,
  isActive,
  onClick,
}: SidebarItemProps) {
  const Icon = item.icon;

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
          <Icon className="h-5 w-5 shrink-0" />

          {!collapsed && (
            <span className="truncate text-sm font-medium">
              {item.name}
            </span>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}