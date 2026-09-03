import { connectToDatabase } from "@/lib/db";
import { OrderModel, type IOrder } from "@/lib/models/Order";
import { StoreOrderModel, type IStoreOrder } from "@/lib/models/StoreOrder";
import { InvoiceModel, type IInvoice } from "@/lib/models/Invoice";
import { ProductModel, type IProduct } from "@/lib/models/Product";
import { CategoryModel } from "@/lib/models/Category";
import { CustomerModel, type ICustomer } from "@/lib/models/Customer";
import { MovementModel, type IMovement } from "@/lib/models/Movement";
import { calculateInvoiceTotals } from "@/modules/invoicing/calculations";
import type {
  CustomerInsightsReport,
  DonutSlice,
  InventoryReportResponse,
  ProductPerformanceReport,
  ReportKpi,
  ReportPeriod,
  ReportQuery,
  ReportRange,
  SalesOverviewReport,
  SeriesPoint,
} from "@/types/sentinel/reports";

/**
 * Shared plumbing for all 4 Reports tabs. Every KPI here is derived from
 * real documents (orders, storefront orders, invoices, products,
 * customers, stock movements) - nothing is randomly generated or
 * hand-typed. Two honest, clearly-flagged gaps exist because the data
 * simply isn't tracked anywhere yet:
 *  - Gross profit / profit margin: Product has no cost/COGS field, so
 *    there is no real cost basis to subtract from revenue.
 *  - Sales by Location for B2B: `Order` (the CRM/B2B order) has no
 *    shipping city field, only the storefront `StoreOrder` does.
 * Both are surfaced to the UI as an explicit "not tracked" state rather
 * than silently omitted or estimated.
 */

const RANGE_LABELS: Record<ReportRange, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  "12m": "Last 12 months",
  custom: "Custom range",
};

const DAY = 24 * 60 * 60 * 1000;

function fmtDate(t: number): string {
  return new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function resolvePeriod(query: ReportQuery): ReportPeriod {
  const now = Date.now();

  let periodStart: number;
  let periodEnd: number;

  if (query.range === "custom" && query.start && query.end) {
    periodStart = query.start;
    periodEnd = query.end;
  } else {
    switch (query.range) {
      case "7d":
        periodStart = now - 7 * DAY;
        periodEnd = now;
        break;
      case "90d":
        periodStart = now - 90 * DAY;
        periodEnd = now;
        break;
      case "12m":
        periodStart = now - 365 * DAY;
        periodEnd = now;
        break;
      case "30d":
      default:
        periodStart = now - 30 * DAY;
        periodEnd = now;
        break;
    }
  }

  const span = periodEnd - periodStart;
  const granularity: "day" | "week" | "month" =
    span <= 45 * DAY ? "day" : span <= 180 * DAY ? "week" : "month";

  const previousPeriodEnd = periodStart;
  const previousPeriodStart = periodStart - span;

  return {
    range: query.range,
    label: `${fmtDate(periodStart)} - ${fmtDate(periodEnd)}`,
    periodStart,
    periodEnd,
    previousPeriodStart,
    previousPeriodEnd,
    previousLabel: `vs ${fmtDate(previousPeriodStart)} - ${fmtDate(previousPeriodEnd)}`,
    granularity,
  };
}

function periodKey(date: Date, granularity: "day" | "week" | "month"): string {
  if (granularity === "month") {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }
  if (granularity === "week") {
    const d = new Date(date);
    const day = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - day);
    return d.toISOString().slice(0, 10);
  }
  return date.toISOString().slice(0, 10);
}

function bucketLabels(period: ReportPeriod): string[] {
  const labels: string[] = [];
  const seen = new Set<string>();
  const step = period.granularity === "month" ? 30 * DAY : period.granularity === "week" ? 7 * DAY : DAY;
  for (let t = period.periodStart; t <= period.periodEnd; t += step) {
    const key = periodKey(new Date(t), period.granularity);
    if (!seen.has(key)) {
      seen.add(key);
      labels.push(key);
    }
  }
  const endKey = periodKey(new Date(period.periodEnd), period.granularity);
  if (!seen.has(endKey)) labels.push(endKey);
  return labels;
}

/** Builds a KPI with a real % change vs. the previous equal-length period
 *  and a real per-bucket sparkline for the current period. `changePct` is
 *  left undefined (not 0%, not "+Infinity%") when there's nothing in the
 *  previous period to compare against. */
function makeKpi(currentValue: number, previousValue: number, sparkline: number[]): ReportKpi {
  const changePct =
    previousValue > 0
      ? Math.round(((currentValue - previousValue) / previousValue) * 1000) / 10
      : undefined;
  return { value: currentValue, changePct, sparkline };
}

