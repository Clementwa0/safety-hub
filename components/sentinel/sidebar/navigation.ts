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
  /** Hidden from staff — only the admin account can see/use this. */
  adminOnly?: boolean;
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
        adminOnly: true,
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
        adminOnly: true,
      },
      {
        name: "Settings",
        path: "/sentinel/settings",
        icon: Settings,
        adminOnly: true,
      },
    ],
  },
];
