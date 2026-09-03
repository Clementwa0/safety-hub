"use client";

import { useState } from "react";
import {
  BarChart3,
  Boxes,
  ChartNoAxesCombined,
  CheckIcon,
  ChevronDown,
  Package,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import SalesOverviewReport from "./sales/SalesReport";
import ProductPerformanceReport from "./product/ProductReport";
import InventoryReport from "./inventory/InventoryReport";
import CustomerInsightsReport from "./customer/CustomerReport";

const TABS = [
  {
    value: "sales",
    label: "Sales Overview",
    icon: ChartNoAxesCombined,
  },
  {
    value: "inventory",
    label: "Inventory Report",
    icon: Boxes,
  },
  {
    value: "product",
    label: "Product Performance",
    icon: Package,
  },
  {
    value: "customer",
    label: "Customer Insights",
    icon: Users,
  },
] as const;

type TabValue = (typeof TABS)[number]["value"];

export default function ReportsPage() {
  const [tab, setTab] = useState<TabValue>("sales");

  const activeTab = TABS.find((item) => item.value === tab)!;
  const ActiveIcon = activeTab.icon;

  return (
    <div className="space-y-3">
      <PageHeader
        title="Reports"
        description="Sales pipeline and accounting figures, catalog health, inventory position, and customer overview - all sourced from real data."
        actions={
          <span className="rounded-lg bg-primary/10 p-1.5 text-primary">
            <BarChart3 className="h-4 w-4" />
          </span>
        }
        className="[&>h1]:text-lg [&>p]:text-sm"
      />

      {/* Desktop tabs */}
      <div className="hidden sm:block">
        <Tabs value={tab} onValueChange={(value) => setTab(value as TabValue)}>
          <TabsList className="h-9 w-full gap-0.5 rounded-lg bg-muted/60 p-0.5">
            {TABS.map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex-1 gap-1.5 rounded-md px-2 py-1 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Icon className="size-3.5 shrink-0" />
                <span className="hidden sm:inline">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-3">
            <ReportContent tab={tab} />
          </div>
        </Tabs>
      </div>

      {/* Mobile dropdown */}
      <div className="sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-11 w-full items-center justify-between rounded-lg border-border/50 bg-background px-4 text-base font-medium shadow-sm">
            <span className="flex items-center gap-3">
              <ActiveIcon className="size-5 text-primary" />
              <span>{activeTab.label}</span>
            </span>
            <ChevronDown className="size-5 shrink-0 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-lg p-1.5 shadow-lg"
          >
            {TABS.map(({ value, label, icon: Icon }) => (
              <DropdownMenuItem
                key={value}
                onClick={() => setTab(value)}
                className="flex min-h-[44px] items-center gap-3 rounded-md px-3 py-2.5 text-base hover:bg-accent"
              >
                <Icon className="size-5 text-muted-foreground" />
                <span className="flex-1">{label}</span>
                {tab === value && <CheckIcon className="size-4 text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="mt-3">
          <ReportContent tab={tab} />
        </div>
      </div>
    </div>
  );
}

function ReportContent({ tab }: { tab: TabValue }) {
  switch (tab) {
    case "sales":
      return <SalesOverviewReport />;
    case "product":
      return <ProductPerformanceReport />;
    case "inventory":
      return <InventoryReport />;
    case "customer":
      return <CustomerInsightsReport />;
    default:
      return null;
  }
}
