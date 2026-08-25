/**
 * Tests for modules/analytics/sales-dashboard.ts, focused on the bug this
 * change fixes: cash-flow figures (the "Cash Collected" KPI, its time
 * series, aging, and outstanding balances) must be driven by the actual
 * `Payment.date` an active (non-voided) payment was recorded on — never
 * by `Invoice.issueDate` or the invoice's cached `amountPaid` — and must
 * stay consistent with each other and with the centralized balance math
 * in modules/invoicing/calculations.ts.
 *
 * Runs against a real (in-memory) standalone MongoDB, since
 * buildSalesDashboard only reads (no transactions needed, unlike
 * modules/invoicing/invoice.service.ts's tests which need a replica
 * set).
 */
import { after, afterEach, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { connectToDatabase } from "@/lib/db";
import { InvoiceModel, type IInvoiceLineItem } from "@/lib/models/Invoice";
import { PaymentModel } from "@/lib/models/Payment";
import { QuotationModel } from "@/lib/models/Quotation";
import { OrderModel } from "@/lib/models/Order";
import { StoreOrderModel } from "@/lib/models/StoreOrder";
import { buildSalesDashboard } from "@/modules/analytics/sales-dashboard";
import type { SeriesPoint } from "@/types/sentinel/sales-dashboard";

let mongod: MongoMemoryServer;

before(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
  await connectToDatabase();
});

after(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  await InvoiceModel.deleteMany({});
  await PaymentModel.deleteMany({});
  await QuotationModel.deleteMany({});
  await OrderModel.deleteMany({});
  await StoreOrderModel.deleteMany({});
});

const oneItem = (unitPrice: number): IInvoiceLineItem[] => [
  { name: "Item", quantity: 1, unitPrice, taxRate: 0, discount: 0 },
];

let invoiceCounter = 0;
async function createInvoice(overrides: {
  total: number;
  amountPaid: number;
  status: "draft" | "unpaid" | "partially_paid" | "paid" | "overdue" | "cancelled";
  issueDate: Date;
  dueDate?: Date;
}) {
  invoiceCounter += 1;
  return InvoiceModel.create({
    number: `INV-DASH-${invoiceCounter}`,
    customer: new mongoose.Types.ObjectId(),
    items: oneItem(overrides.total),
    status: overrides.status,
    issueDate: overrides.issueDate,
    dueDate: overrides.dueDate ?? new Date(overrides.issueDate.getTime() + 7 * 24 * 60 * 60 * 1000),
    amountPaid: overrides.amountPaid,
  });
}

async function createPayment(overrides: {
  invoiceId: mongoose.Types.ObjectId | string;
  amount: number;
  date: Date;
  status?: "recorded" | "voided";
  method?: "cash" | "mpesa";
}) {
  return PaymentModel.create({
    invoiceId: overrides.invoiceId,
    amount: overrides.amount,
    method: overrides.method ?? "cash",
    date: overrides.date,
    status: overrides.status ?? "recorded",
  });
}

// A fixed, deterministic February 2026 window (28 days -> "day" granularity).
const FEB_START = Date.UTC(2026, 1, 1, 0, 0, 0);
const FEB_END = Date.UTC(2026, 1, 28, 23, 59, 59);

function pointAt(series: SeriesPoint[], period: string): SeriesPoint | undefined {
  return series.find((p) => p.period === period);
}

