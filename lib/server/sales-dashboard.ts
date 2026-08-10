import { connectToDatabase } from "@/lib/db";
import { QuotationModel, type IQuotation } from "@/lib/models/Quotation";
import { OrderModel, type IOrder } from "@/lib/models/Order";
import { InvoiceModel, type IInvoice } from "@/lib/models/Invoice";
import { StoreOrderModel, type IStoreOrder } from "@/lib/models/StoreOrder";
import type {
  AgingBucket,
  DashboardQuery,
  DashboardRange,
  OrderSourceBreakdown,
  OrderStatusBreakdown,
  PaymentMethodBreakdown,
  PipelineStage,
  SalesDashboardResponse,
  SeriesPoint,
  TopProduct,
} from "@/types/sentinel/sales-dashboard";

/**
 * ACCOUNTING POLICY — the definitions below are the one place in the app
 * that decides what counts as "sold", "invoiced", "collected" and
 * "recognized". Every KPI card and chart on the dashboard reads from
 * here rather than re-deriving these figures, so the numbers can never
 * drift apart from each other or get looser under UI pressure.
 *
 * - CONFIRMED SALES: the value of orders (storefront + B2B) that the
 *   business has committed to fulfil — i.e. no longer just "pending" —
 *   and that have not been cancelled. This is a sales/demand figure,
 *   not a cash or accounting figure.
 *
 * - INVOICED: the value of invoices that have actually been issued to a
 *   customer (excludes drafts, which are not yet a real financial
 *   document, and cancelled invoices).
 *
 * - CASH COLLECTED: money that has actually changed hands. For B2B this
 *   is `invoice.amountPaid` (a field staff update via "Record Payment"),
 *   NOT inferred from invoice.status — a partially paid invoice
 *   contributes its actual paid amount, not its full total and not
 *   zero. For the storefront it's the total of orders whose
 *   paymentStatus is "paid".
 *
 * - OUTSTANDING: invoice balances still owed (total − amountPaid, for
 *   any non-draft, non-cancelled invoice) plus storefront orders still
 *   awaiting payment (cash-on-delivery orders that haven't been marked
 *   paid yet).
 *
 * - REVENUE RECOGNIZED: the subset of sales that are BOTH fulfilled
 *   (delivered) AND fully paid. An accepted quotation is not revenue.
 *   An issued invoice is not revenue. Even a paid invoice for goods
 *   that haven't shipped is not, on its own, treated as recognized
 *   here — this dashboard uses a delivered-and-paid policy, which is
 *   deliberately conservative. A future finance configuration could
 *   swap this for accrual-on-invoice or another policy; this function
 *   is the only place that would need to change.
 *
 * Known data gaps, surfaced honestly in the UI rather than papered
 * over:
 *  - There is no persistent WhatsApp request record yet, so the
 *    "WhatsApp" source bucket is always zero (see improvement #1 in the
 *    product brief).
 *  - B2B invoices don't yet capture a payment method per payment (there
 *    is no separate Payment record — see improvement #6), so the
 *    "payment methods" breakdown only reflects storefront (M-Pesa/COD)
 *    payments. The dashboard says so next to the chart.
 *  - Order/StoreOrder status changes aren't timestamped individually,
 *    so "delivered" figures use the document's createdAt, not an actual
 *    delivery date.
 */

type MoneyItem = { quantity: number; unitPrice: number; taxRate: number; discount: number };

/**
 * Mirrors lib/sales.ts#computeTotals exactly (gross → discount → tax on the
 * discounted amount → sum). Reimplemented locally rather than imported
 * because computeTotals is typed against the client-side `LineItem` shape
 * (which requires a React-only `id` field); the persisted Mongoose
 * documents here never have one. The math must stay identical to the
 * client's — if lib/sales.ts changes, this needs to change with it.
 */
function total(items: MoneyItem[]): number {
  let sum = 0;
  for (const item of items) {
    const gross = item.quantity * item.unitPrice;
    const discounted = Math.max(0, gross - gross * (item.discount / 100));
    const tax = discounted * (item.taxRate / 100);
    sum += discounted + tax;
  }
  return sum;
}

