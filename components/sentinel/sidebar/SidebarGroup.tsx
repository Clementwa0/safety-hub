"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar";

import SidebarItem from "./SidebarItem";
import { sentinelNavigation } from "./navigation";

interface AppSidebarGroupProps {
  collapsed: boolean;
  onItemClick?: () => void;
}

export default function AppSidebarGroup({
  collapsed,
  onItemClick,
}: AppSidebarGroupProps) {
  const pathname = usePathname();

  const navigation = useMemo(() => sentinelNavigation, []);

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(`${path}/`);

  return (
    <SidebarGroup className="px-2 py-2">
      {!collapsed && (
        <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Operations
        </div>
      )}

      <SidebarGroupContent>
        <SidebarMenu className="space-y-1">
          {navigation.map((item) => (
            <SidebarItem
              key={item.path}
              item={item}
              collapsed={collapsed}
              isActive={isActive(item.path)}
              onClick={onItemClick}
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}