describe("buildSalesDashboard - cash-flow reporting uses payment date", () => {
  it("counts a payment collected in-range even when its invoice was issued outside the range", async () => {
    // Invoice issued in January (outside the Feb window) but paid in
    // February. Old behavior kept this out entirely because it gated
    // on `inRange(invoice.issueDate)`.
    const invoice = await createInvoice({
      total: 10_000,
      amountPaid: 10_000,
      status: "paid",
      issueDate: new Date(Date.UTC(2026, 0, 15, 12)),
    });
    await createPayment({ invoiceId: invoice._id, amount: 10_000, date: new Date(Date.UTC(2026, 1, 10, 12)) });

    const dashboard = await buildSalesDashboard({ range: "custom", start: FEB_START, end: FEB_END });

    assert.equal(dashboard.kpis.cashCollected.value, 10_000);
    assert.equal(pointAt(dashboard.series, "2026-02-10")?.cashCollected, 10_000);
  });

  it("excludes an invoice's amountPaid from the range when the payment itself fell outside it", async () => {
    // Invoice issued in February (in range) but paid in March. The
    // dashboard covers Feb only, so this cash should NOT show up in
    // Feb - previously the buggy code bucketed the whole cumulative
    // amountPaid onto the invoice's Feb issueDate regardless of when
    // the payment actually landed.
    const invoice = await createInvoice({
      total: 20_000,
      amountPaid: 20_000,
      status: "paid",
      issueDate: new Date(Date.UTC(2026, 1, 5, 12)),
    });
    await createPayment({ invoiceId: invoice._id, amount: 20_000, date: new Date(Date.UTC(2026, 2, 5, 12)) });

    const dashboard = await buildSalesDashboard({ range: "custom", start: FEB_START, end: FEB_END });

    assert.equal(dashboard.kpis.cashCollected.value, 0);
    // The invoice still shows up in the "invoiced" series (issued in
    // Feb), but its cashCollected for that same bucket must be zero.
    const invoicedPoint = pointAt(dashboard.series, "2026-02-05");
    assert.equal(invoicedPoint?.invoiced, 20_000);
    assert.equal(invoicedPoint?.cashCollected ?? 0, 0);
  });

  it("attributes multiple partial payments to the periods they were each actually collected in", async () => {
    const invoice = await createInvoice({
      total: 10_000,
      amountPaid: 10_000,
      status: "paid",
      issueDate: new Date(Date.UTC(2026, 1, 1, 12)),
    });
    await createPayment({ invoiceId: invoice._id, amount: 5_000, date: new Date(Date.UTC(2026, 1, 3, 12)) });
    await createPayment({ invoiceId: invoice._id, amount: 5_000, date: new Date(Date.UTC(2026, 1, 20, 12)) });

    const dashboard = await buildSalesDashboard({ range: "custom", start: FEB_START, end: FEB_END });

    assert.equal(pointAt(dashboard.series, "2026-02-03")?.cashCollected, 5_000);
    assert.equal(pointAt(dashboard.series, "2026-02-20")?.cashCollected, 5_000);
    assert.equal(dashboard.kpis.cashCollected.value, 10_000);
  });

  it("never counts a voided payment as cash collected", async () => {
    const invoice = await createInvoice({
      total: 10_000,
      amountPaid: 0,
      status: "unpaid",
      issueDate: new Date(Date.UTC(2026, 1, 1, 12)),
    });
    await createPayment({
      invoiceId: invoice._id,
      amount: 8_000,
      date: new Date(Date.UTC(2026, 1, 10, 12)),
      status: "voided",
    });

    const dashboard = await buildSalesDashboard({ range: "custom", start: FEB_START, end: FEB_END });

    assert.equal(dashboard.kpis.cashCollected.value, 0);
    assert.equal(pointAt(dashboard.series, "2026-02-10")?.cashCollected ?? 0, 0);
    // Nor in the payment-method breakdown, which pulls from the same
    // active/in-range payment set.
    assert.equal(
      dashboard.paymentMethods.reduce((sum, m) => sum + m.value, 0),
      0,
    );
  });

  it("excludes payments recorded against a cancelled invoice", async () => {
    const invoice = await createInvoice({
      total: 10_000,
      amountPaid: 5_000,
      status: "cancelled",
      issueDate: new Date(Date.UTC(2026, 1, 1, 12)),
    });
    await createPayment({ invoiceId: invoice._id, amount: 5_000, date: new Date(Date.UTC(2026, 1, 15, 12)) });

    const dashboard = await buildSalesDashboard({ range: "custom", start: FEB_START, end: FEB_END });

    assert.equal(dashboard.kpis.cashCollected.value, 0);
    assert.equal(pointAt(dashboard.series, "2026-02-15")?.cashCollected ?? 0, 0);
  });

  it("keeps the cashCollected KPI equal to the sum of the series' cashCollected points", async () => {
    const invoiceA = await createInvoice({
      total: 10_000,
      amountPaid: 10_000,
      status: "paid",
      issueDate: new Date(Date.UTC(2026, 0, 15, 12)),
    });
    await createPayment({ invoiceId: invoiceA._id, amount: 10_000, date: new Date(Date.UTC(2026, 1, 10, 12)) });

    const invoiceB = await createInvoice({
      total: 10_000,
      amountPaid: 10_000,
      status: "paid",
      issueDate: new Date(Date.UTC(2026, 1, 1, 12)),
    });
    await createPayment({ invoiceId: invoiceB._id, amount: 4_000, date: new Date(Date.UTC(2026, 1, 3, 12)) });
    await createPayment({ invoiceId: invoiceB._id, amount: 6_000, date: new Date(Date.UTC(2026, 1, 20, 12)) });

    const dashboard = await buildSalesDashboard({ range: "custom", start: FEB_START, end: FEB_END });

    const seriesTotal = dashboard.series.reduce((sum, p) => sum + p.cashCollected, 0);
    assert.equal(seriesTotal, dashboard.kpis.cashCollected.value);
    assert.equal(dashboard.kpis.cashCollected.value, 20_000);
  });
});

