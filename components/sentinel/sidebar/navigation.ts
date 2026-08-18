import type { LucideIcon } from "lucide-react";

import {
  LayoutDashboard,
  Package,
  Tags,
  ClipboardList,
  Receipt,
  Users,
  Settings,
  ShoppingBag,
  MessagesSquare,
  TrendingUp,
  Bell,
} from "lucide-react";

export interface NavigationItem {
  name: string;
  path: string;
  icon: LucideIcon;
  badgeKey?: "contactMessages" | "orderRequests";
}

export interface NavigationGroup {
  name: string;
  items: NavigationItem[];
}

/**
 * Standalone dashboard item shown above the grouped sections.
 */
export const sentinelDashboardItem: NavigationItem = {
  name: "Dashboard",
  path: "/sentinel/dashboard",
  icon: LayoutDashboard,
};

/**
 * Main Sentinel navigation groups.
 */
export const sentinelNavigationGroups: NavigationGroup[] = [
  {
    name: "Store",
    items: [
      {
        name: "Products",
        path: "/sentinel/products",
        icon: Package,
      },
      {
        name: "Categories",
        path: "/sentinel/categories",
        icon: Tags,
      },
    ],
  },

  {
    name: "Sales",
    items: [
      {
        name: "Orders",
        path: "/sentinel/orders",
        icon: ClipboardList,
      },
      {
        name: "Store Orders",
        path: "/sentinel/store-orders",
        icon: ShoppingBag,
      },
      {
        name: "Quotations",
        path: "/sentinel/quotations",
        icon: ClipboardList,
      },
      {
        name: "Invoices",
        path: "/sentinel/invoices",
        icon: Receipt,
      },
    ],
  },

  {
    name: "Reports",
    items: [
      {
        name: "Sales & Revenue",
        path: "/sentinel/sales",
        icon: TrendingUp,
      },
    ],
  },

  {
    name: "Administration",
    items: [
      {
        name: "Users",
        path: "/sentinel/users",
        icon: Users,
      },
      {
        name: "Settings",
        path: "/sentinel/settings",
        icon: Settings,
      },
    ],
  },
];

/**
 * Utility items kept separately for header/sidebar shortcuts.
 */
export const sentinelUtilityItems: NavigationItem[] = [
  {
    name: "Contact Messages",
    path: "/sentinel/contact-messages",
    icon: MessagesSquare,
    badgeKey: "contactMessages",
  },
  { name: "Order Requests", path: "/sentinel/order-requests", icon: Bell, badgeKey: "orderRequests" },
];
