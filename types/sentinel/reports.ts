export const REPORT_RANGES = ["7d", "30d", "90d", "12m", "custom"] as const;
export type ReportRange = (typeof REPORT_RANGES)[number];

export interface ReportQuery {
  range: ReportRange;
  /** Only used when range === "custom", both as epoch ms. */
  start?: number;
  end?: number;
}

export interface ReportPeriod {
  range: ReportRange;
  label: string;
  periodStart: number;
  periodEnd: number;
  previousPeriodStart: number;
  previousPeriodEnd: number;
  previousLabel: string;
  granularity: "day" | "week" | "month";
}

/** A single KPI figure with its own trend vs. the previous period.
 *  `changePct` is undefined when the previous period had nothing to
 *  compare against (avoids a fake "+Infinity%"). */
export interface ReportKpi {
  value: number;
  changePct?: number;
  /** Real per-bucket series for this KPI's sparkline, aligned to the
   *  same buckets as the report's main trend series. */
  sparkline: number[];
}

export interface SeriesPoint {
  period: string;
  [key: string]: string | number;
}

export interface DonutSlice {
  key: string;
  label: string;
  value: number;
  percent: number;
}

export interface UnavailableMetric {
  reason: string;
}

// ---------------------------------------------------------------------
// Sales Overview
// ---------------------------------------------------------------------

export interface SalesOverviewReport {
  period: ReportPeriod;
  kpis: {
    totalRevenue: ReportKpi;
    totalOrders: ReportKpi;
    averageOrderValue: ReportKpi;
    /** No cost-of-goods data is tracked on Product yet, so this is
     *  honestly reported as unavailable rather than fabricated. */
    grossProfit: UnavailableMetric;
  };
  trend: SeriesPoint[]; // { period, revenue, orders }
  revenueByCategory: DonutSlice[];
  /** Blended revenue split by sales channel (B2B vs storefront). Product-level
   *  rankings live on the Product Performance report, not here - this report
   *  answers "what money did we make", not "which products sold best". */
  salesBySource: { channel: "b2b" | "store"; label: string; revenue: number; orders: number; percent: number }[];
  recentOrders: {
    id: string;
    number: string;
    customerName: string;
    date: number;
    amount: number;
    status: string;
    channel: "storefront" | "b2b";
  }[];
  salesByLocation: { location: string; revenue: number; percent: number }[];
  /** True when salesByLocation only reflects storefront orders (B2B
   *  orders have no structured city/location field). */
  salesByLocationScopeNote: string;
}

// ---------------------------------------------------------------------
// Inventory Report
// ---------------------------------------------------------------------

export interface InventoryReportResponse {
  period: ReportPeriod;
  kpis: {
    totalInventoryValue: ReportKpi;
    totalItems: ReportKpi;
    lowStockItems: ReportKpi;
    outOfStockItems: ReportKpi;
    /** Units shipped out in range / average available stock in range. */
    stockTurnover: ReportKpi;
  };
  valueTrend: SeriesPoint[]; // { period, value } - quantities are real movement history, valued at CURRENT prices (see note)
  valueTrendNote: string;
  inventoryByCategory: DonutSlice[];
  stockStatus: { status: string; label: string; count: number; percent: number }[];
  topLowStockItems: { id: string; name: string; sku?: string; currentStock: number; status: "low" | "out" }[];
  recentMovements: {
    id: string;
    date: number;
    productName: string;
    type: string;
    typeLabel: string;
    qty: number;
    reference?: string;
  }[];
}

// ---------------------------------------------------------------------
// Product Performance
// ---------------------------------------------------------------------

export interface ProductPerformanceReport {
  period: ReportPeriod;
  kpis: {
    totalProductsSold: ReportKpi;
    totalRevenue: ReportKpi;
    topPerformingProduct: { name: string; revenue: number } | null;
    /** No cost-of-goods data is tracked on Product yet. */
    averageProfitMargin: UnavailableMetric;
    slowMovingItemsCount: number;
  };
  revenueByProduct: { name: string; revenue: number }[]; // top 10
  salesPerformanceTrend: SeriesPoint[]; // { period, revenue, unitsSold }
  topPerformingProducts: {
    name: string;
    category: string;
    unitsSold: number;
    revenue: number;
    trend: "up" | "down" | "flat";
  }[];
  lowPerformingProducts: {
    id: string;
    name: string;
    unitsSold: number;
    revenue: number;
  }[];
  performanceByCategory: DonutSlice[];
}

// ---------------------------------------------------------------------
// Customer Insights
// ---------------------------------------------------------------------

export interface CustomerInsightsReport {
  period: ReportPeriod;
  kpis: {
    totalCustomers: ReportKpi;
    newCustomers: ReportKpi;
    repeatCustomers: ReportKpi;
    averageCustomerValue: ReportKpi;
    retentionRate: ReportKpi; // percent
  };
  customerTrend: SeriesPoint[]; // { period, newCustomers, repeatCustomers }
  customersBySegment: DonutSlice[];
  segmentDefinitions: string;
  topCustomersBySpend: {
    id: string;
    name: string;
    totalSpend: number;
    orders: number;
    avgOrderValue: number;
  }[];
  purchaseFrequency: { bucket: string; customers: number; percent: number }[];
  recentActivity: {
    id: string;
    customerName: string;
    activity: string;
    date: number;
    amount?: number;
  }[];
  insights: { icon: "high-value" | "reengagement" | "repeat"; title: string; description: string }[];
}
