import type { LucideIcon } from "lucide-react";

import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Receipt,
  ShoppingBag,
  Boxes,
  BarChart3,
  Users,
  Settings,
  Star,
} from "lucide-react";

export interface NavigationChild {
  name: string;
  path: string;
}

export interface NavigationItem {
  name: string;
  path: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  children?: NavigationChild[];
}


export const sentinelNavigationItems: NavigationItem[] = [
  {
    name: "Dashboard",
    path: "/sentinel/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Products",
    path: "/sentinel/products",
    icon: Package,
    children: [
      { name: "All Products", path: "/sentinel/products" },
      { name: "Categories", path: "/sentinel/categories" },
    ],
  },
  {
    name: "Inventory",
    path: "/sentinel/inventory",
    icon: Boxes,
  },
  {
    name: "Orders",
    path: "/sentinel/orders",
    icon: ClipboardList,
    children: [
      { name: "Store Orders", path: "/sentinel/store-orders" },
      { name: "Sales Orders", path: "/sentinel/orders" },
      { name: "Invoices", path: "/sentinel/invoices" },
    ],
  },
  {
    name: "Customers",
    path: "/sentinel/customers",
    icon: Users,
  },
  {
    name: "Quotations",
    path: "/sentinel/quotations",
    icon: Receipt,
  },
  {
    name: "Reports",
    path: "/sentinel/reports",
    icon: BarChart3,
    adminOnly: true,
  },
  {
    name: "Settings",
    path: "/sentinel/settings",
    icon: Settings,
    adminOnly: true,
  },
];

export interface QuickAction {
  name: string;
  path: string;
  icon: LucideIcon;
  /** Tailwind background class for the circular icon badge. */
  tint: string;
}

export const sentinelQuickActions: QuickAction[] = [
  { name: "Add Product", path: "/sentinel/products/new", icon: Package, tint: "bg-blue-600" },
  { name: "Receive Stock", path: "/sentinel/inventory", icon: Boxes, tint: "bg-emerald-600" },
  { name: "New Quotation", path: "/sentinel/quotations/new", icon: Receipt, tint: "bg-violet-600" },
  { name: "Create Order", path: "/sentinel/orders/new", icon: ShoppingBag, tint: "bg-orange-600" },
];
