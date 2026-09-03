"use client";

import { useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar";

import SidebarItem from "./SidebarItem";
import { sentinelNavigationItems } from "./navigation";

interface AppSidebarGroupProps {
  collapsed: boolean;
  onItemClick?: () => void;
}

const AppSidebarGroup = ({ collapsed, onItemClick }: AppSidebarGroupProps) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const visibleItems = useMemo(
    () => (isAdmin ? sentinelNavigationItems : sentinelNavigationItems.filter((item) => !item.adminOnly)),
    [isAdmin],
  );

  const isPathActive = useCallback(
    (path: string) => {
      if (!pathname || !path) return false;

      if (path === "/sentinel/dashboard") {
        return pathname === path || pathname === `${path}/`;
      }

      return pathname === path || pathname.startsWith(`${path}/`);
    },
    [pathname],
  );

  return (
    <SidebarGroup className="py-0">
      <SidebarGroupContent>
        <SidebarMenu className="space-y-1">
          {visibleItems.map((item) => {
            const childActive = item.children?.some((child) => isPathActive(child.path)) ?? false;
            const selfActive = isPathActive(item.path);
            return (
              <SidebarItem
                key={item.path}
                item={item}
                collapsed={collapsed}
                isActive={selfActive || childActive}
                isChildActive={childActive}
                isChildPathActive={isPathActive}
                onClick={onItemClick}
              />
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default AppSidebarGroup;