describe("buildSalesDashboard - Revenue Recognized values the paid invoice, not the order snapshot", () => {
  it("uses the invoice's (possibly edited) items, not the order's original items, once delivered and paid", async () => {
    // The order was placed at 10,000, but the invoice was later
    // discounted down to 8,000 before being paid in full - a legitimate
    // independent edit (see PATCH /api/invoices/[id]). Revenue
    // Recognized must reflect the 8,000 actually billed and paid, not
    // the order's stale 10,000 snapshot.
    const invoice = await createInvoice({
      total: 8_000,
      amountPaid: 8_000,
      status: "paid",
      issueDate: new Date(Date.UTC(2026, 1, 1, 12)),
    });
    await createPayment({ invoiceId: invoice._id, amount: 8_000, date: new Date(Date.UTC(2026, 1, 2, 12)) });

    const order = await OrderModel.create({
      number: "ORD-DASH-1",
      customer: new mongoose.Types.ObjectId(),
      items: [{ name: "Item", quantity: 1, unitPrice: 10_000, taxRate: 0, discount: 0 }],
      status: "delivered",
      invoiceId: invoice._id,
      createdAt: new Date(Date.UTC(2026, 1, 1, 12)),
    });
    void order;

    const dashboard = await buildSalesDashboard({ range: "custom", start: FEB_START, end: FEB_END });

    assert.equal(dashboard.kpis.revenueRecognized.value, 8_000);
    const paidStage = dashboard.pipeline.find((s) => s.key === "paid");
    const recognizedStage = dashboard.pipeline.find((s) => s.key === "revenueRecognized");
    // The two stages describe the same underlying paid invoice, so once
    // everything eligible for "paid" is also delivered, they must agree.
    assert.equal(paidStage?.value, recognizedStage?.value);
  });

  it("still recognizes nothing for a delivered order whose invoice is only partially paid", async () => {
    const invoice = await createInvoice({
      total: 10_000,
      amountPaid: 4_000,
      status: "partially_paid",
      issueDate: new Date(Date.UTC(2026, 1, 1, 12)),
    });
    await createPayment({ invoiceId: invoice._id, amount: 4_000, date: new Date(Date.UTC(2026, 1, 2, 12)) });

    await OrderModel.create({
      number: "ORD-DASH-2",
      customer: new mongoose.Types.ObjectId(),
      items: [{ name: "Item", quantity: 1, unitPrice: 10_000, taxRate: 0, discount: 0 }],
      status: "delivered",
      invoiceId: invoice._id,
      createdAt: new Date(Date.UTC(2026, 1, 1, 12)),
    });

    const dashboard = await buildSalesDashboard({ range: "custom", start: FEB_START, end: FEB_END });

    assert.equal(dashboard.kpis.revenueRecognized.value, 0);
  });

  it("recognizes revenue in-range even when the order itself was created outside the range", async () => {
    // Order created in January (outside the Feb window) but delivered
    // and its invoice fully paid in February. Old behavior kept this
    // out entirely because it gated on `inRange(order.createdAt)`, the
    // same bug class already fixed for Cash Collected.
    const invoice = await createInvoice({
      total: 10_000,
      amountPaid: 10_000,
      status: "paid",
      issueDate: new Date(Date.UTC(2026, 0, 5, 12)),
    });
    await createPayment({ invoiceId: invoice._id, amount: 10_000, date: new Date(Date.UTC(2026, 1, 20, 12)) });

    await OrderModel.create({
      number: "ORD-DASH-3",
      customer: new mongoose.Types.ObjectId(),
      items: [{ name: "Item", quantity: 1, unitPrice: 10_000, taxRate: 0, discount: 0 }],
      status: "delivered",
      invoiceId: invoice._id,
      createdAt: new Date(Date.UTC(2026, 0, 1, 12)),
    });

    const dashboard = await buildSalesDashboard({ range: "custom", start: FEB_START, end: FEB_END });

    assert.equal(dashboard.kpis.revenueRecognized.value, 10_000);
    const seriesTotal = dashboard.series.reduce((sum, p) => sum + p.revenueRecognized, 0);
    assert.equal(seriesTotal, dashboard.kpis.revenueRecognized.value);
    // Bucketed on the payment date (Feb 20), not the order's January
    // createdAt.
    assert.equal(pointAt(dashboard.series, "2026-02-20")?.revenueRecognized, 10_000);
  });

  it("excludes revenue that was recognized outside the range, even if the order was created inside it", async () => {
    // Symmetric case: order created in Feb, but the invoice wasn't paid
    // off until March - should not count toward Feb's recognized revenue.
    const invoice = await createInvoice({
      total: 10_000,
      amountPaid: 10_000,
      status: "paid",
      issueDate: new Date(Date.UTC(2026, 1, 5, 12)),
    });
    await createPayment({ invoiceId: invoice._id, amount: 10_000, date: new Date(Date.UTC(2026, 2, 3, 12)) });

    await OrderModel.create({
      number: "ORD-DASH-4",
      customer: new mongoose.Types.ObjectId(),
      items: [{ name: "Item", quantity: 1, unitPrice: 10_000, taxRate: 0, discount: 0 }],
      status: "delivered",
      invoiceId: invoice._id,
      createdAt: new Date(Date.UTC(2026, 1, 6, 12)),
    });

    const dashboard = await buildSalesDashboard({ range: "custom", start: FEB_START, end: FEB_END });

    assert.equal(dashboard.kpis.revenueRecognized.value, 0);
  });
});

