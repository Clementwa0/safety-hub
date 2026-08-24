import { connectToDatabase } from "@/lib/db";
import { QuotationModel, type IQuotation } from "@/lib/models/Quotation";
import { OrderModel, type IOrder } from "@/lib/models/Order";
import { InvoiceModel, type IInvoice } from "@/lib/models/Invoice";
import { StoreOrderModel, type IStoreOrder } from "@/lib/models/StoreOrder";
import { PaymentModel, type IPayment } from "@/lib/models/Payment";
import { calculateInvoiceBalance, calculateInvoiceTotals } from "@/modules/invoicing/calculations";
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
 *   is the sum of active (non-voided) `Payment` ledger rows whose own
 *   `date` — the date the cash was actually received, not the date the
 *   invoice was issued — falls in the selected range. This is NOT
 *   `invoice.amountPaid` (that field is the invoice's current
 *   cumulative total, and dating it by `invoice.issueDate` would book a
 *   payment collected in March against a January-issued invoice as
 *   January cash, and would collapse several payments spread across
 *   different periods onto a single date). A partially paid invoice
 *   contributes only the payments actually collected in range, not its
 *   full total and not zero. For the storefront it's the total of
 *   orders whose paymentStatus is "paid" (the storefront has no
 *   separate payment-date ledger, so order creation date is the closest
 *   available proxy).
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
 *  - There is no persistent WhatsApp request record, so the "WhatsApp"
 *    source bucket is always zero (flagged to the reader via
 *    pendingImplementation rather than silently shown as "no orders").
 *  - Order/StoreOrder status changes aren't timestamped individually,
 *    so "delivered" figures use the document's createdAt, not an actual
 *    delivery date.
 */

type MoneyItem = { quantity: number; unitPrice: number; taxRate: number; discount: number };

/**
 * Delegates to modules/invoicing/calculations.ts, the single source of
 * truth for this math - see that file's doc comment. This used to be a
 * hand-copied reimplementation of lib/sales.ts#computeTotals (kept
 * separate only because computeTotals was typed against the client-side
 * `LineItem` shape); calculateInvoiceTotals() is typed structurally
 * against MoneyItem instead, so both the persisted Mongoose documents
 * here and the client LineItem shape satisfy it without a cast.
 */
function total(items: MoneyItem[]): number {
  return calculateInvoiceTotals(items).total;
}

/** A payment that's been voided/refunded no longer counts as cash collected. */
function isActivePayment(payment: IPayment): boolean {
  return payment.status !== "voided";
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
  const [quotations, orders, invoices, storeOrders, payments] = await Promise.all([
    QuotationModel.find({}).lean<IQuotation[]>(),
    OrderModel.find({}).lean<IOrder[]>(),
    InvoiceModel.find({}).lean<IInvoice[]>(),
    StoreOrderModel.find({}).lean<IStoreOrder[]>(),
    PaymentModel.find({}).lean<IPayment[]>(),
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
  // Voided/refunded payments are excluded up front - every downstream use
  // of paymentsInRange is a money figure (cash collected, payment method
  // breakdown), and a voided payment no longer represents cash actually
  // held. See modules/invoicing/calculations.ts#sumActivePayments for the
  // equivalent rule applied to a single invoice's amountPaid.
  const paymentsInRange = payments.filter((p) => inRange(p.date) && isActivePayment(p));

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

  const cashFromInvoices = paymentsInRange
    .filter((p) => {
      const inv = invoiceById.get(String(p.invoiceId));
      return !inv || inv.status !== "cancelled";
    })
    .reduce((sum, p) => sum + p.amount, 0);
  const cashFromStoreOrders = storeOrdersInRange
    .filter((so) => so.paymentStatus === "paid")
    .reduce((sum, so) => sum + so.total, 0);
  const cashCollectedValue = cashFromInvoices + cashFromStoreOrders;
  const cashCollectedCount =
    paymentsInRange.filter((p) => {
      const inv = invoiceById.get(String(p.invoiceId));
      return !inv || inv.status !== "cancelled";
    }).length + storeOrdersInRange.filter((so) => so.paymentStatus === "paid").length;

  const outstandingFromInvoices = issuedInvoices
    .filter((inv) => inv.status !== "paid")
    .reduce((sum, inv) => sum + calculateInvoiceBalance(total(inv.items), inv.amountPaid), 0);
  const outstandingFromStoreOrders = storeOrdersInRange
    .filter((so) => so.paymentStatus === "pending" && so.status !== "cancelled")
    .reduce((sum, so) => sum + so.total, 0);
  const outstandingValue = outstandingFromInvoices + outstandingFromStoreOrders;
  const outstandingCount =
    issuedInvoices.filter(
      (inv) => inv.status !== "paid" && calculateInvoiceBalance(total(inv.items), inv.amountPaid) > 0,
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
  // Bucket by when the cash actually came in (payment.date), not when the
  // invoice was issued — an invoice issued in one period is often paid
  // (fully or partially, in one or several installments) in a later one.
  // `paymentsInRange` is already scoped to that window and to
  // non-voided/non-refunded payments (see its definition above), and using
  // the per-payment amount here — instead of the invoice's cumulative
  // `amountPaid` — is what correctly spreads multiple/partial payments
  // across the periods they were each actually collected in rather than
  // dumping the invoice's whole running total onto one date. This also
  // keeps the chart consistent with the `cashFromInvoices` KPI above,
  // which sums this same filtered set.
  for (const p of paymentsInRange) {
    const inv = invoiceById.get(String(p.invoiceId));
    if (inv && inv.status === "cancelled") continue;
    bump(periodKey(new Date(p.date), granularity), "cashCollected", p.amount);
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
    const balance = calculateInvoiceBalance(total(inv.items), inv.amountPaid);
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

  // ---------- Payment methods (storefront + B2B combined) ----------

  const methodTotals = new Map<string, { value: number; count: number }>();
  for (const so of storeOrdersInRange) {
    if (so.paymentStatus !== "paid") continue;
    const entry = methodTotals.get(so.paymentMethod) ?? { value: 0, count: 0 };
    entry.value += so.total;
    entry.count += 1;
    methodTotals.set(so.paymentMethod, entry);
  }
  for (const p of paymentsInRange) {
    const inv = invoiceById.get(String(p.invoiceId));
    if (inv && inv.status === "cancelled") continue;
    const entry = methodTotals.get(p.method) ?? { value: 0, count: 0 };
    entry.value += p.amount;
    entry.count += 1;
    methodTotals.set(p.method, entry);
  }
  const METHOD_LABELS: Record<string, string> = {
    mpesa: "M-Pesa",
    cod: "Cash on Delivery",
    cash: "Cash",
  };
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
    topProducts,
    generatedAt: now,
  };
}

export function rangeLabel(range: DashboardRange): string {
  return RANGE_LABELS[range];
}
