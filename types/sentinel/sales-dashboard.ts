/**
 * Types for the sales & revenue dashboard (GET /api/sales-dashboard).
 *
 * These mirror the business rules enforced server-side in
 * modules/analytics/sales-dashboard.ts — see that file for the accounting
 * policy behind each figure. Nothing here is computed on the client;
 * this module only describes the shape of what the server already
 * calculated, so the dashboard never has to (and never should)
 * re-derive money figures from raw documents itself.
 */

export const DASHBOARD_RANGES = ["7d", "30d", "90d", "12m", "custom"] as const;
export type DashboardRange = (typeof DASHBOARD_RANGES)[number];

export interface DashboardQuery {
  range: DashboardRange;
  /** Only used when range === "custom", both as epoch ms. */
  start?: number;
  end?: number;
}

/** A single KPI figure. `value` is always in KES, `count` is the number of
 *  underlying documents that make it up so the card can show both. */
export interface KpiFigure {
  value: number;
  count: number;
}

export interface SalesDashboardKpis {
  confirmedSales: KpiFigure;
  invoiced: KpiFigure;
  cashCollected: KpiFigure;
  outstanding: KpiFigure;
  revenueRecognized: KpiFigure;
}

export type PipelineStageKey =
  | "quotations"
  | "accepted"
  | "orders"
  | "invoiced"
  | "paid"
  | "delivered"
  | "revenueRecognized";

export interface PipelineStage {
  key: PipelineStageKey;
  label: string;
  count: number;
  value: number;
  /** % of the previous stage's count that reached this stage. Omitted for the first stage. */
  conversionRate?: number;
}

export interface SeriesPoint {
  /** ISO date (day or month start, depending on granularity) used as the x-axis label. */
  period: string;
  confirmedSales: number;
  invoiced: number;
  cashCollected: number;
  revenueRecognized: number;
}

export type OrderSourceKey = "website" | "whatsapp" | "quotation" | "admin";

export interface OrderSourceBreakdown {
  source: OrderSourceKey;
  label: string;
  count: number;
  value: number;
  /** True while the source has no persistent backing data yet (see WhatsApp requests). */
  pendingImplementation?: boolean;
}

export interface OrderStatusBreakdown {
  status: string;
  label: string;
  count: number;
}

export interface AgingBucket {
  label: string;
  value: number;
  count: number;
}

export interface PaymentMethodBreakdown {
  method: string;
  label: string;
  value: number;
  count: number;
}

export interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

export interface SalesDashboardResponse {
  range: DashboardRange;
  periodStart: number;
  periodEnd: number;
  granularity: "day" | "week" | "month";
  kpis: SalesDashboardKpis;
  pipeline: PipelineStage[];
  series: SeriesPoint[];
  ordersBySource: OrderSourceBreakdown[];
  ordersByStatus: OrderStatusBreakdown[];
  outstandingAging: AgingBucket[];
  paymentMethods: PaymentMethodBreakdown[];
  topProducts: TopProduct[];
  generatedAt: number;
}