describe("buildSalesDashboard - balances use the centralized calculation", () => {
  it("computes outstanding value from calculateInvoiceBalance for a partially paid invoice", async () => {
    const invoice = await createInvoice({
      total: 15_000,
      amountPaid: 4_000,
      status: "partially_paid",
      issueDate: new Date(Date.UTC(2026, 1, 1, 12)),
      dueDate: new Date(Date.UTC(2026, 1, 10, 12)),
    });
    await createPayment({ invoiceId: invoice._id, amount: 4_000, date: new Date(Date.UTC(2026, 1, 2, 12)) });

    const dashboard = await buildSalesDashboard({ range: "custom", start: FEB_START, end: FEB_END });

    assert.equal(dashboard.kpis.outstanding.value, 11_000);
    assert.equal(dashboard.kpis.outstanding.count, 1);
  });

  it("floors an aging bucket's balance at zero and never goes negative even with rounding noise", async () => {
    // amountPaid slightly (sub-cent) over total should never produce a
    // negative aging balance - calculateInvoiceBalance floors at zero.
    const invoice = await createInvoice({
      total: 5_000,
      amountPaid: 5_000.004,
      status: "partially_paid",
      issueDate: new Date(Date.UTC(2026, 1, 1, 12)),
      dueDate: new Date(Date.UTC(2026, 1, 5, 12)),
    });
    void invoice;

    const dashboard = await buildSalesDashboard({ range: "custom", start: FEB_START, end: FEB_END });

    for (const bucket of dashboard.outstandingAging) {
      assert.ok(bucket.value >= 0);
    }
  });

  it("places an overdue balance in the correct aging bucket", async () => {
    const now = Date.now();
    const invoice = await createInvoice({
      total: 12_000,
      amountPaid: 2_000,
      status: "partially_paid",
      issueDate: new Date(now - 60 * 24 * 60 * 60 * 1000),
      dueDate: new Date(now - 45 * 24 * 60 * 60 * 1000), // 45 days past due -> "31-60 days"
    });
    await createPayment({ invoiceId: invoice._id, amount: 2_000, date: new Date(now - 50 * 24 * 60 * 60 * 1000) });

    const dashboard = await buildSalesDashboard({
      range: "custom",
      start: now - 90 * 24 * 60 * 60 * 1000,
      end: now,
    });

    const bucket = dashboard.outstandingAging[2]; // "31-60 days"
    assert.equal(bucket.count, 1);
    assert.equal(bucket.value, 10_000);
    for (const [i, other] of dashboard.outstandingAging.entries()) {
      if (i !== 2) assert.equal(other.count, 0);
    }
  });
});
