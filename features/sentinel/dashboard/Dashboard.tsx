"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  DollarSign,
  Package,
  RefreshCw,
  ShoppingBag,
  Users,
  Info,
} from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { adminStoreOrderService } from "@/services/sentinel/admin-store-order.service";
import { productService } from "@/services/shared/product.service";
import { customerService } from "@/services/sentinel/customer.service";
import { contactMessageService } from "@/services/sentinel/contact-message.service";
import { quotationService } from "@/services/sentinel/quotation.service";
import { orderService } from "@/services/sentinel/order.service";
import { invoiceService } from "@/services/sentinel/invoice.service";
import type { Product } from "@/types/product";
import type { StoreOrder } from "@/types/storefront/store-order";
import type { ContactMessageStats } from "@/types/sentinel/contact-message";
import type { Order } from "@/types/sentinel/order";
import type { Invoice } from "@/types/sentinel/invoice";

import {
  buildIncomeEvents,
  computeCatalogSnapshot,
  computeKpis,
  computeKpiSeries,
  computeRecentOrders,
  computeRevenueOrdersTrend,
  computeStatusBreakdown,
  computeStockAlerts,
  formatDashboardCurrency,
  type TrendRange,
} from "./computeDashboardData";
import DashboardStatCard from "./components/DashboardStatCard";
import SalesOverviewChart from "./components/SalesOverviewChart";
import AttentionRequired, {
  type AttentionItem,
} from "./components/AttentionRequired";
import OrderStatusDonut from "./components/OrderStatusDonut";
import RecentOrdersCard from "./components/RecentOrdersCard";
import LowStockItemsCard from "./components/LowStockItemsCard";

