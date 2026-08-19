import type { LucideIcon } from "lucide-react";

import {
  LayoutDashboard,
  Package,
  Tags,
  ClipboardList,
  Receipt,
  ShoppingBag,
  MessagesSquare,
  Boxes,
  BarChart3,
  Users,
  UserCog,
  Settings,
} from "lucide-react";

export interface NavigationItem {
  name: string;
  path: string;
  icon: LucideIcon;
  badgeKey?: "contactMessages" | "storeOrders";
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
 *
 * Grouped as: Catalog / Operations / Communication / Customers / Insights /
 * System. "Order Requests" is intentionally NOT a nav item or badgeKey here:
 * it has no model, no API route, and no feature anywhere in the codebase —
 * it needs a product definition before it can be built, not just UI work.
 * Every other route below corresponds to a real page.
 */
export const sentinelNavigationGroups: NavigationGroup[] = [
  {
    name: "Catalog",
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
    name: "Operations",
    items: [
      {
        name: "Inventory",
        path: "/sentinel/inventory",
        icon: Boxes,
      },
      {
        name: "Orders",
        path: "/sentinel/orders",
        icon: ClipboardList,
      },
      {
        name: "Store Orders",
        path: "/sentinel/store-orders",
        icon: ShoppingBag,
        badgeKey: "storeOrders",
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
    name: "Communication",
    items: [
      {
        name: "Contact Messages",
        path: "/sentinel/contact-messages",
        icon: MessagesSquare,
        badgeKey: "contactMessages",
      },
    ],
  },

  {
    name: "Customers",
    items: [
      {
        name: "Customers",
        path: "/sentinel/customers",
        icon: Users,
      },
    ],
  },

  {
    name: "Insights",
    items: [
      {
        name: "Reports",
        path: "/sentinel/reports",
        icon: BarChart3,
      },
    ],
  },

  {
    name: "System",
    items: [
      {
        name: "Users",
        path: "/sentinel/users",
        icon: UserCog,
      },
      {
        name: "Settings",
        path: "/sentinel/settings",
        icon: Settings,
      },
    ],
  },
];
