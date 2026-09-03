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
import type { Order } from "@/types/sentinel/order";
import type { Invoice } from "@/types/sentinel/invoice";
import { calculateInvoiceTotals } from "@/modules/invoicing/calculations";
import { getStockBucket } from "../inventory/stockStatus";

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

/** One dated money event feeding the Business Activity trend. */
export interface IncomeEvent {
  date: string | number | Date;
  amount: number;
}

/**
 * Business Activity used to read from storefront orders only, which
 * under-reported income for the B2B side of the business (orders placed
 * by admins/quotations, and invoices raised directly). This builds the
 * combined income timeline the Dashboard trend chart and KPIs read from:
 *
 * - Storefront orders, excluding cancelled (unchanged from before).
 * - B2B/manual orders (`Order`) that are confirmed-or-beyond and not yet
 *   linked to an invoice - once an order is converted to an invoice
 *   (`order.invoiceId` set), it stops being counted here so it isn't
 *   double-counted alongside the invoice below.
 * - Issued invoices (excludes drafts, which aren't a real financial
 *   document yet, and cancelled invoices), dated by `issueDate`.
 *
 * Money math for orders/invoices delegates to
 * modules/invoicing/calculations.ts, the shared source of truth also used
 * by the full Sales Report (see modules/analytics/sales-dashboard.ts), so this
 * stays consistent with the rest of the app instead of re-deriving totals.
 */
export function buildIncomeEvents(
  storeOrders: StoreOrder[],
  orders: Order[],
  invoices: Invoice[],
): IncomeEvent[] {
  const events: IncomeEvent[] = [];

  for (const so of storeOrders) {
    if (so.status === "cancelled") continue;
    events.push({ date: so.createdAt, amount: so.total });
  }

  for (const o of orders) {
    if (o.status === "cancelled" || o.status === "pending") continue;
    if (o.invoiceId) continue; // superseded by its invoice, counted below instead
    events.push({ date: o.createdAt, amount: calculateInvoiceTotals(o.items).total });
  }

  for (const inv of invoices) {
    if (inv.status === "draft" || inv.status === "cancelled") continue;
    events.push({ date: inv.issueDate, amount: calculateInvoiceTotals(inv.items).total });
  }

  return events;
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
  pending: "#F59E0B",
  processing: "#3B82F6",
  shipped: "#8B5CF6",
  delivered: "#22C55E",
  cancelled: "#EF4444",
};

export function statusColor(status: string): string {
  return DISPLAY_STATUS_COLORS[status] ?? "#94A3B8";
}

/**
 * Whole-shilling currency formatting for the Dashboard specifically
 * ("KES 248,500", no cents) - distinct from the shared `formatCurrency`
 * (which renders cents, e.g. "KES 248,500.00") used on invoices/receipts
 * where exact amounts matter. Dashboard summary figures read better
 * rounded.
 */
export function formatDashboardCurrency(amount: number): string {
  return `KES ${Math.round(amount).toLocaleString("en-KE")}`;
}

function computeChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? null : 100;
  return ((current - previous) / previous) * 100;
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