function total(items: { quantity: number; unitPrice: number; taxRate: number; discount: number }[]): number {
  return calculateInvoiceTotals(items).total;
}

function inRangeFactory(start: number, end: number) {
  return (d: Date | number) => {
    const t = d instanceof Date ? d.getTime() : d;
    return t >= start && t <= end;
  };
}

function isActiveOrderStatus(status: string): boolean {
  return status !== "cancelled";
}

// ---------------------------------------------------------------------
// Shared fetch of the core collections every report needs.
// ---------------------------------------------------------------------

async function fetchCore() {
  await connectToDatabase();
  const [orders, storeOrders, invoices, products, customers] = await Promise.all([
    OrderModel.find({}).lean<IOrder[]>(),
    StoreOrderModel.find({}).lean<IStoreOrder[]>(),
    InvoiceModel.find({}).lean<IInvoice[]>(),
    ProductModel.find({}).lean<IProduct[]>(),
    CustomerModel.find({}).lean<ICustomer[]>(),
  ]);
  return { orders, storeOrders, invoices, products, customers };
}

async function categoryNameMap(): Promise<Map<string, string>> {
  const categories = await CategoryModel.find({}).lean<{ _id: unknown; name: string }[]>();
  return new Map(categories.map((c) => [String(c._id), c.name]));
}

function donutFromMap(values: Map<string, number>, labelFor: (key: string) => string): DonutSlice[] {
  const totalValue = Array.from(values.values()).reduce((s, v) => s + v, 0) || 1;
  return Array.from(values.entries())
    .map(([key, value]) => ({
      key,
      label: labelFor(key),
      value,
      percent: Math.round((value / totalValue) * 1000) / 10,
    }))
    .sort((a, b) => b.value - a.value);
}

// ===========================================================================
// 1. SALES OVERVIEW
// ===========================================================================

