"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { adminStoreOrderService } from "@/services/sentinel/admin-store-order.service";
import { productService } from "@/services/shared/product.service";
import { customerService } from "@/services/sentinel/customer.service";
import { contactMessageService } from "@/services/sentinel/contact-message.service";
import { quotationService } from "@/services/sentinel/quotation.service";
import type { Product } from "@/types/product";
import type { StoreOrder } from "@/types/storefront/store-order";
import type { ContactMessageStats } from "@/types/sentinel/contact-message";

import {
  computeCatalogSnapshot,
  computeKpis,
  computeSalesTrend,
  computeStatusBreakdown,
  type TrendRange,
} from "./computeDashboardData";
import DashboardStatCard from "./components/DashboardStatCard";
import SalesOverviewChart from "./components/SalesOverviewChart";
import SystemHealth, { type SystemHealthRow } from "./components/SystemHealth";
import AttentionRequired, { type AttentionItem } from "./components/AttentionRequired";
import OrderStatusDonut from "./components/OrderStatusDonut";

export default function Dashboard() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] ?? "Admin";

  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [contactStats, setContactStats] = useState<ContactMessageStats | null>(null);
  const [pendingQuotations, setPendingQuotations] = useState(0);
  const statusBreakdown = useMemo(() => computeStatusBreakdown(orders), [orders]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trendRange, setTrendRange] = useState<TrendRange>("week");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();

    try {
      const [orderPage, productList, customerTotal, contactMessageStats, sentQuotations] = await Promise.all([
        adminStoreOrderService.list({ limit: 500, sort: "-createdAt" }),
        productService.list(),
        customerService.count(),
        contactMessageService.stats({ signal: controller.signal }),
        quotationService.list({ status: "sent" }),
      ]);

      setOrders(orderPage.items);
      setProducts(productList);
      setCustomerCount(customerTotal);
      setContactStats(contactMessageStats);
      setPendingQuotations(sentQuotations.length);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const now = useMemo(() => new Date(), []);

  const kpis = useMemo(() => computeKpis(orders, now), [orders, now]);
  const catalog = useMemo(() => computeCatalogSnapshot(products), [products]);
  const salesTrend = useMemo(() => computeSalesTrend(orders, now, trendRange), [orders, now, trendRange]);

  const systemHealthRows: SystemHealthRow[] = useMemo(() => {
    const adminApiStatus = error ? "degraded" : loading ? "unknown" : "operational";
    return [
      {
        id: "admin-api",
        label: "Admin API & Database",
        status: adminApiStatus,
        statusLabel: error ? "Unavailable" : loading ? "Checking…" : "Operational",
      },
      { id: "storefront", label: "Storefront", status: "unknown", statusLabel: "Not monitored" },
      { id: "payments", label: "Payments", status: "unknown", statusLabel: "Not monitored" },
    ];
  }, [error, loading]);

  const attentionItems: AttentionItem[] = useMemo(() => {
    const items: AttentionItem[] = [];

    if (catalog.outOfStockCount > 0) {
      items.push({
        id: "out-of-stock",
        label: "Out-of-stock products",
        count: catalog.outOfStockCount,
        href: "/sentinel/inventory",
        severity: "warning",
      });
    }
    if (catalog.lowStockCount > 0) {
      items.push({
        id: "low-stock",
        label: "Low-stock products",
        count: catalog.lowStockCount,
        href: "/sentinel/inventory",
        severity: "warning",
      });
    }
    if (catalog.draftCount > 0) {
      items.push({
        id: "drafts",
        label: "Draft products",
        count: catalog.draftCount,
        href: "/sentinel/products",
        severity: "info",
      });
    }
    if (pendingQuotations > 0) {
      items.push({
        id: "quotations",
        label: "Quotations awaiting response",
        count: pendingQuotations,
        href: "/sentinel/quotations",
        severity: "info",
      });
    }
    if ((contactStats?.new ?? 0) > 0) {
      items.push({
        id: "messages",
        label: "Unread contact messages",
        count: contactStats?.new ?? 0,
        href: "/sentinel/contact-messages",
        severity: "info",
      });
    }

    return items;
  }, [catalog, pendingQuotations, contactStats]);

  if (error) {
    return (
      <EmptyState
        title="Something went wrong"
        description={error}
        action={
          <Button variant="outline" onClick={() => void load()}>
            Try again
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      <PageHeader title="Dashboard" description={`Overview of Safety Hub, ${firstName}.`} />

      {/* KPI Cards - Catalog / Inventory / Customers / Orders */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4 xl:gap-4">
        <DashboardStatCard
          title="Catalog"
          value={String(catalog.totalProducts)}
          loading={loading}
          lines={[
            { label: "Products", tone: "muted" },
            ...(catalog.draftCount > 0 ? [{ label: `${catalog.draftCount} Draft`, tone: "muted" as const }] : []),
          ]}
        />
        <DashboardStatCard
          title="Inventory"
          value={catalog.totalUnits.toLocaleString()}
          loading={loading}
          lines={[
            { label: "Units", tone: "muted" },
            ...(catalog.lowStockCount > 0
              ? [{ label: `${catalog.lowStockCount} Low stock`, tone: "warning" as const }]
              : []),
          ]}
        />
        <DashboardStatCard
          title="Customers"
          value={customerCount.toLocaleString()}
          loading={loading}
          lines={[{ label: "Accounts", tone: "muted" }]}
        />
        <DashboardStatCard
          title="Orders"
          value={String(kpis.orders.value)}
          loading={loading}
          lines={[{ label: "Recent transactions", tone: "muted" }]}
        />
      </div>

      {/* Business Activity + System panels */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-4 ">
        <div className="lg:col-span-2 ">
          <SalesOverviewChart
            data={salesTrend}
            range={trendRange}
            onRangeChange={setTrendRange}
            loading={loading}
            title="Business Activity"
          />
        </div>
        <div className="space-y-3 lg:col-span-1 lg:space-y-4">
          <OrderStatusDonut data={statusBreakdown} total={orders.length} loading={loading} />
          <AttentionRequired items={attentionItems} loading={loading} />
        </div>
      </div>
    </div>
  );
}
