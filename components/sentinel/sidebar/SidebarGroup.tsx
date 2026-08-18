"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar";

import SidebarItem from "./SidebarItem";

import {
  sentinelDashboardItem,
  sentinelNavigationGroups,
} from "./navigation";

import { contactMessageService } from "@/services/sentinel/contact-message.service";

interface AppSidebarGroupProps {
  collapsed: boolean;
  onItemClick?: () => void;
}

export default function AppSidebarGroup({
  collapsed,
  onItemClick,
}: AppSidebarGroupProps) {
  const pathname = usePathname();

  const [badgeCounts, setBadgeCounts] = useState<Record<string, number>>(
    {},
  );

  /* ==========================================================
     LOAD BADGE COUNTS
  ========================================================== */

  useEffect(() => {
    let mounted = true;

    contactMessageService
      .stats()
      .then((stats) => {
        if (!mounted) return;

        setBadgeCounts((prev) => ({
          ...prev,
          contactMessages: stats.new,
        }));
      })
      .catch(() => {
        // Silently ignore badge statistics failures.
      });

    return () => {
      mounted = false;
    };
  }, [pathname]);

  /* ==========================================================
     ACTIVE ROUTE
  ========================================================== */

  const isActive = (path: string) => {
    return (
      pathname === path ||
      pathname.startsWith(`${path}/`)
    );
  };

  /* ==========================================================
     BADGE
  ========================================================== */

  const getBadge = (key?: string) => {
    if (!key) return undefined;

    const count = badgeCounts[key];

    return count > 0 ? count : undefined;
  };

  return (
    <>
    
      <SidebarGroup className="pb-0">
        <SidebarGroupContent>
          <SidebarMenu className="space-y-1">
            <SidebarItem
              item={sentinelDashboardItem}
              collapsed={collapsed}
              isActive={isActive(sentinelDashboardItem.path)}
              onClick={onItemClick}
            />
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* ======================================================
          NAVIGATION GROUPS
      ======================================================= */}

      {sentinelNavigationGroups.map((group) => (
        <SidebarGroup
          key={group.name}
          className="pt-3"
        >
          {/* Group heading */}
          {!collapsed && (
            <SidebarGroupLabel
              className="
                px-2
                text-[10px]
                font-semibold
                uppercase
                tracking-wider
                text-sidebar-foreground/70
              "
            >
              {group.name}
            </SidebarGroupLabel>
          )}

          {/* Group items */}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {group.items.map((item) => (
                <SidebarItem
                  key={item.path}
                  item={item}
                  collapsed={collapsed}
                  isActive={isActive(item.path)}
                  badgeCount={getBadge(item.badgeKey)}
                  onClick={onItemClick}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}