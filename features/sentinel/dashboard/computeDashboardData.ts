import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";

import type { Product } from "@/types/product";
import type { StoreOrder, StoreOrderStatus } from "@/types/storefront/store-order";

export type TrendRange = "week" | "month";

export interface ChangeStat {
  value: number;
  change: number | null;
  isUp: boolean;
  comparisonLabel: string;
}

export interface TrendPoint {
  label: string;
  current: number;
  previous: number;
}

export interface TopProductRow {
  id: string;
  key: string;
  name: string;
  category?: string;
  quantity: number;
  revenue: number;
}

export interface RecentOrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: StoreOrderStatus;
  createdAt: string;
}

export interface StockAlertRow {
  id: string;
  name: string;
  sku?: string;
  category: string;
  stock: number;
  severity: "out" | "low" | "running-low";
}

export interface StatusSlice {
  status: StoreOrderStatus | "pending";
  label: string;
  count: number;
  percent: number;
}

export interface CategorySalesRow {
  category: string;
  revenue: number;
}

const DISPLAY_STATUS_COLORS: Record<string, string> = {
  pending: "#94A3B8",
  processing: "#2563EB",
  shipped: "#F59E0B",
  delivered: "#16A34A",
  cancelled: "#DC2626",
};

export function statusColor(status: string): string {
  return DISPLAY_STATUS_COLORS[status] ?? "#94A3B8";
}

function computeChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? null : 100;
  return ((current - previous) / previous) * 100;
}

function sumTotals(orders: StoreOrder[]): number {
  return orders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + o.total, 0);
}

function uniqueCustomers(orders: StoreOrder[]): number {
  return new Set(orders.map((o) => o.customer?.email?.toLowerCase()).filter(Boolean)).size;
}

export function buildWeekWindows(now: Date) {
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const prevWeekStart = subWeeks(weekStart, 1);
  const prevWeekEnd = subWeeks(weekEnd, 1);
  return { weekStart, weekEnd, prevWeekStart, prevWeekEnd };
}

function inRange(date: Date, start: Date, end: Date) {
  return isWithinInterval(date, { start, end });
}

export interface DashboardKpis {
  totalSales: ChangeStat;
  orders: ChangeStat;
  customers: ChangeStat;
}

export function computeKpis(orders: StoreOrder[], now: Date): DashboardKpis {
  const { weekStart, weekEnd, prevWeekStart, prevWeekEnd } = buildWeekWindows(now);

  const thisWeek = orders.filter((o) => inRange(new Date(o.createdAt), weekStart, weekEnd));
  const lastWeek = orders.filter((o) => inRange(new Date(o.createdAt), prevWeekStart, prevWeekEnd));

  const salesThis = sumTotals(thisWeek);
  const salesLast = sumTotals(lastWeek);

  const ordersThis = thisWeek.length;
  const ordersLast = lastWeek.length;

  const customersThis = uniqueCustomers(thisWeek);
  const customersLast = uniqueCustomers(lastWeek);

  const comparisonLabel = `vs ${format(prevWeekStart, "MMM d")} – ${format(prevWeekEnd, "MMM d, yyyy")}`;

  return {
    totalSales: {
      value: salesThis,
      change: computeChange(salesThis, salesLast),
      isUp: salesThis >= salesLast,
      comparisonLabel,
    },
    orders: {
      value: ordersThis,
      change: computeChange(ordersThis, ordersLast),
      isUp: ordersThis >= ordersLast,
      comparisonLabel,
    },
    customers: {
      value: customersThis,
      change: computeChange(customersThis, customersLast),
      isUp: customersThis >= customersLast,
      comparisonLabel,
    },
  };
}

