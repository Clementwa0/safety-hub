"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import SidebarItem from "./SidebarItem";
import {
  sentinelNavigation,
  sentinelSalesNavigation,
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
  const [salesOpen, setSalesOpen] = useState(false);
  const [badgeCounts, setBadgeCounts] = useState<Record<string, number>>({});

  const isSalesRoute = useMemo(() => 
    sentinelSalesNavigation.items.some(
      (item) => pathname === item.path || pathname.startsWith(`${item.path}/`)
    ),
    [pathname]
  );

  useEffect(() => {
    if (isSalesRoute) setSalesOpen(true);
  }, [isSalesRoute]);

  useEffect(() => {
    let mounted = true;
    contactMessageService.stats()
      .then(stats => mounted && setBadgeCounts(prev => ({ ...prev, contactMessages: stats.new })))
      .catch(() => {});
    return () => { mounted = false; };
  }, [pathname]);

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);
  const getBadge = (key?: string) => (key && badgeCounts[key] > 0 ? badgeCounts[key] : undefined);

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-1">
          {sentinelNavigation.map((item) => (
            <SidebarItem
              key={item.path}
              item={item}
              collapsed={collapsed}
              isActive={isActive(item.path)}
              badgeCount={getBadge(item.badgeKey)}
              onClick={onItemClick}
            />
          ))}

          <SidebarMenuItem>
            <SidebarMenuButton
              type="button"
              onClick={() => !collapsed && setSalesOpen(prev => !prev)}
              isActive={sentinelSalesNavigation.items.some(item => isActive(item.path))}
              tooltip={collapsed ? "Sales" : undefined}
              className="h-11 rounded-lg transition-all text-muted-foreground hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
            >
              <sentinelSalesNavigation.icon className="size-4 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate text-sm font-medium">Sales</span>
                  <ChevronDown className={`size-4 shrink-0 transition-transform ${salesOpen ? "rotate-180" : ""}`} />
                </>
              )}
            </SidebarMenuButton>

            {!collapsed && salesOpen && (
              <SidebarMenuSub className="ml-4 mt-1 border-l border-border/60 pl-3">
                {sentinelSalesNavigation.items.map((item) => {
                  const badge = getBadge(item.badgeKey);
                  return (
                    <SidebarMenuSubItem key={item.path}>
                      <SidebarMenuSubButton
                        isActive={isActive(item.path)}
                        className="min-h-9 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-medium"
                      >
                        <a href={item.path} onClick={onItemClick} className="flex w-full items-center gap-2">
                          <item.icon className="size-3.5 shrink-0" />
                          <span className="min-w-0 flex-1 truncate">{item.name}</span>
                          {badge && (
                            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-semibold text-destructive-foreground">
                              {badge > 99 ? "99+" : badge}
                            </span>
                          )}
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  );
                })}
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