export function computeKpis(
  orders: StoreOrder[],
  now: Date,
  incomeEvents: IncomeEvent[] = orders
    .filter((o) => o.status !== "cancelled")
    .map((o) => ({ date: o.createdAt, amount: o.total })),
): DashboardKpis {
  const { weekStart, weekEnd, prevWeekStart, prevWeekEnd } = buildWeekWindows(now);

  const thisWeek = orders.filter((o) => inRange(new Date(o.createdAt), weekStart, weekEnd));
  const lastWeek = orders.filter((o) => inRange(new Date(o.createdAt), prevWeekStart, prevWeekEnd));

  // Revenue is blended across storefront orders, B2B orders, and invoices
  // (see buildIncomeEvents) so "Total Revenue" reflects the whole business,
  // not just the storefront channel.
  const incomeThisWeek = incomeEvents.filter((e) => inRange(new Date(e.date), weekStart, weekEnd));
  const incomeLastWeek = incomeEvents.filter((e) => inRange(new Date(e.date), prevWeekStart, prevWeekEnd));

  const salesThis = incomeThisWeek.reduce((sum, e) => sum + e.amount, 0);
  const salesLast = incomeLastWeek.reduce((sum, e) => sum + e.amount, 0);

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

export function computeSalesTrend(events: IncomeEvent[], now: Date, range: TrendRange): TrendPoint[] {
  const sumOnDate = (day: Date) =>
    events
      .filter((e) => new Date(e.date).toDateString() === day.toDateString())
      .reduce((sum, e) => sum + e.amount, 0);

  if (range === "week") {
    const { weekStart, weekEnd, prevWeekStart } = buildWeekWindows(now);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return days.map((day, index) => {
      const prevDay = new Date(prevWeekStart);
      prevDay.setDate(prevDay.getDate() + index);

      return { label: format(day, "EEE"), current: sumOnDate(day), previous: sumOnDate(prevDay) };
    });
  }

  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const prevMonthStart = startOfMonth(subMonths(now, 1));
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return days.map((day, index) => {
    const prevDay = new Date(prevMonthStart);
    prevDay.setDate(prevDay.getDate() + index);

    return { label: format(day, "d"), current: sumOnDate(day), previous: sumOnDate(prevDay) };
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
  const statusOrder: (StoreOrderStatus | "pending")[] = ["pending", "processing", "shipped", "delivered", "cancelled"];

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

/**
 * Lightweight, executive-level snapshot of the catalogue for the Dashboard's
 * Catalog/Inventory KPI cards. Deliberately reuses the same stock-bucket
 * thresholds as the Inventory page (`getStockBucket`) so "low stock" means
 * the same thing everywhere in Sentinel. This intentionally does NOT
 * replicate the Inventory page's `reserved`/`available` split (which
 * requires a per-product availability fetch) - the Dashboard already has
 * the product list in memory, so this stays a single, cheap pass over data
 * that's already loaded rather than firing extra requests.
 */
export interface CatalogSnapshot {
  totalProducts: number;
  totalUnits: number;
  draftCount: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export function computeCatalogSnapshot(products: Product[]): CatalogSnapshot {
  const active = products.filter((p) => (p.status ?? "active") !== "archived");

  let totalUnits = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  for (const product of active) {
    totalUnits += product.stock;
    const bucket = getStockBucket(product.stock);
    if (bucket === "out") outOfStockCount += 1;
    else if (bucket === "low" || bucket === "running-low") lowStockCount += 1;
  }

  return {
    totalProducts: products.length,
    totalUnits,
    draftCount: products.filter((p) => p.status === "draft").length,
    lowStockCount,
    outOfStockCount,
  };
}

export interface RevenueOrdersPoint {
  label: string;
  revenue: number;
  orders: number;
}

/**
 * Feeds the "Revenue & Orders Overview" combo chart - daily revenue
 * (storefront orders, excluding cancelled) paired with the number of
 * orders placed that day, over the selected range. The "Orders" series is
 * deliberately scoped to storefront orders only (not the blended
 * `buildIncomeEvents`) so it stays a real, countable thing rather than a
 * mix of orders/invoices with no shared unit - an Order can later become
 * an Invoice, so counting both would double-count the same sale. Revenue
 * *is* blended via `incomeEvents`, so this number matches the Total
 * Revenue KPI card instead of silently under-reporting the B2B side.
 */
export function computeRevenueOrdersTrend(
  orders: StoreOrder[],
  now: Date,
  range: TrendRange,
  incomeEvents: IncomeEvent[] = orders
    .filter((o) => o.status !== "cancelled")
    .map((o) => ({ date: o.createdAt, amount: o.total })),
): RevenueOrdersPoint[] {
  const onDate = (day: Date) => {
    const dayOrders = orders.filter(
      (o) => o.status !== "cancelled" && new Date(o.createdAt).toDateString() === day.toDateString(),
    );
    const dayIncome = incomeEvents.filter(
      (e) => new Date(e.date).toDateString() === day.toDateString(),
    );
    return {
      revenue: dayIncome.reduce((sum, e) => sum + e.amount, 0),
      orders: dayOrders.length,
    };
  };

  if (range === "week") {
    const { weekStart, weekEnd } = buildWeekWindows(now);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    return days.map((day) => ({ label: format(day, "EEE"), ...onDate(day) }));
  }

  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  return days.map((day) => ({ label: format(day, "d"), ...onDate(day) }));
}

export interface KpiSeries {
  /** One point per day of the current week (Mon–Sun), oldest first. */
  revenue: number[];
  orders: number[];
  unitsSold: number[];
  customers: number[];
}

/**
 * Small per-day series for the KPI cards' sparklines. All four derive
 * from the same already-loaded storefront orders - no extra requests -
 * so "decorative" here still means "real": each line traces an actual
 * daily total for the current week.
 *
 * Two of these (`unitsSold`, `customers`) are order-activity metrics, not
 * the same thing as the "Available Stock" and "Total Customers" KPI cards
 * they used to be wired into - see `computeStockTrend` and
 * `computeCustomerTrend` below for the sparklines that actually match
 * those cards' values.
 */
export function computeKpiSeries(
  orders: StoreOrder[],
  now: Date,
  incomeEvents: IncomeEvent[] = orders
    .filter((o) => o.status !== "cancelled")
    .map((o) => ({ date: o.createdAt, amount: o.total })),
): KpiSeries {
  const { weekStart, weekEnd } = buildWeekWindows(now);
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const series: KpiSeries = { revenue: [], orders: [], unitsSold: [], customers: [] };

  for (const day of days) {
    const dayOrders = orders.filter(
      (o) => o.status !== "cancelled" && new Date(o.createdAt).toDateString() === day.toDateString(),
    );
    const dayIncome = incomeEvents.filter((e) => new Date(e.date).toDateString() === day.toDateString());

    series.revenue.push(dayIncome.reduce((sum, e) => sum + e.amount, 0));
    series.orders.push(dayOrders.length);
    series.unitsSold.push(
      dayOrders.reduce((sum, o) => sum + o.items.reduce((s, item) => s + item.quantity, 0), 0),
    );
    series.customers.push(
      new Set(dayOrders.map((o) => o.customer?.email?.toLowerCase()).filter(Boolean)).size,
    );
  }

  return series;
}

/** A single real stock-ledger movement, as returned by movementService. */
export interface StockMovementLike {
  delta: number;
  createdAt: string;
}

/**
 * Real daily "Available Stock" trend for the current week, reconstructed
 * from the stock movement ledger by walking backward from today's actual
 * total units (`currentTotalUnits`). Each point is a genuine end-of-day
 * total, not a proxy metric - this replaces the previous sparkline, which
 * plotted daily units *sold* under the "Available Stock" card, a metric
 * that doesn't track stock levels at all.
 */
export function computeStockTrend(
  movements: StockMovementLike[],
  currentTotalUnits: number,
  now: Date,
): number[] {
  const { weekStart, weekEnd } = buildWeekWindows(now);
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const deltaAfterToday = movements
    .filter((m) => new Date(m.createdAt).getTime() > now.getTime())
    .reduce((sum, m) => sum + m.delta, 0);
  const totalsAtEndOfToday = currentTotalUnits - deltaAfterToday;

  const deltaByDay = new Map<string, number>();
  for (const day of days) deltaByDay.set(day.toDateString(), 0);
  for (const m of movements) {
    const day = new Date(m.createdAt);
    if (day.getTime() > now.getTime()) continue;
    const key = day.toDateString();
    if (deltaByDay.has(key)) deltaByDay.set(key, (deltaByDay.get(key) ?? 0) + m.delta);
  }

  let running = totalsAtEndOfToday;
  const endingByDay = new Map<string, number>();
  for (let i = days.length - 1; i >= 0; i--) {
    const key = days[i].toDateString();
    endingByDay.set(key, running);
    running -= deltaByDay.get(key) ?? 0;
  }

  return days.map((day) => Math.max(0, Math.round(endingByDay.get(day.toDateString()) ?? 0)));
}

/** A single real customer record's signup date, as returned by customerService. */
export interface CustomerSignupLike {
  createdAt: string;
}

export function computeCustomerGrowth(
  customers: CustomerSignupLike[],
  now: Date,
  totalCustomers: number,
): { series: number[]; change: number | null; isUp: boolean } {
  const { weekStart, weekEnd, prevWeekStart, prevWeekEnd } = buildWeekWindows(now);
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const newThisWeek = customers.filter((c) => inRange(new Date(c.createdAt), weekStart, weekEnd)).length;
  const newLastWeek = customers.filter((c) => inRange(new Date(c.createdAt), prevWeekStart, prevWeekEnd)).length;

  const totalBeforeThisWeek = totalCustomers - newThisWeek;
  const change = computeChange(newThisWeek, newLastWeek);

  const series = days.map(
    (day) => customers.filter((c) => new Date(c.createdAt).toDateString() === day.toDateString()).length,
  );

  return { series, change, isUp: newThisWeek >= newLastWeek || totalBeforeThisWeek < 0 };
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
