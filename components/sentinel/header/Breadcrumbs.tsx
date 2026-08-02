"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

interface Breadcrumb {
  label: string;
  href: string;
}

const routeTitles: Record<string, string> = {
  sentinel: "Sentinel",
  admin: "Sentinel",

  dashboard: "Dashboard",
  products: "Products",
  categories: "Categories",
  inventory: "Inventory",
  "stock-movements": "Stock Movements",
  orders: "Orders",
  quotations: "Quotations",
  customers: "Customers",
  suppliers: "Suppliers",
  invoices: "Invoices",
  reports: "Reports",
  analytics: "Analytics",
  notifications: "Notifications",
  "audit-logs": "Audit Logs",
  settings: "Settings",
};

function formatSegment(segment: string) {
  return (
    routeTitles[segment] ??
    segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
}

export default function Breadcrumbs() {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);

  const breadcrumbs: Breadcrumb[] = segments.map((segment, index) => ({
    label: formatSegment(segment),
    href: "/" + segments.slice(0, index + 1).join("/"),
  }));

  return (
    <nav
      aria-label="Breadcrumb"
      className="hidden items-center gap-2 text-sm md:flex"
    >
      <Link
        href="/sentinel/dashboard"
        className="text-muted-foreground transition-colors hover:text-foreground"
      >
        <Home className="h-4 w-4" />
      </Link>

      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />

          {index === breadcrumbs.length - 1 ? (
            <span className="font-medium text-foreground">
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}