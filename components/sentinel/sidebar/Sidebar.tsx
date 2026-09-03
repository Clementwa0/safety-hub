"use client";

import { useCallback } from "react";
import Link from "next/link";
import { Shield } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

import AppSidebarGroup from "./SidebarGroup";
import QuickActions from "./QuickActions";

const AppSidebar = () => {
  const { state, isMobile, setOpenMobile } = useSidebar();

  const collapsed = state === "collapsed";

  const handleItemClick = useCallback(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [isMobile, setOpenMobile]);

  return (
    <Sidebar
      collapsible="icon"
      className="dark group/sidebar border-sidebar-border bg-sidebar text-sidebar-foreground"
    >
      <SidebarHeader className="border-b border-sidebar-border px-2 py-2.5">
        <Link
          href="/sentinel/dashboard"
          onClick={handleItemClick}
          aria-label="Safety Hub dashboard"
          className={`flex h-8 items-center transition-all duration-300 ${collapsed ? "justify-center" : "gap-2"}`}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-400 shadow-sm">
            <Shield
              className="h-4 w-4 text-sidebar"
              strokeWidth={2.5}
              fill="currentColor"
              aria-hidden="true"
            />
          </div>

          {!collapsed && (
            <div className="flex min-w-0 flex-col overflow-hidden animate-in fade-in duration-300">
              <h2 className="truncate text-sm font-bold leading-tight tracking-tight text-sidebar-foreground">
                Safety Hub
              </h2>
              <p className="truncate text-[10px] leading-tight text-sidebar-foreground/60">
                Admin Panel
              </p>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="relative px-2 py-2 [scrollbar-width:thin] [scrollbar-color:var(--sidebar-border)_transparent]">
        {/* Decorative vector SVG background – covers bottom 1/4 of sidebar */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden"
          style={{ height: "25%" }}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 400 200"
            preserveAspectRatio="none"
            className="h-full w-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="sidebar-shapes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
                <stop offset="30%" stopColor="currentColor" stopOpacity="0.2" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.35" />
              </linearGradient>
              <linearGradient id="sidebar-shapes-2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
                <stop offset="40%" stopColor="currentColor" stopOpacity="0.15" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.3" />
              </linearGradient>
            </defs>

            {/* Large soft circles */}
            <circle cx="60" cy="160" r="90" fill="currentColor" opacity="0.15" />
            <circle cx="340" cy="120" r="70" fill="currentColor" opacity="0.12" />
            <circle cx="200" cy="190" r="50" fill="currentColor" opacity="0.1" />

            {/* Abstract flowing waves */}
            <path
              d="M0 180 Q50 140 100 170 T200 150 T300 175 T400 140 L400 200 L0 200Z"
              fill="url(#sidebar-shapes)"
            />
            <path
              d="M0 160 Q80 120 160 155 T320 130 T400 165 L400 200 L0 200Z"
              fill="url(#sidebar-shapes-2)"
            />

            {/* Decorative dots – more visible */}
            <circle cx="50" cy="130" r="5" fill="currentColor" opacity="0.2" />
            <circle cx="120" cy="100" r="4" fill="currentColor" opacity="0.15" />
            <circle cx="280" cy="90" r="6" fill="currentColor" opacity="0.18" />
            <circle cx="350" cy="150" r="4" fill="currentColor" opacity="0.2" />
            <circle cx="200" cy="180" r="5" fill="currentColor" opacity="0.15" />
            <circle cx="400" cy="80" r="3" fill="currentColor" opacity="0.12" />

            {/* Hexagon-inspired shapes */}
            <polygon
              points="380,50 400,60 400,80 380,90 360,80 360,60"
              fill="currentColor"
              opacity="0.12"
            />
            <polygon
              points="30,30 50,40 50,60 30,70 10,60 10,40"
              fill="currentColor"
              opacity="0.08"
            />
          </svg>
        </div>

        <AppSidebarGroup collapsed={collapsed} onItemClick={handleItemClick} />
        {!collapsed && <QuickActions onItemClick={handleItemClick} />}
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;