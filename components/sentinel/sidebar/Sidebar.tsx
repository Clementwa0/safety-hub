"use client";

import { useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Headset,
  ShieldCheck,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

import AppSidebarGroup from "./SidebarGroup";

const AppSidebar = () => {
  const {
    state,
    isMobile,
    setOpenMobile,
    toggleSidebar,
  } = useSidebar();

  const collapsed = state === "collapsed";

  const handleItemClick = useCallback(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [isMobile, setOpenMobile]);

  return (
    <Sidebar
      collapsible="icon"
      className="
        group/sidebar
        border-sidebar-border
        bg-sidebar
        text-sidebar-foreground
      "
    >
      {/* =====================================================
          COLLAPSE TOGGLE
      ====================================================== */}
      {!isMobile && (
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={
            collapsed ? "Expand sidebar" : "Collapse sidebar"
          }
          aria-expanded={!collapsed}
          className="
            absolute
            -right-3
            top-6
            z-50
            flex
            h-7
            w-7
            items-center
            justify-center
            rounded-full
            border
            border-sidebar-border
            bg-sidebar
            text-sidebar-foreground
            shadow-sm
            opacity-0
            transition-all
            duration-200
            hover:scale-105
            hover:bg-sidebar-accent
            hover:text-sidebar-accent-foreground
            focus-visible:opacity-100
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-sidebar-ring
            group-hover/sidebar:opacity-100
          "
        >
          {collapsed ? (
            <ChevronRight
              className="h-4 w-4"
              aria-hidden="true"
            />
          ) : (
            <ChevronLeft
              className="h-4 w-4"
              aria-hidden="true"
            />
          )}
        </button>
      )}

      {/* =====================================================
          HEADER / BRAND
      ====================================================== */}
      <SidebarHeader
        className="
          border-b
          border-sidebar-border
          px-3
          py-4
        "
      >
        <Link
          href="/sentinel/dashboard"
          onClick={handleItemClick}
          aria-label="HSE Hub dashboard"
          className={`
            flex
            h-9
            items-center
            transition-all
            duration-300
            ${collapsed ? "justify-center" : "gap-2.5"}
          `}
        >
          {/* Logo */}
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-sidebar-primary
              shadow-sm
            "
          >
            <ShieldCheck
              className="h-5 w-5 text-sidebar-primary-foreground"
              strokeWidth={2.25}
              aria-hidden="true"
            />
          </div>

          {/* Brand */}
          {!collapsed && (
            <div
              className="
                flex
                min-w-0
                flex-col
                overflow-hidden
                animate-in
                fade-in
                duration-300
              "
            >
              <h2
                className="
                  truncate
                  text-base
                  font-extrabold
                  leading-tight
                  tracking-tight
                  text-sidebar-foreground
                "
              >
                HSE HUB
              </h2>

              <p
                className="
                  truncate
                  text-[10px]
                  font-semibold
                  leading-tight
                  tracking-wider
                  text-sidebar-foreground/60
                "
              >
                PPE &amp; SAFETY SOLUTIONS
              </p>
            </div>
          )}
        </Link>
      </SidebarHeader>

      {/* =====================================================
          NAVIGATION
      ====================================================== */}
      <SidebarContent
        className="
          px-2.5
          py-3
          [scrollbar-width:thin]
          [scrollbar-color:var(--sidebar-border)_transparent]
        "
      >
        <AppSidebarGroup
          collapsed={collapsed}
          onItemClick={handleItemClick}
        />
      </SidebarContent>

      {/* =====================================================
          FOOTER / SUPPORT
      ====================================================== */}
      {!collapsed && (
        <SidebarFooter
          className="
            border-t
            border-sidebar-border
            p-3
            animate-in
            fade-in
            duration-300
          "
        >
          <div
            className="
              flex
              items-start
              gap-3
              rounded-xl
              bg-sidebar-accent
              p-3
              transition-colors
              duration-200
            "
          >
            {/* Support Icon */}
            <span
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-sidebar-primary/15
                text-sidebar-primary
              "
            >
              <Headset
                className="h-[18px] w-[18px]"
                aria-hidden="true"
              />
            </span>

            {/* Support Content */}
            <div className="min-w-0 space-y-1">
              <p
                className="
                  text-[13px]
                  font-semibold
                  leading-tight
                  text-sidebar-accent-foreground
                "
              >
                Need Help?
              </p>

              <p
                className="
                  text-[11px]
                  leading-snug
                  text-sidebar-foreground/70
                "
              >
                We&apos;re here to support you
              </p>

              <button
                type="button"
                className="
                  text-[11px]
                  font-semibold
                  text-emerald-600
                  transition-colors
                  hover:text-emerald-700
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-sidebar-ring
                  dark:text-emerald-400
                  dark:hover:text-emerald-300
                  dark:hover:text-emerald-300
                "
              >
                Contact Support
              </button>
            </div>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
};

export default AppSidebar;