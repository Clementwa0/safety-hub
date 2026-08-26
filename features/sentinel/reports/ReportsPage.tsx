"use client";

import { useState } from "react";
import {
  BarChart3,
  Boxes,
  ChartNoAxesCombined,
  ChevronDown,
  Package,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import SalesReport from "./sales/SalesReport";
import ProductReport from "./product/ProductReport";
import InventoryReport from "./inventory/InventoryReport";
import CustomerReport from "./customer/CustomerReport";

const TABS = [
  {
    value: "sales",
    label: "Sales",
    icon: ChartNoAxesCombined,
  },
  {
    value: "product",
    label: "Products",
    icon: Package,
  },
  {
    value: "inventory",
    label: "Inventory",
    icon: Boxes,
  },
  {
    value: "customer",
    label: "Customers",
    icon: Users,
  },
] as const;

type TabValue = (typeof TABS)[number]["value"];

export default function ReportsPage() {
  const [tab, setTab] = useState<TabValue>("sales");

  const activeTab = TABS.find((item) => item.value === tab)!;
  const ActiveIcon = activeTab.icon;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reports"
        description="Sales pipeline and accounting figures, catalog health, inventory position, and customer overview — all sourced from real data."
        actions={
          <span className="rounded-xl bg-primary/10 p-2 text-primary">
            <BarChart3 className="h-5 w-5" />
          </span>
        }
      />

      {/* Desktop tabs */}
      <div className="hidden sm:block">
        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as TabValue)}
        >
          <TabsList className="w-full">
            {TABS.map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex-1 gap-2"
              >
                <Icon className="size-4 shrink-0" />
                <span>{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <ReportContent tab={tab} />
        </Tabs>
      </div>

      {/* Mobile dropdown */}
      <div className="sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant="outline"
              className="
                h-11 w-full justify-between
                rounded-xl
                border-border/60
                bg-background
                px-3.5
                font-medium
                shadow-sm
              "
            >
              <span className="flex items-center gap-2.5">
                <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ActiveIcon className="size-4" />
                </span>

                <span>{activeTab.label} Report</span>
              </span>

              <ChevronDown className="size-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            className="w-[var(--anchor-width)] min-w-0"
          >
            {TABS.map(({ value, label, icon: Icon }) => (
              <DropdownMenuItem
                key={value}
                onClick={() => setTab(value)}
                className="
                  h-10
                  gap-2.5
                  rounded-lg
                  px-2.5
                "
              >
                <span
                  className={`
                    flex size-7 items-center justify-center rounded-md
                    ${
                      tab === value
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }
                  `}
                >
                  <Icon className="size-4" />
                </span>

                <span className="flex-1">{label}</span>

                {tab === value && (
                  <span className="text-xs font-medium text-primary">
                    Active
                  </span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="mt-4">
          <ReportContent tab={tab} />
        </div>
      </div>
    </div>
  );
}

function ReportContent({ tab }: { tab: TabValue }) {
  switch (tab) {
    case "sales":
      return <SalesReport />;

    case "product":
      return <ProductReport />;

    case "inventory":
      return <InventoryReport />;

    case "customer":
      return <CustomerReport />;

    default:
      return null;
  }
}