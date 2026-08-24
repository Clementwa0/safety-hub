/**
 * Integration tests for modules/invoicing/invoice.service.ts against a
 * real (in-memory) MongoDB replica set, since the behavior under test —
 * transactions, write-conflict retries, atomic balance checks — can't be
 * verified against a mock. Requires `mongodb-memory-server` (added to
 * devDependencies) and `mongoose`, so `pnpm install` must be run before
 * `pnpm test` picks these up. A replica set is required because
 * multi-document transactions aren't supported on a standalone mongod.
 */
import { after, afterEach, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

import { InvoiceModel } from "@/lib/models/Invoice";
import { PaymentModel } from "@/lib/models/Payment";
import {
  deleteDraftInvoice,
  recordPayment,
  voidPayment,
} from "@/modules/invoicing/invoice.service";

let replSet: MongoMemoryReplSet;

before(async () => {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(replSet.getUri(), { dbName: "invoicing-test" });
});

after(async () => {
  await mongoose.disconnect();
  await replSet.stop();
});

afterEach(async () => {
  await InvoiceModel.deleteMany({});
  await PaymentModel.deleteMany({});
});

/** KES 100,000 invoice (1 line, no tax/discount) in a given starting status. */
async function makeInvoice(status: "draft" | "unpaid" | "cancelled" = "unpaid", amountPaid = 0) {
  return InvoiceModel.create({
    number: `INV-TEST-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    customer: new mongoose.Types.ObjectId(),
    items: [{ name: "Consulting", quantity: 1, unitPrice: 100_000, taxRate: 0, discount: 0 }],
    status,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    amountPaid,
  });
}

describe("recordPayment", () => {
  it("records a valid partial payment and updates the invoice", async () => {
    const invoice = await makeInvoice();
    const { payment, invoice: updated } = await recordPayment(
      String(invoice._id),
      { amount: 40_000, method: "cash" },
      "Jane Staff",
    );

    assert.equal(payment.amount, 40_000);
    assert.equal(payment.status, "recorded");
    assert.equal(updated.amountPaid, 40_000);
    assert.equal(updated.status, "partially_paid");
  });

  it("marks the invoice paid on an exact full payment", async () => {
    const invoice = await makeInvoice();
    const { invoice: updated } = await recordPayment(String(invoice._id), { amount: 100_000, method: "mpesa" }, "A");
    assert.equal(updated.status, "paid");
    assert.equal(updated.amountPaid, 100_000);
  });

  it("accumulates multiple payments correctly", async () => {
    const invoice = await makeInvoice();
    await recordPayment(String(invoice._id), { amount: 30_000, method: "cash" }, "A");
    await recordPayment(String(invoice._id), { amount: 30_000, method: "cash" }, "A");
    const { invoice: updated } = await recordPayment(String(invoice._id), { amount: 40_000, method: "cash" }, "A");

    assert.equal(updated.amountPaid, 100_000);
    assert.equal(updated.status, "paid");
    assert.equal(await PaymentModel.countDocuments({ invoiceId: invoice._id }), 3);
  });

  it("rejects a payment that exceeds the outstanding balance and creates no Payment row", async () => {
    const invoice = await makeInvoice("unpaid", 90_000);
    await assert.rejects(
      recordPayment(String(invoice._id), { amount: 20_000, method: "cash" }, "A"),
      /__OVERPAYMENT__/,
    );
    assert.equal(await PaymentModel.countDocuments({ invoiceId: invoice._id }), 0);
    const reloaded = await InvoiceModel.findById(invoice._id);
    assert.equal(reloaded?.amountPaid, 90_000);
  });

  it("rejects payment on a draft invoice", async () => {
    const invoice = await makeInvoice("draft");
    await assert.rejects(
      recordPayment(String(invoice._id), { amount: 1000, method: "cash" }, "A"),
      /__INVALID_STATE__/,
    );
  });

  it("rejects payment on a cancelled invoice", async () => {
    const invoice = await makeInvoice("cancelled");
    await assert.rejects(
      recordPayment(String(invoice._id), { amount: 1000, method: "cash" }, "A"),
      /__INVALID_STATE__/,
    );
  });

  it("never lets the ledger exceed the invoice total under concurrent requests", async () => {
    // The scenario from the brief: KES 100,000 invoice, two simultaneous
    // KES 70,000 payment requests. At most one may succeed.
    const invoice = await makeInvoice("unpaid", 0);

    const results = await Promise.allSettled([
      recordPayment(String(invoice._id), { amount: 70_000, method: "cash" }, "A"),
      recordPayment(String(invoice._id), { amount: 70_000, method: "mpesa" }, "B"),
    ]);

    const succeeded = results.filter((r) => r.status === "fulfilled");
    const failed = results.filter((r) => r.status === "rejected");

    assert.equal(succeeded.length, 1, "exactly one of the two concurrent payments should succeed");
    assert.equal(failed.length, 1);

    const finalInvoice = await InvoiceModel.findById(invoice._id);
    assert.ok(finalInvoice);
    assert.ok(
      finalInvoice!.amountPaid <= 100_000,
      `ledger must never exceed the invoice total (was ${finalInvoice!.amountPaid})`,
    );
    assert.equal(finalInvoice!.amountPaid, 70_000);
    assert.equal(await PaymentModel.countDocuments({ invoiceId: invoice._id }), 1);
  });
});

describe("voidPayment", () => {
  it("voids a payment, recalculates amountPaid, and drops status back down", async () => {
    const invoice = await makeInvoice();
    const { payment } = await recordPayment(String(invoice._id), { amount: 100_000, method: "cash" }, "A");

    let reloaded = await InvoiceModel.findById(invoice._id);
    assert.equal(reloaded?.status, "paid");

    const { payment: voided, invoice: afterVoid } = await voidPayment(
      String(invoice._id),
      String(payment._id),
      "Manager",
      "Recorded in error",
    );

    assert.equal(voided.status, "voided");
    assert.ok(voided.voidedAt);
    assert.equal(voided.voidedBy, "Manager");
    assert.equal(afterVoid.amountPaid, 0);
    assert.equal(afterVoid.status, "unpaid");

    reloaded = await InvoiceModel.findById(invoice._id);
    assert.equal(reloaded?.amountPaid, 0);
    assert.equal(reloaded?.status, "unpaid");
  });

  it("recalculates from the remaining active ledger, not simple subtraction", async () => {
    const invoice = await makeInvoice();
    await recordPayment(String(invoice._id), { amount: 30_000, method: "cash" }, "A");
    const { payment: second } = await recordPayment(String(invoice._id), { amount: 40_000, method: "cash" }, "A");

    const { invoice: afterVoid } = await voidPayment(String(invoice._id), String(second._id), "A", undefined);

    assert.equal(afterVoid.amountPaid, 30_000);
    assert.equal(afterVoid.status, "partially_paid");
  });

  it("rejects voiding an already-voided payment", async () => {
    const invoice = await makeInvoice();
    const { payment } = await recordPayment(String(invoice._id), { amount: 10_000, method: "cash" }, "A");
    await voidPayment(String(invoice._id), String(payment._id), "A", undefined);

    await assert.rejects(
      voidPayment(String(invoice._id), String(payment._id), "A", undefined),
      /__ALREADY_VOIDED__/,
    );
  });

  it("leaves a cancelled invoice's status alone after voiding a payment", async () => {
    const invoice = await makeInvoice("unpaid", 0);
    const { payment } = await recordPayment(String(invoice._id), { amount: 50_000, method: "cash" }, "A");

    const loaded = await InvoiceModel.findById(invoice._id);
    loaded!.status = "cancelled";
    await loaded!.save();

    const { invoice: afterVoid } = await voidPayment(String(invoice._id), String(payment._id), "A", undefined);
    assert.equal(afterVoid.status, "cancelled");
    assert.equal(afterVoid.amountPaid, 0);
  });
});

describe("deleteDraftInvoice", () => {
  it("deletes a draft invoice with no payments", async () => {
    const invoice = await makeInvoice("draft");
    await deleteDraftInvoice(String(invoice._id));
    assert.equal(await InvoiceModel.findById(invoice._id), null);
  });

  it("refuses to delete an issued (non-draft) invoice", async () => {
    const invoice = await makeInvoice("unpaid");
    await assert.rejects(deleteDraftInvoice(String(invoice._id)), /__ISSUED__/);
    assert.ok(await InvoiceModel.findById(invoice._id));
  });

  it("refuses to delete a draft invoice that somehow has payment rows (defensive)", async () => {
    const invoice = await makeInvoice("draft");
    // Bypasses the normal API guard (drafts can't take payments) to
    // simulate stray/migrated data and confirm the defensive check holds.
    await PaymentModel.create({ invoiceId: invoice._id, amount: 100, method: "cash", status: "recorded" });

    await assert.rejects(deleteDraftInvoice(String(invoice._id)), /__HAS_PAYMENTS__/);
    assert.ok(await InvoiceModel.findById(invoice._id));
  });

  it("rejects deleting an invoice that doesn't exist", async () => {
    await assert.rejects(
      deleteDraftInvoice(String(new mongoose.Types.ObjectId())),
      /__NOT_FOUND__/,
    );
  });
});
