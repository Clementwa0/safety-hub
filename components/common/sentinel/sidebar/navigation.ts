import type { LucideIcon } from "lucide-react";

import {
  LayoutDashboard,
  Package,
  Tags,
  ClipboardList,
  Receipt,
  Users,
  Settings,
  UserCircle2,
  Bell,
  FileBarChart,
  ShoppingBag,
  MessagesSquare,
  TrendingUp,
  MessageCircle,
} from "lucide-react";

export interface NavigationItem {
  name: string;
  path: string;
  icon: LucideIcon;
  badgeKey?: "contactMessages" | "orderRequests";
}

export interface NavigationGroup {
  name: string;
  icon: LucideIcon;
  items: NavigationItem[];
}


export const sentinelNavigation: NavigationItem[] = [
  {
    name: "Dashboard",
    path: "/sentinel/dashboard",
    icon: LayoutDashboard,
  },
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
  {
    name: "Contact Messages",
    path: "/sentinel/contact-messages",
    icon: MessagesSquare,
    badgeKey: "contactMessages",
  },
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
];


export const sentinelSalesNavigation: NavigationGroup = {
  name: "Sales",
  icon: TrendingUp,
  items: [
    {
      name: "Order Requests",
      path: "/sentinel/order-requests",
      icon: MessageCircle,
      badgeKey: "orderRequests",
    },
    {
      name: "Sales & Revenue",
      path: "/sentinel/sales",
      icon: TrendingUp,
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
};