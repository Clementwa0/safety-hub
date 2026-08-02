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
} from "lucide-react";

export interface NavigationItem {
  name: string;
  path: string;
  icon: LucideIcon;
  /** Optional key used to look up a live badge count for this item (e.g. unread contact messages). */
  badgeKey?: "contactMessages";
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
    name: "Store Orders",
    path: "/sentinel/store-orders",
    icon: ShoppingBag,
  },
  {
    name: "Contact Messages",
    path: "/sentinel/contact-messages",
    icon: MessagesSquare,
    badgeKey: "contactMessages",
  },
  {
    name: "Orders",
    path: "/sentinel/orders",
    icon: ClipboardList,
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
  {
    name: "Users",
    path: "/sentinel/users",
    icon: Users,
  },
  {
    name: "Reports",
    path: "/sentinel/settings",
    icon: FileBarChart,
  },
  {
    name: "Notifications",
    path: "/sentinel/profile",
    icon: Bell,
  },
  {
    name: "Settings",
    path: "/sentinel/settings",
    icon: Settings,
  },
  {
    name: "Profile",
    path: "/sentinel/profile",
    icon: UserCircle2,
  },
];