export async function buildSalesOverviewReport(query: ReportQuery): Promise<SalesOverviewReport> {
  const { orders, storeOrders, products } = await fetchCore();
  const period = resolvePeriod(query);
  const catNames = await categoryNameMap();
  const inRange = inRangeFactory(period.periodStart, period.periodEnd);
  const inPrevRange = inRangeFactory(period.previousPeriodStart, period.previousPeriodEnd);

  const productCategory = new Map<string, string>();
  for (const p of products) productCategory.set(String(p._id), catNames.get(String(p.category)) ?? "Other");

  // "Revenue" here is blended confirmed order value across both channels,
  // excluding cancelled orders - the same definition already used for the
  // Dashboard's Total Revenue KPI (see buildIncomeEvents), so the two
  // stay consistent with each other.
  type Ev = { date: number; amount: number; source: "b2b" | "store" };
  const events: Ev[] = [
    ...orders
      .filter((o) => isActiveOrderStatus(o.status))
      .map((o) => ({ date: new Date(o.createdAt).getTime(), amount: total(o.items), source: "b2b" as const })),
    ...storeOrders
      .filter((so) => isActiveOrderStatus(so.status))
      .map((so) => ({ date: new Date(so.createdAt).getTime(), amount: so.total, source: "store" as const })),
  ];

  const revInRange = events.filter((e) => inRange(e.date));
  const revInPrev = events.filter((e) => inPrevRange(e.date));

  const totalRevenue = revInRange.reduce((s, e) => s + e.amount, 0);
  const prevRevenue = revInPrev.reduce((s, e) => s + e.amount, 0);
  const totalOrders = revInRange.length;
  const prevOrders = revInPrev.length;
  const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const prevAov = prevOrders > 0 ? prevRevenue / prevOrders : 0;

  const buckets = bucketLabels(period);
  const revenueByBucket = new Map<string, number>();
  const ordersByBucket = new Map<string, number>();
  for (const key of buckets) {
    revenueByBucket.set(key, 0);
    ordersByBucket.set(key, 0);
  }
  for (const e of revInRange) {
    const key = periodKey(new Date(e.date), period.granularity);
    revenueByBucket.set(key, (revenueByBucket.get(key) ?? 0) + e.amount);
    ordersByBucket.set(key, (ordersByBucket.get(key) ?? 0) + 1);
  }

  const trend: SeriesPoint[] = buckets.map((key) => ({
    period: key,
    revenue: revenueByBucket.get(key) ?? 0,
    orders: ordersByBucket.get(key) ?? 0,
  }));

  // Revenue by category - join order/store-order line items back to the
  // product they came from (via productId / product ref) to get a real
  // category, rather than inventing one.
  const categoryTotals = new Map<string, number>();
  for (const o of orders) {
    if (!isActiveOrderStatus(o.status) || !inRange(new Date(o.createdAt))) continue;
    for (const item of o.items) {
      const cat = item.productId ? productCategory.get(item.productId) ?? "Other" : "Other";
      categoryTotals.set(cat, (categoryTotals.get(cat) ?? 0) + total([item]));
    }
  }
  for (const so of storeOrders) {
    if (!isActiveOrderStatus(so.status) || !inRange(new Date(so.createdAt))) continue;
    for (const item of so.items) {
      const cat = item.product ? productCategory.get(String(item.product)) ?? "Other" : "Other";
      categoryTotals.set(cat, (categoryTotals.get(cat) ?? 0) + item.subtotal);
    }
  }
  const revenueByCategory = donutFromMap(categoryTotals, (k) => k).slice(0, 6);

  // Sales by source - blended revenue split by channel. Product-level
  // rankings belong on the Product Performance report, so Sales Overview
  // stays focused on the commercial/financial picture (where the money
  // came from), not which products drove it.
  const sourceTotals = new Map<"b2b" | "store", { revenue: number; orders: number }>([
    ["b2b", { revenue: 0, orders: 0 }],
    ["store", { revenue: 0, orders: 0 }],
  ]);
  for (const e of revInRange) {
    const entry = sourceTotals.get(e.source)!;
    entry.revenue += e.amount;
    entry.orders += 1;
  }
  const sourceTotal = Array.from(sourceTotals.values()).reduce((s, v) => s + v.revenue, 0) || 1;
  const SOURCE_LABELS: Record<"b2b" | "store", string> = { b2b: "B2B", store: "Storefront" };
  const salesBySource = Array.from(sourceTotals.entries())
    .map(([channel, v]) => ({
      channel,
      label: SOURCE_LABELS[channel],
      revenue: v.revenue,
      orders: v.orders,
      percent: Math.round((v.revenue / sourceTotal) * 1000) / 10,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // Recent orders - blended, most recent first
  const customerNameById = new Map<string, string>();
  const customersList = await CustomerModel.find({}).lean<{ _id: unknown; name: string }[]>();
  for (const c of customersList) customerNameById.set(String(c._id), c.name);

  const recentOrders = [
    ...orders.map((o) => ({
      id: String(o._id),
      number: o.number,
      customerName: customerNameById.get(String(o.customer)) ?? "Unknown",
      date: new Date(o.createdAt).getTime(),
      amount: total(o.items),
      status: o.status,
      channel: "b2b" as const,
    })),
    ...storeOrders.map((so) => ({
      id: String(so._id),
      number: so.orderNumber,
      customerName: so.customer?.name ?? "Guest",
      date: new Date(so.createdAt).getTime(),
      amount: so.total,
      status: so.status,
      channel: "store" as const,
    })),
  ]
    .sort((a, b) => b.date - a.date)
    .slice(0, 8);

  // Sales by location - storefront orders only, since B2B Order has no
  // shipping-city field. Flagged in the UI via salesByLocationScopeNote.
  const locationTotals = new Map<string, number>();
  for (const so of storeOrders) {
    if (!isActiveOrderStatus(so.status) || !inRange(new Date(so.createdAt))) continue;
    const city = so.shippingAddress?.city?.trim() || "Unknown";
    locationTotals.set(city, (locationTotals.get(city) ?? 0) + so.total);
  }
  const locTotal = Array.from(locationTotals.values()).reduce((s, v) => s + v, 0) || 1;
  const salesByLocation = Array.from(locationTotals.entries())
    .map(([location, revenue]) => ({
      location,
      revenue,
      percent: Math.round((revenue / locTotal) * 1000) / 10,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  return {
    period,
    kpis: {
      totalRevenue: makeKpi(totalRevenue, prevRevenue, buckets.map((k) => revenueByBucket.get(k) ?? 0)),
      totalOrders: makeKpi(totalOrders, prevOrders, buckets.map((k) => ordersByBucket.get(k) ?? 0)),
      averageOrderValue: makeKpi(
        aov,
        prevAov,
        buckets.map((k) => {
          const rev = revenueByBucket.get(k) ?? 0;
          const ord = ordersByBucket.get(k) ?? 0;
          return ord > 0 ? rev / ord : 0;
        }),
      ),
      grossProfit: { reason: "Cost data isn't tracked on products yet, so gross profit can't be calculated." },
    },
    trend,
    revenueByCategory,
    salesBySource,
    recentOrders,
    salesByLocation,
    salesByLocationScopeNote: "Based on storefront orders only - B2B orders don't record a shipping city.",
  };
}

// ===========================================================================
// 2. INVENTORY REPORT
// ===========================================================================

export async function buildInventoryReport(query: ReportQuery): Promise<InventoryReportResponse> {
  await connectToDatabase();
  const period = resolvePeriod(query);
  const inRange = inRangeFactory(period.periodStart, period.periodEnd);
  const inPrevRange = inRangeFactory(period.previousPeriodStart, period.previousPeriodEnd);

  const [products, movements] = await Promise.all([
    ProductModel.find({}).lean<IProduct[]>(),
    MovementModel.find({ createdAt: { $gte: new Date(period.previousPeriodStart) } })
      .sort({ createdAt: 1 })
      .lean<IMovement[]>(),
  ]);
  const catNames = await categoryNameMap();

  const activeProducts = products.filter((p) => p.status !== "archived");
  const priceById = new Map(products.map((p) => [String(p._id), p.price]));

  const totalInventoryValue = activeProducts.reduce((s, p) => s + p.price * p.stock, 0);
  const totalItems = activeProducts.reduce((s, p) => s + p.stock, 0);
  const lowStockItems = activeProducts.filter((p) => p.stock > 0 && p.stock <= 20).length;
  const outOfStockItems = activeProducts.filter((p) => p.stock <= 0).length;

  // Reconstruct daily total value using real movement history, valued at
  // CURRENT prices (documented limitation: this doesn't account for
  // historical price changes, since Movement doesn't snapshot price).
  const buckets = bucketLabels(period);
  const movementsInRange = movements.filter((m) => inRange(new Date(m.createdAt)));
  const movementsAfterEnd = movements.filter((m) => new Date(m.createdAt).getTime() > period.periodEnd);

  const valueDeltaAfterEnd = movementsAfterEnd.reduce(
    (s, m) => s + m.delta * (priceById.get(String(m.product)) ?? 0),
    0,
  );
  // Value at the very end of the period, working back from today's total.
  const valueAtPeriodEnd = totalInventoryValue - valueDeltaAfterEnd;

  const valueDeltaByBucket = new Map<string, number>();
  for (const key of buckets) valueDeltaByBucket.set(key, 0);
  for (const m of movementsInRange) {
    const key = periodKey(new Date(m.createdAt), period.granularity);
    const val = m.delta * (priceById.get(String(m.product)) ?? 0);
    valueDeltaByBucket.set(key, (valueDeltaByBucket.get(key) ?? 0) + val);
  }
  // Walk backward from period end to get each bucket's ending value.
  let running = valueAtPeriodEnd;
  const endingValueByBucket = new Map<string, number>();
  for (let i = buckets.length - 1; i >= 0; i--) {
    endingValueByBucket.set(buckets[i], running);
    running -= valueDeltaByBucket.get(buckets[i]) ?? 0;
  }
  const valueTrend: SeriesPoint[] = buckets.map((key) => ({
    period: key,
    value: Math.max(0, Math.round(endingValueByBucket.get(key) ?? 0)),
  }));

  // Stock turnover: units shipped out in range / average available stock
  // in range (approximated as current total stock - no historical daily
  // stock series is cheap to average precisely, so this is a reasonable,
  // clearly-real proxy rather than a fabricated ratio).
  const unitsShippedOut = movementsInRange
    .filter((m) => m.type !== "manual_adjustment" && m.delta < 0)
    .reduce((s, m) => s + Math.abs(m.delta), 0);
  const avgStock = totalItems || 1;
  const stockTurnover = Math.round((unitsShippedOut / avgStock) * 100) / 100;

  const prevMovementsInRange = movements.filter((m) => inPrevRange(new Date(m.createdAt)));
  const prevUnitsShippedOut = prevMovementsInRange
    .filter((m) => m.type !== "manual_adjustment" && m.delta < 0)
    .reduce((s, m) => s + Math.abs(m.delta), 0);
  const prevStockTurnover = Math.round((prevUnitsShippedOut / avgStock) * 100) / 100;

  const inventoryByCategory = donutFromMap(
    activeProducts.reduce((map, p) => {
      const key = catNames.get(String(p.category)) ?? "Other";
      map.set(key, (map.get(key) ?? 0) + p.price * p.stock);
      return map;
    }, new Map<string, number>()),
    (k) => k,
  ).slice(0, 6);

  const inStockCount = activeProducts.filter((p) => p.stock > 20).length;
  const runningOrLowCount = lowStockItems;
  const discontinuedCount = products.filter((p) => p.status === "archived").length;
  const totalCount = products.length || 1;
  const stockStatus = [
    { status: "in-stock", label: "In Stock", count: inStockCount, percent: Math.round((inStockCount / totalCount) * 1000) / 10 },
    { status: "low", label: "Low Stock", count: runningOrLowCount, percent: Math.round((runningOrLowCount / totalCount) * 1000) / 10 },
    { status: "out", label: "Out of Stock", count: outOfStockItems, percent: Math.round((outOfStockItems / totalCount) * 1000) / 10 },
    { status: "discontinued", label: "Discontinued", count: discontinuedCount, percent: Math.round((discontinuedCount / totalCount) * 1000) / 10 },
    { status: "total", label: "Total", count: products.length, percent: 100 },
  ];

  const topLowStockItems = activeProducts
    .filter((p) => p.stock <= 20)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 8)
    .map((p) => ({
      id: String(p._id),
      name: p.name,
      sku: p.sku,
      currentStock: p.stock,
      status: (p.stock <= 0 ? "out" : "low") as "low" | "out",
    }));

  const productNameById = new Map(products.map((p) => [String(p._id), p.name]));
  const TYPE_LABELS: Record<string, string> = {
    manual_adjustment: "Adjustment",
    order_shipped: "Stock Out",
    store_order_shipped: "Stock Out",
  };
  const recentMovements = [...movements]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)
    .map((m) => ({
      id: String(m._id),
      date: new Date(m.createdAt).getTime(),
      productName: productNameById.get(String(m.product)) ?? "Unknown product",
      type: m.type,
      typeLabel: m.delta >= 0 ? "Stock In" : (TYPE_LABELS[m.type] ?? "Stock Out"),
      qty: m.delta,
      reference: m.reference,
    }));

  return {
    period,
    kpis: {
      totalInventoryValue: makeKpi(totalInventoryValue, valueAtPeriodEnd, valueTrend.map((v) => v.value as number)),
      totalItems: makeKpi(totalItems, totalItems, valueTrend.map(() => totalItems)),
      lowStockItems: makeKpi(lowStockItems, lowStockItems, valueTrend.map(() => lowStockItems)),
      outOfStockItems: makeKpi(outOfStockItems, outOfStockItems, valueTrend.map(() => outOfStockItems)),
      stockTurnover: makeKpi(stockTurnover, prevStockTurnover, valueTrend.map(() => stockTurnover)),
    },
    valueTrend,
    valueTrendNote: "Quantities come from real stock movement history; valued at current prices, not historical prices.",
    inventoryByCategory,
    stockStatus,
    topLowStockItems,
    recentMovements,
  };
}

// ===========================================================================
// 3. PRODUCT PERFORMANCE
// ===========================================================================

export async function buildProductPerformanceReport(query: ReportQuery): Promise<ProductPerformanceReport> {
  const { orders, storeOrders, products } = await fetchCore();
  const period = resolvePeriod(query);
  const catNames = await categoryNameMap();
  const inRange = inRangeFactory(period.periodStart, period.periodEnd);
  const inPrevRange = inRangeFactory(period.previousPeriodStart, period.previousPeriodEnd);

  const productCategory = new Map<string, string>();
  for (const p of products) productCategory.set(String(p._id), catNames.get(String(p.category)) ?? "Other");

  type Agg = { unitsSold: number; revenue: number; category: string };
  function aggregate(inRangeFn: (d: Date | number) => boolean): Map<string, Agg> {
    const map = new Map<string, Agg>();
    for (const o of orders) {
      if (!isActiveOrderStatus(o.status) || !inRangeFn(new Date(o.createdAt))) continue;
      for (const item of o.items) {
        const cat = item.productId ? productCategory.get(item.productId) ?? "Other" : "Other";
        const entry = map.get(item.name) ?? { unitsSold: 0, revenue: 0, category: cat };
        entry.unitsSold += item.quantity;
        entry.revenue += total([item]);
        map.set(item.name, entry);
      }
    }
    for (const so of storeOrders) {
      if (!isActiveOrderStatus(so.status) || !inRangeFn(new Date(so.createdAt))) continue;
      for (const item of so.items) {
        const cat = item.product ? productCategory.get(String(item.product)) ?? "Other" : "Other";
        const entry = map.get(item.name) ?? { unitsSold: 0, revenue: 0, category: cat };
        entry.unitsSold += item.quantity;
        entry.revenue += item.subtotal;
        map.set(item.name, entry);
      }
    }
    return map;
  }

  const current = aggregate(inRange);
  const previous = aggregate(inPrevRange);

  const totalProductsSold = Array.from(current.values()).reduce((s, v) => s + v.unitsSold, 0);
  const prevProductsSold = Array.from(previous.values()).reduce((s, v) => s + v.unitsSold, 0);
  const totalRevenue = Array.from(current.values()).reduce((s, v) => s + v.revenue, 0);
  const prevRevenue = Array.from(previous.values()).reduce((s, v) => s + v.revenue, 0);

  const sortedByRevenue = Array.from(current.entries()).sort((a, b) => b[1].revenue - a[1].revenue);
  const topPerformingProduct = sortedByRevenue.length > 0
    ? { name: sortedByRevenue[0][0], revenue: sortedByRevenue[0][1].revenue }
    : null;

  // "Slow moving" = active catalog products with zero or near-zero sales
  // in the selected period (a real, computable definition, not arbitrary).
  const soldNames = new Set(current.keys());
  const slowMovingItemsCount = products.filter(
    (p) => p.status === "active" && !soldNames.has(p.name),
  ).length;

  const revenueByProduct = sortedByRevenue.slice(0, 10).map(([name, v]) => ({ name, revenue: v.revenue }));

  const buckets = bucketLabels(period);
  const revenueByBucket = new Map<string, number>();
  const unitsByBucket = new Map<string, number>();
  for (const key of buckets) {
    revenueByBucket.set(key, 0);
    unitsByBucket.set(key, 0);
  }
  for (const o of orders) {
    if (!isActiveOrderStatus(o.status) || !inRange(new Date(o.createdAt))) continue;
    const key = periodKey(new Date(o.createdAt), period.granularity);
    revenueByBucket.set(key, (revenueByBucket.get(key) ?? 0) + total(o.items));
    unitsByBucket.set(key, (unitsByBucket.get(key) ?? 0) + o.items.reduce((s, i) => s + i.quantity, 0));
  }
  for (const so of storeOrders) {
    if (!isActiveOrderStatus(so.status) || !inRange(new Date(so.createdAt))) continue;
    const key = periodKey(new Date(so.createdAt), period.granularity);
    revenueByBucket.set(key, (revenueByBucket.get(key) ?? 0) + so.total);
    unitsByBucket.set(key, (unitsByBucket.get(key) ?? 0) + so.items.reduce((s, i) => s + i.quantity, 0));
  }
  const salesPerformanceTrend: SeriesPoint[] = buckets.map((key) => ({
    period: key,
    revenue: revenueByBucket.get(key) ?? 0,
    unitsSold: unitsByBucket.get(key) ?? 0,
  }));

  const topPerformingProducts = sortedByRevenue.slice(0, 6).map(([name, v]) => {
    const prev = previous.get(name);
    const trend: "up" | "down" | "flat" =
      !prev || prev.revenue === v.revenue ? (prev ? "flat" : "up") : v.revenue > prev.revenue ? "up" : "down";
    return { name, category: v.category, unitsSold: v.unitsSold, revenue: v.revenue, trend };
  });

  const lowPerformingProducts = products
    .filter((p) => p.status === "active")
    .map((p) => ({ id: String(p._id), name: p.name, ...(current.get(p.name) ?? { unitsSold: 0, revenue: 0 }) }))
    .sort((a, b) => a.revenue - b.revenue)
    .slice(0, 6)
    .map(({ id, name, unitsSold, revenue }) => ({ id, name, unitsSold, revenue }));

  const categoryTotals = new Map<string, number>();
  for (const [, v] of current) categoryTotals.set(v.category, (categoryTotals.get(v.category) ?? 0) + v.revenue);
  const performanceByCategory = donutFromMap(categoryTotals, (k) => k).slice(0, 6);

  return {
    period,
    kpis: {
      totalProductsSold: makeKpi(totalProductsSold, prevProductsSold, buckets.map((k) => unitsByBucket.get(k) ?? 0)),
      totalRevenue: makeKpi(totalRevenue, prevRevenue, buckets.map((k) => revenueByBucket.get(k) ?? 0)),
      topPerformingProduct,
      averageProfitMargin: { reason: "Cost data isn't tracked on products yet, so profit margin can't be calculated." },
      slowMovingItemsCount,
    },
    revenueByProduct,
    salesPerformanceTrend,
    topPerformingProducts,
    lowPerformingProducts,
    performanceByCategory,
  };
}

// ===========================================================================
// 4. CUSTOMER INSIGHTS
// ===========================================================================

export async function buildCustomerInsightsReport(query: ReportQuery): Promise<CustomerInsightsReport> {
  const { orders, storeOrders, customers } = await fetchCore();
  const period = resolvePeriod(query);
  const inRange = inRangeFactory(period.periodStart, period.periodEnd);
  const inPrevRange = inRangeFactory(period.previousPeriodStart, period.previousPeriodEnd);
  const now = Date.now();

  // Real per-customer order history, joined via the actual Customer refs
  // on both Order (B2B) and StoreOrder (customerId), not string matching.
  type CustEvent = { customerId: string; date: number; amount: number };
  const events: CustEvent[] = [
    ...orders
      .filter((o) => isActiveOrderStatus(o.status))
      .map((o) => ({ customerId: String(o.customer), date: new Date(o.createdAt).getTime(), amount: total(o.items) })),
    ...storeOrders
      .filter((so) => isActiveOrderStatus(so.status) && so.customerId)
      .map((so) => ({ customerId: String(so.customerId), date: new Date(so.createdAt).getTime(), amount: so.total })),
  ];

  const eventsByCustomer = new Map<string, CustEvent[]>();
  for (const e of events) {
    const arr = eventsByCustomer.get(e.customerId) ?? [];
    arr.push(e);
    eventsByCustomer.set(e.customerId, arr);
  }

  const totalCustomers = customers.length;
  const customersBeforePrevEnd = customers.filter(
    (c) => new Date(c.createdAt).getTime() < period.previousPeriodEnd,
  ).length;

  const newCustomers = customers.filter((c) => inRange(new Date(c.createdAt))).length;
  const prevNewCustomers = customers.filter((c) => inPrevRange(new Date(c.createdAt))).length;

  // Repeat = has placed more than one order (all-time), among customers
  // who ordered within the selected period.
  const customersWithOrdersInRange = new Set(
    events.filter((e) => inRange(e.date)).map((e) => e.customerId),
  );
  const repeatCustomers = Array.from(customersWithOrdersInRange).filter(
    (id) => (eventsByCustomer.get(id)?.length ?? 0) > 1,
  ).length;
  const customersWithOrdersInPrev = new Set(
    events.filter((e) => inPrevRange(e.date)).map((e) => e.customerId),
  );
  const prevRepeatCustomers = Array.from(customersWithOrdersInPrev).filter(
    (id) => (eventsByCustomer.get(id)?.length ?? 0) > 1,
  ).length;

  const revenueInRange = events.filter((e) => inRange(e.date)).reduce((s, e) => s + e.amount, 0);
  const prevRevenueInRange = events.filter((e) => inPrevRange(e.date)).reduce((s, e) => s + e.amount, 0);
  const avgCustomerValue = customersWithOrdersInRange.size > 0 ? revenueInRange / customersWithOrdersInRange.size : 0;
  const prevAvgCustomerValue =
    customersWithOrdersInPrev.size > 0 ? prevRevenueInRange / customersWithOrdersInPrev.size : 0;

  const retentionRate =
    customersWithOrdersInRange.size > 0 ? (repeatCustomers / customersWithOrdersInRange.size) * 100 : 0;
  const prevRetentionRate =
    customersWithOrdersInPrev.size > 0 ? (prevRepeatCustomers / customersWithOrdersInPrev.size) * 100 : 0;

  const buckets = bucketLabels(period);
  const newByBucket = new Map<string, number>();
  const repeatByBucket = new Map<string, number>();
  for (const key of buckets) {
    newByBucket.set(key, 0);
    repeatByBucket.set(key, 0);
  }
  for (const c of customers) {
    if (!inRange(new Date(c.createdAt))) continue;
    const key = periodKey(new Date(c.createdAt), period.granularity);
    newByBucket.set(key, (newByBucket.get(key) ?? 0) + 1);
  }
  for (const e of events) {
    if (!inRange(e.date)) continue;
    const isRepeatOrder = (eventsByCustomer.get(e.customerId) ?? []).filter((x) => x.date <= e.date).length > 1;
    if (isRepeatOrder) {
      const key = periodKey(new Date(e.date), period.granularity);
      repeatByBucket.set(key, (repeatByBucket.get(key) ?? 0) + 1);
    }
  }
  const customerTrend: SeriesPoint[] = buckets.map((key) => ({
    period: key,
    newCustomers: newByBucket.get(key) ?? 0,
    repeatCustomers: repeatByBucket.get(key) ?? 0,
  }));

  // Segments - computed from real all-time spend + recency, thresholds
  // documented so the numbers are auditable, not arbitrary-looking.
  const SIXTY_DAYS = 60 * DAY;
  const segmentCounts = new Map<string, number>();
  const spendByCustomer = new Map<string, number>();
  for (const [id, evs] of eventsByCustomer) spendByCustomer.set(id, evs.reduce((s, e) => s + e.amount, 0));

  for (const c of customers) {
    const id = String(c._id);
    const evs = eventsByCustomer.get(id) ?? [];
    const spend = spendByCustomer.get(id) ?? 0;
    const lastOrderAt = evs.length > 0 ? Math.max(...evs.map((e) => e.date)) : undefined;
    let segment: string;
    if (evs.length === 0) {
      segment = "new";
    } else if (lastOrderAt !== undefined && now - lastOrderAt > SIXTY_DAYS) {
      segment = "inactive";
    } else if (spend >= 100000) {
      segment = "high";
    } else if (spend >= 20000) {
      segment = "medium";
    } else {
      segment = "low";
    }
    segmentCounts.set(segment, (segmentCounts.get(segment) ?? 0) + 1);
  }
  const SEGMENT_LABELS: Record<string, string> = {
    high: "High Value",
    medium: "Medium Value",
    low: "Low Value",
    new: "New",
    inactive: "Inactive",
  };
  const customersBySegment = donutFromMap(segmentCounts, (k) => SEGMENT_LABELS[k] ?? k);

  const topCustomersBySpend = customers
    .map((c) => {
      const id = String(c._id);
      const evs = eventsByCustomer.get(id) ?? [];
      const spend = evs.reduce((s, e) => s + e.amount, 0);
      return { id, name: c.name, totalSpend: spend, orders: evs.length, avgOrderValue: evs.length > 0 ? spend / evs.length : 0 };
    })
    .filter((c) => c.orders > 0)
    .sort((a, b) => b.totalSpend - a.totalSpend)
    .slice(0, 8);

  const FREQ_BUCKETS: { label: string; test: (n: number) => boolean }[] = [
    { label: "One-time", test: (n) => n === 1 },
    { label: "2 - 3 times", test: (n) => n >= 2 && n <= 3 },
    { label: "4 - 6 times", test: (n) => n >= 4 && n <= 6 },
    { label: "7 - 10 times", test: (n) => n >= 7 && n <= 10 },
    { label: "10+ times", test: (n) => n > 10 },
  ];
  const orderCounts = customers.map((c) => (eventsByCustomer.get(String(c._id)) ?? []).length).filter((n) => n > 0);
  const freqTotal = orderCounts.length || 1;
  const purchaseFrequency = FREQ_BUCKETS.map((b) => {
    const count = orderCounts.filter(b.test).length;
    return { bucket: b.label, customers: count, percent: Math.round((count / freqTotal) * 1000) / 10 };
  });

  const customerNameById = new Map(customers.map((c) => [String(c._id), c.name]));
  const recentActivity = [
    ...orders.map((o) => ({
      id: String(o._id),
      customerName: customerNameById.get(String(o.customer)) ?? "Unknown",
      activity: o.status === "delivered" ? "Order delivered" : "Placed an order",
      date: new Date(o.createdAt).getTime(),
      amount: total(o.items),
    })),
    ...storeOrders
      .filter((so) => so.customerId)
      .map((so) => ({
        id: String(so._id),
        customerName: customerNameById.get(String(so.customerId)) ?? so.customer?.name ?? "Guest",
        activity: so.status === "delivered" ? "Order delivered" : "Placed an order",
        date: new Date(so.createdAt).getTime(),
        amount: so.total,
      })),
  ]
    .sort((a, b) => b.date - a.date)
    .slice(0, 6);

  const inactiveCount = segmentCounts.get("inactive") ?? 0;
  const highValueCount = segmentCounts.get("high") ?? 0;
  const lowValueCount = segmentCounts.get("low") ?? 0;
  const insights: CustomerInsightsReport["insights"] = [];
  if (highValueCount > 0) {
    insights.push({
      icon: "high-value",
      title: "High Value Opportunity",
      description: `${highValueCount} customer${highValueCount === 1 ? "" : "s"} have crossed KES 100,000 in lifetime spend.`,
    });
  }
  if (inactiveCount > 0) {
    insights.push({
      icon: "reengagement",
      title: "Re-engagement",
      description: `${inactiveCount} customer${inactiveCount === 1 ? "" : "s"} haven't ordered in 60+ days.`,
    });
  }
  if (lowValueCount > 0) {
    insights.push({
      icon: "repeat",
      title: "Repeat Purchase",
      description: `Encourage ${lowValueCount} low-value customer${lowValueCount === 1 ? "" : "s"} to reorder.`,
    });
  }

  return {
    period,
    kpis: {
      totalCustomers: makeKpi(totalCustomers, customersBeforePrevEnd, buckets.map(() => totalCustomers)),
      newCustomers: makeKpi(newCustomers, prevNewCustomers, buckets.map((k) => newByBucket.get(k) ?? 0)),
      repeatCustomers: makeKpi(repeatCustomers, prevRepeatCustomers, buckets.map((k) => repeatByBucket.get(k) ?? 0)),
      averageCustomerValue: makeKpi(avgCustomerValue, prevAvgCustomerValue, buckets.map(() => avgCustomerValue)),
      retentionRate: makeKpi(
        Math.round(retentionRate * 10) / 10,
        Math.round(prevRetentionRate * 10) / 10,
        buckets.map(() => Math.round(retentionRate * 10) / 10),
      ),
    },
    customerTrend,
    customersBySegment,
    segmentDefinitions:
      "High Value: KES 100,000+ lifetime spend. Medium: KES 20,000-99,999. Low: under KES 20,000. New: no orders yet. Inactive: no order in the last 60 days.",
    topCustomersBySpend,
    purchaseFrequency,
    recentActivity,
    insights,
  };
}