function isOrderActive(status: string): boolean {
  return status !== "cancelled";
}

function isOrderConfirmedOrBeyond(status: string): boolean {
  return status !== "pending" && status !== "cancelled";
}

const RANGE_LABELS: Record<DashboardRange, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  "12m": "Last 12 months",
  custom: "Custom range",
};

function resolvePeriod(query: DashboardQuery): {
  periodStart: number;
  periodEnd: number;
  granularity: "day" | "week" | "month";
} {
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  if (query.range === "custom" && query.start && query.end) {
    const span = query.end - query.start;
    const granularity = span <= 45 * DAY ? "day" : span <= 180 * DAY ? "week" : "month";
    return { periodStart: query.start, periodEnd: query.end, granularity };
  }

  switch (query.range) {
    case "7d":
      return { periodStart: now - 7 * DAY, periodEnd: now, granularity: "day" };
    case "90d":
      return { periodStart: now - 90 * DAY, periodEnd: now, granularity: "week" };
    case "12m":
      return { periodStart: now - 365 * DAY, periodEnd: now, granularity: "month" };
    case "30d":
    default:
      return { periodStart: now - 30 * DAY, periodEnd: now, granularity: "day" };
  }
}

function periodKey(date: Date, granularity: "day" | "week" | "month"): string {
  if (granularity === "month") {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }
  if (granularity === "week") {
    // ISO-ish week bucket: Monday of that week, as yyyy-mm-dd.
    const d = new Date(date);
    const day = (d.getDay() + 6) % 7; // Mon = 0
    d.setDate(d.getDate() - day);
    return d.toISOString().slice(0, 10);
  }
  return date.toISOString().slice(0, 10);
}