function greeting(now: Date): string {
  const hour = now.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] ?? "Admin";
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [b2bOrders, setB2bOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [contactStats, setContactStats] = useState<ContactMessageStats | null>(
    null,
  );
  const [pendingQuotations, setPendingQuotations] = useState(0);
  const statusBreakdown = useMemo(
    () => computeStatusBreakdown(orders),
    [orders],
  );

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trendRange, setTrendRange] = useState<TrendRange>("week");

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    const controller = new AbortController();

    try {
      const [
        orderPage,
        b2bOrderList,
        invoiceList,
        productList,
        customerTotal,
        contactMessageStats,
        sentQuotations,
      ] = await Promise.all([
        adminStoreOrderService.list({ limit: 500, sort: "-createdAt" }),
        orderService.list({ limit: 500, sort: "-createdAt" }),
        invoiceService.list({ limit: 500, sort: "-issueDate" }),
        productService.list(),
        customerService.count(),
        contactMessageService.stats({ signal: controller.signal }),
        quotationService.list({ status: "sent" }),
      ]);

      setOrders(orderPage.items);
      setB2bOrders(b2bOrderList);
      setInvoices(invoiceList);
      setProducts(productList);
      setCustomerCount(customerTotal);
      setContactStats(contactMessageStats);
      setPendingQuotations(sentQuotations.length);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not load dashboard data",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const now = useMemo(() => new Date(), []);

  const incomeEvents = useMemo(
    () => buildIncomeEvents(orders, b2bOrders, invoices),
    [orders, b2bOrders, invoices],
  );
  const kpis = useMemo(
    () => computeKpis(orders, now, incomeEvents),
    [orders, now, incomeEvents],
  );
  const kpiSeries = useMemo(
    () => computeKpiSeries(orders, now, incomeEvents),
    [orders, now, incomeEvents],
  );
  const catalog = useMemo(() => computeCatalogSnapshot(products), [products]);
  const revenueOrdersTrend = useMemo(
    () => computeRevenueOrdersTrend(orders, now, trendRange),
    [orders, now, trendRange],
  );
  const recentOrders = useMemo(() => computeRecentOrders(orders, 5), [orders]);
  const stockAlerts = useMemo(() => computeStockAlerts(products, 5), [products]);
  const stockAlertsWithImage = useMemo(
    () =>
      stockAlerts.map((alert) => {
        const product = products.find((p) => p.id === alert.id);
        return {
          ...alert,
          image: typeof product?.image === "string" ? product.image : null,
        };
      }),
    [stockAlerts, products],
  );

  const attentionItems: AttentionItem[] = useMemo(() => {
    const items: AttentionItem[] = [];

    if (catalog.outOfStockCount > 0) {
      items.push({
        id: "out-of-stock",
        label: `${catalog.outOfStockCount} product${catalog.outOfStockCount === 1 ? "" : "s"} are out of stock`,
        description: "Replenishment may be required",
        href: "/sentinel/inventory",
        severity: "warning",
      });
    }
    if (catalog.lowStockCount > 0) {
      items.push({
        id: "low-stock",
        label: `${catalog.lowStockCount} product${catalog.lowStockCount === 1 ? "" : "s"} have low stock`,
        description: "Review inventory levels",
        href: "/sentinel/inventory",
        severity: "warning",
      });
    }
    if (pendingQuotations > 0) {
      items.push({
        id: "quotations",
        label: `${pendingQuotations} quotation${pendingQuotations === 1 ? "" : "s"} awaiting response`,
        description: "Customers are waiting for your reply",
        href: "/sentinel/quotations",
        severity: "info",
      });
    }
    if (catalog.draftCount > 0) {
      items.push({
        id: "drafts",
        label: `${catalog.draftCount} draft product${catalog.draftCount === 1 ? "" : "s"}`,
        description: "Finish setup and publish to the catalog",
        href: "/sentinel/products",
        severity: "info",
      });
    }
    if ((contactStats?.new ?? 0) > 0) {
      items.push({
        id: "messages",
        label: `${contactStats?.new ?? 0} unread contact message${(contactStats?.new ?? 0) === 1 ? "" : "s"}`,
        description: "Customers are waiting to hear back",
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
    <div className="space-y-2 sm:space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Dashboard</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {greeting(now)}, {firstName}! Here&apos;s what&apos;s happening with your business today.
          </p>
        </div>
        <Button onClick={() => void load(true)} disabled={refreshing} className="h-8 gap-1.5 text-xs">
          <RefreshCw className={refreshing ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
          Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-2 xl:grid-cols-4 xl:gap-2.5">
        <DashboardStatCard
          title="Total Revenue"
          value={formatDashboardCurrency(kpis.totalSales.value)}
          icon={DollarSign}
          iconTint="bg-blue-100 text-blue-600"
          accentColor="#2563EB"
          loading={loading}
          sparkline={kpiSeries.revenue}
          trend={
            kpis.totalSales.change === null
              ? undefined
              : { isUp: kpis.totalSales.isUp, label: `${Math.abs(kpis.totalSales.change).toFixed(1)}%` }
          }
          comparisonLabel="vs last week"
        />
        <DashboardStatCard
          title="Total Orders"
          value={String(kpis.orders.value)}
          icon={ShoppingBag}
          iconTint="bg-emerald-100 text-emerald-600"
          accentColor="#16A34A"
          loading={loading}
          sparkline={kpiSeries.orders}
          trend={
            kpis.orders.change === null
              ? undefined
              : { isUp: kpis.orders.isUp, label: `${Math.abs(kpis.orders.change).toFixed(1)}%` }
          }
          comparisonLabel="vs last week"
        />
        <DashboardStatCard
          title="Available Stock"
          value={catalog.totalUnits.toLocaleString()}
          icon={Package}
          iconTint="bg-violet-100 text-violet-600"
          accentColor="#7C3AED"
          loading={loading}
          sparkline={kpiSeries.unitsSold}
          trend={
            catalog.outOfStockCount > 0 || catalog.lowStockCount > 0
              ? {
                  isUp: false,
                  label: `${catalog.outOfStockCount + catalog.lowStockCount} need attention`,
                }
              : { isUp: true, label: "Fully stocked" }
          }
        />
        <DashboardStatCard
          title="Total Customers"
          value={customerCount.toLocaleString()}
          icon={Users}
          iconTint="bg-orange-100 text-orange-600"
          accentColor="#EA580C"
          loading={loading}
          sparkline={kpiSeries.customers}
          trend={
            kpis.customers.change === null
              ? undefined
              : { isUp: kpis.customers.isUp, label: `${Math.abs(kpis.customers.change).toFixed(1)}%` }
          }
          comparisonLabel="vs last week"
        />
      </div>

      {/* Revenue & Orders chart + Order Status donut */}
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-3 lg:gap-2.5">
        <div className="lg:col-span-2">
          <SalesOverviewChart
            data={revenueOrdersTrend}
            range={trendRange}
            onRangeChange={setTrendRange}
            loading={loading}
          />
        </div>
        <div className="lg:col-span-1">
          <OrderStatusDonut data={statusBreakdown} total={orders.length} loading={loading} />
        </div>
      </div>

      {/* Needs Attention / Recent Orders / Low Stock */}
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-3 lg:gap-2.5">
        <AttentionRequired items={attentionItems} loading={loading} />
        <RecentOrdersCard orders={recentOrders} loading={loading} />
        <LowStockItemsCard items={stockAlertsWithImage} loading={loading} />
      </div>

      <div className="flex items-start gap-1.5 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
        <Info className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
        <p>
          All metrics are calculated live from your current orders, inventory, and customer data.
          Week-over-week comparisons use Monday–Sunday windows.
        </p>
      </div>
    </div>
  );
}