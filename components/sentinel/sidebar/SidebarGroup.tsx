"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

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
import { adminStoreOrderService } from "@/services/sentinel/admin-store-order.service";

interface AppSidebarGroupProps {
  collapsed: boolean;
  onItemClick?: () => void;
}

const AppSidebarGroup = ({
  collapsed,
  onItemClick,
}: AppSidebarGroupProps) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const [badgeCounts, setBadgeCounts] = useState<Record<string, number>>(
    {}
  );

  /**
   * ============================================================
   * Load sidebar badge counts
   * ============================================================
   */
  useEffect(() => {
    let mounted = true;

    const controller = new AbortController();

    const loadStats = async () => {
      try {
        const [contactStats, storeStats] = await Promise.all([
          contactMessageService.stats({
            signal: controller.signal,
          }),

          adminStoreOrderService.stats({
            signal: controller.signal,
          }),
        ]);

        if (!mounted) return;

        setBadgeCounts({
          contactMessages: Math.max(0, contactStats.new ?? 0),
          storeOrders: Math.max(0, storeStats.pending ?? 0),
        });
      } catch (error) {
        if (controller.signal.aborted) return;

        // Sidebar badges should never break navigation.
        console.error("Failed to load sidebar statistics:", error);
      }
    };

    loadStats();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  /**
   * ============================================================
   * Role-filtered navigation
   * ============================================================
   *
   * Staff see everything except admin-only items (Users, Settings,
   * Reports) — matching the requireAdmin() gates on those routes/pages.
   * Groups left with no visible items (Insights, System, for staff)
   * are dropped entirely rather than rendered empty.
   */
  const visibleGroups = useMemo(() => {
    if (isAdmin) return sentinelNavigationGroups;

    return sentinelNavigationGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => !item.adminOnly),
      }))
      .filter((group) => group.items.length > 0);
  }, [isAdmin]);

  /**
   * ============================================================
   * Active route
   * ============================================================
   *
   * Exact match:
   * /sentinel/orders
   *
   * Nested match:
   * /sentinel/orders/123
   *
   * This keeps the Orders navigation item active on
   * order detail pages as well.
   */
  const isActive = useCallback(
    (path: string) => {
      if (!pathname || !path) return false;

      if (path === "/sentinel/dashboard") {
        return pathname === path || pathname === `${path}/`;
      }

      return (
        pathname === path ||
        pathname.startsWith(`${path}/`)
      );
    },
    [pathname]
  );

  /**
   * ============================================================
   * Badge lookup
   * ============================================================
   */
  const getBadge = useCallback(
    (key?: string) => {
      if (!key) return undefined;

      const count = badgeCounts[key];

      if (!count || count <= 0) {
        return undefined;
      }

      return count;
    },
    [badgeCounts]
  );

  return (
    <>
      {/* ========================================================
          DASHBOARD
      ========================================================= */}
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

      {/* ========================================================
          NAVIGATION GROUPS
      ========================================================= */}
      {visibleGroups.map((group) => (
        <SidebarGroup
          key={group.name}
          className="pt-3 pb-1"
        >
          {/* ====================================================
              GROUP LABEL
          ==================================================== */}
          {!collapsed && (
            <SidebarGroupLabel
              className={cn(
                "mb-1 h-7 px-2",
                "text-[10px] font-bold uppercase tracking-[0.12em]",
                "text-sidebar-foreground/60",
                "border-b border-l-2 border-sidebar-primary/40 pl-3"
              )}
            >
              {group.name}
            </SidebarGroupLabel>
          )}
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
};

export default AppSidebarGroup;