export async function buildSalesDashboard(
  query: DashboardQuery,
): Promise<SalesDashboardResponse> {
  await connectToDatabase();

  const { periodStart, periodEnd, granularity } = resolvePeriod(query);

  // Fetch full collections and filter/join in memory. Admin sales data for
  // a single-tenant B2B/storefront operation is small (thousands, not
  // millions, of documents) so this keeps the money logic in one readable
  // place instead of duplicating it across Mongo aggregation pipelines. If
  // this ever needs to scale further, the accounting policy above should
  // move into $facet/$group stages, but the definitions must not change.
  const [quotations, orders, invoices, storeOrders] = await Promise.all([
    QuotationModel.find({}).lean<IQuotation[]>(),
    OrderModel.find({}).lean<IOrder[]>(),
    InvoiceModel.find({}).lean<IInvoice[]>(),
    StoreOrderModel.find({}).lean<IStoreOrder[]>(),
  ]);

  const invoiceById = new Map(invoices.map((inv) => [String(inv._id), inv]));

  const inRange = (d: Date | number) => {
    const t = d instanceof Date ? d.getTime() : d;
    return t >= periodStart && t <= periodEnd;
  };

  const quotationsInRange = quotations.filter((q) => inRange(q.issueDate));
  const ordersInRange = orders.filter((o) => inRange(o.createdAt));
  const invoicesInRange = invoices.filter((inv) => inRange(inv.issueDate));
  const storeOrdersInRange = storeOrders.filter((so) => inRange(so.createdAt));

  // ---------- KPI cards ----------

  const confirmedOrderValue = ordersInRange
    .filter((o) => isOrderConfirmedOrBeyond(o.status))
    .reduce((sum, o) => sum + total(o.items), 0);
  const confirmedStoreOrderValue = storeOrdersInRange
    .filter((so) => isOrderConfirmedOrBeyond(so.status))
    .reduce((sum, so) => sum + so.total, 0);
  const confirmedSalesCount =
    ordersInRange.filter((o) => isOrderConfirmedOrBeyond(o.status)).length +
    storeOrdersInRange.filter((so) => isOrderConfirmedOrBeyond(so.status)).length;

  const issuedInvoices = invoicesInRange.filter(
    (inv) => inv.status !== "draft" && inv.status !== "cancelled",
  );
  const invoicedValue = issuedInvoices.reduce((sum, inv) => sum + total(inv.items), 0);

  const cashFromInvoices = invoices
    .filter((inv) => inRange(inv.issueDate) && inv.status !== "cancelled")
    .reduce((sum, inv) => sum + inv.amountPaid, 0);
  const cashFromStoreOrders = storeOrdersInRange
    .filter((so) => so.paymentStatus === "paid")
    .reduce((sum, so) => sum + so.total, 0);
  const cashCollectedValue = cashFromInvoices + cashFromStoreOrders;
  const cashCollectedCount =
    invoices.filter((inv) => inRange(inv.issueDate) && inv.status !== "cancelled" && inv.amountPaid > 0)
      .length + storeOrdersInRange.filter((so) => so.paymentStatus === "paid").length;

  const outstandingFromInvoices = issuedInvoices
    .filter((inv) => inv.status !== "paid")
    .reduce((sum, inv) => sum + Math.max(0, total(inv.items) - inv.amountPaid), 0);
  const outstandingFromStoreOrders = storeOrdersInRange
    .filter((so) => so.paymentStatus === "pending" && so.status !== "cancelled")
    .reduce((sum, so) => sum + so.total, 0);
  const outstandingValue = outstandingFromInvoices + outstandingFromStoreOrders;
  const outstandingCount =
    issuedInvoices.filter(
      (inv) => inv.status !== "paid" && total(inv.items) - inv.amountPaid > 0,
    ).length +
    storeOrdersInRange.filter((so) => so.paymentStatus === "pending" && so.status !== "cancelled")
      .length;

  const b2bRevenueRecognized = ordersInRange.filter((o) => {
    if (o.status !== "delivered" || !o.invoiceId) return false;
    const inv = invoiceById.get(String(o.invoiceId));
    return inv?.status === "paid";
  });
  const b2bRevenueRecognizedValue = b2bRevenueRecognized.reduce(
    (sum, o) => sum + total(o.items),
    0,
  );
  const storeRevenueRecognized = storeOrdersInRange.filter(
    (so) => so.status === "delivered" && so.paymentStatus === "paid",
  );
  const storeRevenueRecognizedValue = storeRevenueRecognized.reduce(
    (sum, so) => sum + so.total,
    0,
  );
  const revenueRecognizedValue = b2bRevenueRecognizedValue + storeRevenueRecognizedValue;
  const revenueRecognizedCount = b2bRevenueRecognized.length + storeRevenueRecognized.length;

  // ---------- B2B sales pipeline (quotation -> revenue) ----------

  const acceptedQuotations = quotationsInRange.filter((q) => q.status === "accepted");
  const activeOrders = ordersInRange.filter((o) => isOrderActive(o.status));
  const paidInvoicesInRange = issuedInvoices.filter((inv) => inv.status === "paid");
  const deliveredOrders = ordersInRange.filter((o) => o.status === "delivered");

  const stageCount = (n: number, of: number) =>
    of > 0 ? Math.round((n / of) * 1000) / 10 : undefined;

  const pipeline: PipelineStage[] = [
    {
      key: "quotations",
      label: "Quotations",
      count: quotationsInRange.length,
      value: quotationsInRange.reduce((sum, q) => sum + total(q.items), 0),
    },
    {
      key: "accepted",
      label: "Accepted",
      count: acceptedQuotations.length,
      value: acceptedQuotations.reduce((sum, q) => sum + total(q.items), 0),
      conversionRate: stageCount(acceptedQuotations.length, quotationsInRange.length),
    },
    {
      key: "orders",
      label: "Sales Orders",
      count: activeOrders.length,
      value: activeOrders.reduce((sum, o) => sum + total(o.items), 0),
      conversionRate: stageCount(activeOrders.length, acceptedQuotations.length),
    },
    {
      key: "invoiced",
      label: "Invoiced",
      count: issuedInvoices.length,
      value: invoicedValue,
      conversionRate: stageCount(issuedInvoices.length, activeOrders.length),
    },
    {
      key: "paid",
      label: "Paid",
      count: paidInvoicesInRange.length,
      value: paidInvoicesInRange.reduce((sum, inv) => sum + total(inv.items), 0),
      conversionRate: stageCount(paidInvoicesInRange.length, issuedInvoices.length),
    },
    {
      key: "delivered",
      label: "Delivered",
      count: deliveredOrders.length,
      value: deliveredOrders.reduce((sum, o) => sum + total(o.items), 0),
      conversionRate: stageCount(deliveredOrders.length, activeOrders.length),
    },
    {
      key: "revenueRecognized",
      label: "Revenue Recognized",
      count: b2bRevenueRecognized.length,
      value: b2bRevenueRecognizedValue,
      conversionRate: stageCount(b2bRevenueRecognized.length, deliveredOrders.length),
    },
  ];

  // ---------- Time series (confirmed sales / invoiced / cash / recognized) ----------

  const seriesMap = new Map<string, SeriesPoint>();
  const bump = (
    key: string,
    field: keyof Omit<SeriesPoint, "period">,
    amount: number,
  ) => {
    const existing = seriesMap.get(key) ?? {
      period: key,
      confirmedSales: 0,
      invoiced: 0,
      cashCollected: 0,
      revenueRecognized: 0,
    };
    existing[field] += amount;
    seriesMap.set(key, existing);
  };

  for (const o of ordersInRange) {
    if (!isOrderConfirmedOrBeyond(o.status)) continue;
    bump(periodKey(new Date(o.createdAt), granularity), "confirmedSales", total(o.items));
  }
  for (const so of storeOrdersInRange) {
    if (!isOrderConfirmedOrBeyond(so.status)) continue;
    bump(periodKey(new Date(so.createdAt), granularity), "confirmedSales", so.total);
  }
  for (const inv of issuedInvoices) {
    bump(periodKey(new Date(inv.issueDate), granularity), "invoiced", total(inv.items));
  }
  for (const inv of invoices) {
    if (!inRange(inv.issueDate) || inv.status === "cancelled" || inv.amountPaid <= 0) continue;
    bump(periodKey(new Date(inv.issueDate), granularity), "cashCollected", inv.amountPaid);
  }
  for (const so of storeOrdersInRange) {
    if (so.paymentStatus !== "paid") continue;
    bump(periodKey(new Date(so.createdAt), granularity), "cashCollected", so.total);
  }
  for (const o of b2bRevenueRecognized) {
    bump(periodKey(new Date(o.createdAt), granularity), "revenueRecognized", total(o.items));
  }
  for (const so of storeRevenueRecognized) {
    bump(periodKey(new Date(so.createdAt), granularity), "revenueRecognized", so.total);
  }

  const series = Array.from(seriesMap.values()).sort((a, b) => (a.period < b.period ? -1 : 1));

  // ---------- Orders by source ----------

  const websiteCount = storeOrdersInRange.length;
  const websiteValue = storeOrdersInRange.reduce((sum, so) => sum + so.total, 0);
  const quotationSourced = ordersInRange.filter((o) => o.quotationId);
  const adminSourced = ordersInRange.filter((o) => !o.quotationId);

  const ordersBySource: OrderSourceBreakdown[] = [
    { source: "website", label: "Website", count: websiteCount, value: websiteValue },
    {
      source: "quotation",
      label: "Quotation / B2B",
      count: quotationSourced.length,
      value: quotationSourced.reduce((sum, o) => sum + total(o.items), 0),
    },
    {
      source: "admin",
      label: "Admin (manual)",
      count: adminSourced.length,
      value: adminSourced.reduce((sum, o) => sum + total(o.items), 0),
    },
    {
      source: "whatsapp",
      label: "WhatsApp",
      count: 0,
      value: 0,
      pendingImplementation: true,
    },
  ];

  // ---------- Orders by status (storefront + B2B combined) ----------

  const statusCounts = new Map<string, number>();
  for (const o of ordersInRange) statusCounts.set(o.status, (statusCounts.get(o.status) ?? 0) + 1);
  for (const so of storeOrdersInRange)
    statusCounts.set(so.status, (statusCounts.get(so.status) ?? 0) + 1);

  const STATUS_ORDER = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
  const ordersByStatus: OrderStatusBreakdown[] = STATUS_ORDER.map((status) => ({
    status,
    label: status.charAt(0).toUpperCase() + status.slice(1),
    count: statusCounts.get(status) ?? 0,
  }));

  // ---------- Outstanding aging ----------

  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  const agingBuckets: AgingBucket[] = [
    { label: "Current", value: 0, count: 0 },
    { label: "1-30 days", value: 0, count: 0 },
    { label: "31-60 days", value: 0, count: 0 },
    { label: "61-90 days", value: 0, count: 0 },
    { label: "90+ days", value: 0, count: 0 },
  ];
  for (const inv of invoices) {
    if (inv.status === "draft" || inv.status === "cancelled" || inv.status === "paid") continue;
    const balance = total(inv.items) - inv.amountPaid;
    if (balance <= 0) continue;
    const daysPastDue = Math.floor((now - new Date(inv.dueDate).getTime()) / DAY);
    const bucket =
      daysPastDue <= 0
        ? agingBuckets[0]
        : daysPastDue <= 30
          ? agingBuckets[1]
          : daysPastDue <= 60
            ? agingBuckets[2]
            : daysPastDue <= 90
              ? agingBuckets[3]
              : agingBuckets[4];
    bucket.value += balance;
    bucket.count += 1;
  }

  // ---------- Payment methods (storefront only — see caveat) ----------

  const methodTotals = new Map<string, { value: number; count: number }>();
  for (const so of storeOrdersInRange) {
    if (so.paymentStatus !== "paid") continue;
    const entry = methodTotals.get(so.paymentMethod) ?? { value: 0, count: 0 };
    entry.value += so.total;
    entry.count += 1;
    methodTotals.set(so.paymentMethod, entry);
  }
  const METHOD_LABELS: Record<string, string> = { mpesa: "M-Pesa", cod: "Cash on Delivery" };
  const paymentMethods: PaymentMethodBreakdown[] = Array.from(methodTotals.entries()).map(
    ([method, { value, count }]) => ({
      method,
      label: METHOD_LABELS[method] ?? method,
      value,
      count,
    }),
  );

  // ---------- Top products (from recognized-revenue orders only) ----------

  const productTotals = new Map<string, { quantity: number; revenue: number }>();
  const addItems = (items: (MoneyItem & { name: string })[]) => {
    for (const item of items) {
      const entry = productTotals.get(item.name) ?? { quantity: 0, revenue: 0 };
      entry.quantity += item.quantity;
      entry.revenue += total([item]);
      productTotals.set(item.name, entry);
    }
  };
  for (const o of b2bRevenueRecognized) addItems(o.items);
  for (const so of storeRevenueRecognized) {
    for (const item of so.items) {
      const entry = productTotals.get(item.name) ?? { quantity: 0, revenue: 0 };
      entry.quantity += item.quantity;
      entry.revenue += item.subtotal;
      productTotals.set(item.name, entry);
    }
  }
  const topProducts: TopProduct[] = Array.from(productTotals.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return {
    range: query.range,
    periodStart,
    periodEnd,
    granularity,
    kpis: {
      confirmedSales: { value: confirmedOrderValue + confirmedStoreOrderValue, count: confirmedSalesCount },
      invoiced: { value: invoicedValue, count: issuedInvoices.length },
      cashCollected: { value: cashCollectedValue, count: cashCollectedCount },
      outstanding: { value: outstandingValue, count: outstandingCount },
      revenueRecognized: { value: revenueRecognizedValue, count: revenueRecognizedCount },
    },
    pipeline,
    series,
    ordersBySource,
    ordersByStatus,
    outstandingAging: agingBuckets,
    paymentMethods,
    paymentMethodsCaveat:
      "B2B invoice payments don't yet record a payment method (no separate Payment ledger) — this chart currently reflects storefront M-Pesa/COD payments only.",
    topProducts,
    generatedAt: now,
  };
}

export function rangeLabel(range: DashboardRange): string {
  return RANGE_LABELS[range];
}
