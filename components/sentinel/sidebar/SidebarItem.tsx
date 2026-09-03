"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

import type { NavigationItem } from "./navigation";

interface SidebarItemProps {
  item: NavigationItem;
  collapsed: boolean;
  /** True when the item's own path (or, for expandable items, any of its children's paths) matches the current route. */
  isActive: boolean;
  /** True when one of this item's children matches the current route - keeps the submenu auto-expanded while on that page. */
  isChildActive: boolean;
  isChildPathActive: (path: string) => boolean;
  onClick?: () => void;
}

const rowClassName = (isActive: boolean) =>
  cn(
    "relative h-10 rounded-lg text-[13.5px] font-medium",
    "transition-all duration-200",
    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
    isActive && [
      "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm",
      "before:absolute before:left-0 before:top-1/2 before:h-6 before:w-0.5",
      "before:-translate-y-1/2 before:rounded-full before:bg-sidebar-primary-foreground/60",
    ],
  );

const SidebarItem = ({
  item,
  collapsed,
  isActive,
  isChildActive,
  isChildPathActive,
  onClick,
}: SidebarItemProps) => {
  const Icon = item.icon;
  const hasChildren = Boolean(item.children?.length);
  const [manualOpen, setManualOpen] = useState<boolean | null>(null);
  const open = manualOpen ?? isChildActive;

  if (!hasChildren) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={isActive}
          tooltip={collapsed ? item.name : undefined}
          className={rowClassName(isActive)}
          render={<Link href={item.path} onClick={onClick} />}
        >
          <span className={cn("flex w-full items-center", collapsed ? "justify-center" : "gap-3")}>
            <Icon className="!h-[21px] !w-[21px] shrink-0" strokeWidth={2} aria-hidden="true" />
            {!collapsed && <span className="truncate">{item.name}</span>}
          </span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        tooltip={collapsed ? item.name : undefined}
        className={cn(rowClassName(isActive), "pr-1")}
        render={<div />}
      >
        <Link
          href={item.path}
          onClick={onClick}
          className={cn("flex min-w-0 flex-1 items-center", collapsed ? "justify-center" : "gap-3")}
        >
          <Icon className="!h-[21px] !w-[21px] shrink-0" strokeWidth={2} aria-hidden="true" />
          {!collapsed && <span className="truncate">{item.name}</span>}
        </Link>

        {!collapsed && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setManualOpen(!open);
            }}
            aria-label={open ? `Collapse ${item.name}` : `Expand ${item.name}`}
            aria-expanded={open}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md hover:bg-sidebar-primary-foreground/10"
          >
            <ChevronRight
              className={cn("h-4 w-4 shrink-0 transition-transform duration-200", open && "rotate-90")}
              aria-hidden="true"
            />
          </button>
        )}
      </SidebarMenuButton>

      {!collapsed && open && (
        <SidebarMenuSub>
          {item.children!.map((child) => (
            <SidebarMenuSubItem key={child.path}>
              <SidebarMenuSubButton
                isActive={isChildPathActive(child.path)}
                render={<Link href={child.path} onClick={onClick} />}
              >
                <span className="truncate">{child.name}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
};

export default SidebarItem;