export function computeSalesTrend(orders: StoreOrder[], now: Date, range: TrendRange): TrendPoint[] {
  if (range === "week") {
    const { weekStart, weekEnd, prevWeekStart } = buildWeekWindows(now);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return days.map((day, index) => {
      const prevDay = new Date(prevWeekStart);
      prevDay.setDate(prevDay.getDate() + index);

      const current = orders
        .filter((o) => o.status !== "cancelled")
        .filter((o) => {
          const d = new Date(o.createdAt);
          return d.toDateString() === day.toDateString();
        })
        .reduce((sum, o) => sum + o.total, 0);

      const previous = orders
        .filter((o) => o.status !== "cancelled")
        .filter((o) => {
          const d = new Date(o.createdAt);
          return d.toDateString() === prevDay.toDateString();
        })
        .reduce((sum, o) => sum + o.total, 0);

      return { label: format(day, "EEE"), current, previous };
    });
  }

  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const prevMonthStart = startOfMonth(subMonths(now, 1));
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return days.map((day, index) => {
    const prevDay = new Date(prevMonthStart);
    prevDay.setDate(prevDay.getDate() + index);

    const current = orders
      .filter((o) => o.status !== "cancelled")
      .filter((o) => new Date(o.createdAt).toDateString() === day.toDateString())
      .reduce((sum, o) => sum + o.total, 0);

    const previous = orders
      .filter((o) => o.status !== "cancelled")
      .filter((o) => new Date(o.createdAt).toDateString() === prevDay.toDateString())
      .reduce((sum, o) => sum + o.total, 0);

    return { label: format(day, "d"), current, previous };
  });
}

export function computeTopProducts(orders: StoreOrder[], limit = 5): TopProductRow[] {
  const byName = new Map<string, TopProductRow>();

  for (const order of orders) {
    if (order.status === "cancelled") continue;
    for (const item of order.items) {
      const key = item.product ?? item.name;
      const existing = byName.get(key);
      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += item.subtotal;
      } else {
        byName.set(key, {
          id: item.product ?? key,
          key,
          name: item.name,
          quantity: item.quantity,
          revenue: item.subtotal,
        });
      }
    }
  }

  return Array.from(byName.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export function computeRecentOrders(orders: StoreOrder[], limit = 5): RecentOrderRow[] {
  return orders.slice(0, limit).map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customer?.name || "Guest",
    total: o.total,
    status: o.status,
    createdAt: o.createdAt,
  }));
}

export function computeStockAlerts(products: Product[], limit = 4): StockAlertRow[] {
  return products
    .filter((p) => p.stock <= 20 && (p.status ?? "active") !== "archived")
    .sort((a, b) => a.stock - b.stock)
    .slice(0, limit)
    .map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      stock: p.stock,
      severity: p.stock === 0 ? "out" : p.stock <= 5 ? "low" : "running-low",
    }));
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function computeStatusBreakdown(orders: StoreOrder[]): StatusSlice[] {
  const buckets = new Map<string, number>();

  for (const order of orders) {
    const label = STATUS_LABELS[order.status] ?? order.status;
    const bucketKey = label.toLowerCase();
    buckets.set(bucketKey, (buckets.get(bucketKey) ?? 0) + 1);
  }

  const total = orders.length || 1;
  const statusOrder: (StoreOrderStatus | "pending")[] = ["delivered", "shipped", "processing", "pending", "cancelled"];

  return statusOrder
    .map((status) => {
      const count = buckets.get(status) ?? 0;
      return {
        status,
        label: STATUS_LABELS[status] ?? status,
        count,
        percent: Math.round((count / total) * 1000) / 10,
      };
    })
    .filter((slice) => slice.count > 0);
}

export function computeCategorySales(
  orders: StoreOrder[],
  products: Product[],
  limit = 6,
): CategorySalesRow[] {
  const productCategoryById = new Map(products.map((p) => [p.id, p.category]));
  const byCategory = new Map<string, number>();

  for (const order of orders) {
    if (order.status === "cancelled") continue;
    for (const item of order.items) {
      const category = (item.product && productCategoryById.get(item.product)) || "Other";
      byCategory.set(category, (byCategory.get(category) ?? 0) + item.subtotal);
    }
  }

  return Array.from(byCategory.entries())
    .map(([category, revenue]) => ({ category, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}
