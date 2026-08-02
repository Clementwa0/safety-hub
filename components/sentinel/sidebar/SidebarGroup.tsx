"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar";

import SidebarItem from "./SidebarItem";
import { sentinelNavigation, type NavigationItem } from "./navigation";
import { contactMessageService } from "@/services/contact-message.service";

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

  // Lightweight, one-shot fetch of the new-message count for the sidebar
  // badge. No polling/real-time infrastructure — it simply refreshes when
  // the sidebar mounts (e.g. on navigation into the admin area).
  const [badgeCounts, setBadgeCounts] = useState<Partial<Record<NonNullable<NavigationItem["badgeKey"]>, number>>>({});

  useEffect(() => {
    let cancelled = false;

    contactMessageService
      .stats()
      .then((stats) => {
        if (!cancelled) {
          setBadgeCounts((current) => ({ ...current, contactMessages: stats.new }));
        }
      })
      .catch(() => {
        // Badge counts are supplementary; a failure here shouldn't block navigation.
      });

    return () => {
      cancelled = true;
    };
  }, [pathname]);

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
              badgeCount={item.badgeKey ? badgeCounts[item.badgeKey] : undefined}
              onClick={onItemClick}
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}