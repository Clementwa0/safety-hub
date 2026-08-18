"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { adminStoreOrderService } from "@/services/sentinel/admin-store-order.service";
import { productService } from "@/services/shared/product.service";
import type { Product } from "@/types/product";
import type { StoreOrder } from "@/types/storefront/store-order";

import {
  computeCategorySales,
  computeKpis,
  computeRecentOrders,
  computeSalesTrend,
  computeStatusBreakdown,
  computeStockAlerts,
  computeTopProducts,
  type TrendRange,
} from "./computeDashboardData";
import { formatCurrency } from "@/lib/format";
import RecentOrders from "./components/RecentOrders";
import DashboardStatCard from "./components/DashboardStatCard";
import InventoryAlerts from "./components/InventoryAlerts";
import OrderStatusDonut from "./components/OrderStatusDonut";
import SalesByCategoryChart from "./components/SalesByCategoryChart";
import SalesOverviewChart from "./components/SalesOverviewChart";
import TopSellingProducts from "./components/TopSellingProducts";
import WelcomeBanner from "./components/WelcomeBanner";

export default function Dashboard() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] ?? "Admin";

  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trendRange, setTrendRange] = useState<TrendRange>("week");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [orderPage, productList] = await Promise.all([
        adminStoreOrderService.list({ limit: 500, sort: "-createdAt" }),
        productService.list(),
      ]);

      setOrders(orderPage.items);
      setProducts(productList);
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

  const totalCustomers = useMemo(
    () => new Set(orders.map((o) => o.customer?.email?.toLowerCase()).filter(Boolean)).size,
    [orders],
  );

  const inventoryValue = useMemo(
    () => products.reduce((sum, p) => sum + p.price * p.stock, 0),
    [products],
  );

  const activeProductCount = useMemo(
    () => products.filter((p) => (p.status ?? "active") === "active").length,
    [products],
  );

  const lowStockCount = useMemo(
    () => products.filter((p) => p.stock > 0 && p.stock <= 20).length,
    [products],
  );

  const outOfStockCount = useMemo(
    () => products.filter((p) => p.stock === 0).length,
    [products],
  );

  const salesTrend = useMemo(() => computeSalesTrend(orders, now, trendRange), [orders, now, trendRange]);
  const topProducts = useMemo(() => computeTopProducts(orders, 5), [orders]);
  const recentOrders = useMemo(() => computeRecentOrders(orders, 5), [orders]);
  const stockAlerts = useMemo(() => computeStockAlerts(products, 4), [products]);
  const statusBreakdown = useMemo(() => computeStatusBreakdown(orders), [orders]);
  const categorySales = useMemo(() => computeCategorySales(orders, products, 6), [orders, products]);

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
      <WelcomeBanner name={firstName} />

      {/* KPI Cards - Responsive Grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-3 xl:grid-cols-5 xl:gap-4">
        <DashboardStatCard
          title="Total Sales"
          value={formatCurrency(kpis.totalSales.value)}
          trend={kpis.totalSales}
          loading={loading}
        />
        <DashboardStatCard
          title="Orders"
          value={String(kpis.orders.value)}
          trend={kpis.orders}
          loading={loading}
        />
        <DashboardStatCard
          title="Customers"
          value={String(totalCustomers)}
          trend={kpis.customers}
          loading={loading}
        />
        <DashboardStatCard
          title="Products"
          value={String(products.length)}
          loading={loading}
          lines={[
            { label: `${activeProductCount} Active`, tone: "success" },
            ...(lowStockCount > 0
              ? [{ label: `${lowStockCount} Low`, tone: "warning" as const }]
              : []),
            ...(outOfStockCount > 0
              ? [{ label: `${outOfStockCount} Out`, tone: "muted" as const }]
              : []),
          ]}
        />
        <DashboardStatCard
          title="Inventory Value"
          value={formatCurrency(inventoryValue)}
          loading={loading}
          lines={[{ label: "All warehouses", tone: "muted" }]}
        />
      </div>

      {/* Charts & Tables Row 1 - Responsive */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-10 md:gap-4">
        <div className="md:col-span-10 lg:col-span-4">
          <SalesOverviewChart
            data={salesTrend}
            range={trendRange}
            onRangeChange={setTrendRange}
            loading={loading}
          />
        </div>
        <div className="md:col-span-5 lg:col-span-3">
          <TopSellingProducts data={topProducts} loading={loading} />
        </div>
        <div className="md:col-span-5 lg:col-span-3">
          <RecentOrders data={recentOrders} loading={loading} />
        </div>
      </div>

      {/* Charts & Tables Row 2 - Responsive */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
        <div className="md:col-span-1">
          <InventoryAlerts data={stockAlerts} loading={loading} />
        </div>
        <div className="md:col-span-1">
          <OrderStatusDonut data={statusBreakdown} total={orders.length} loading={loading} />
        </div>
        <div className="md:col-span-1">
          <SalesByCategoryChart data={categorySales} loading={loading} />
        </div>
      </div>
    </div>
  );
}