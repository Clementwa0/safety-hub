"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import SalesReport from "./sales/SalesReport";
import ProductReport from "./product/ProductReport";
import InventoryReport from "./inventory/InventoryReport";
import CustomerReport from "./customer/CustomerReport";

const TABS = [
  { value: "sales", label: "Sales" },
  { value: "product", label: "Products" },
  { value: "inventory", label: "Inventory" },
  { value: "customer", label: "Customers" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

export default function ReportsPage() {
  const [tab, setTab] = useState<TabValue>("sales");

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

      <Tabs
        value={tab}
        onValueChange={(v) => typeof v === "string" && setTab(v as TabValue)}
      >
        <TabsList className="flex-wrap">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="sales" className="mt-5">
          <SalesReport />
        </TabsContent>

        <TabsContent value="product" className="mt-5">
          <ProductReport />
        </TabsContent>

        <TabsContent value="inventory" className="mt-5">
          <InventoryReport />
        </TabsContent>

        <TabsContent value="customer" className="mt-5">
          <CustomerReport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
