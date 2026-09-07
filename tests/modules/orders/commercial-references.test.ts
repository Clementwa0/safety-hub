/**
 * Tests for modules/orders/commercial-references.ts — the shared
 * existence + same-customer checks used whenever an Order or Invoice
 * takes on a quotationId/orderId/invoiceId reference (creation, or a
 * PATCH that sets one for the first time or changes the document's
 * customer). Runs against a real (in-memory) standalone MongoDB since
 * these functions only read.
 */
import { after, afterEach, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { connectToDatabase } from "@/lib/db";
import { QuotationModel } from "@/lib/models/Quotation";
import { OrderModel } from "@/lib/models/Order";
import { InvoiceModel } from "@/lib/models/Invoice";
import {
  assertInvoiceBelongsToCustomer,
  assertOrderBelongsToCustomer,
  assertQuotationBelongsToCustomer,
  CommercialReferenceError,
} from "@/modules/orders/commercial-references";

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
  await QuotationModel.deleteMany({});
  await OrderModel.deleteMany({});
  await InvoiceModel.deleteMany({});
});

const oneItem = [{ name: "Item", quantity: 1, unitPrice: 100, taxRate: 0, discount: 0 }];
let counter = 0;

async function createQuotation(customer: mongoose.Types.ObjectId) {
  counter += 1;
  return QuotationModel.create({
    number: `QUO-TEST-${counter}`,
    customer,
    items: oneItem,
    status: "accepted",
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
}

async function createOrder(customer: mongoose.Types.ObjectId) {
  counter += 1;
  return OrderModel.create({
    number: `ORD-TEST-${counter}`,
    customer,
    items: oneItem,
    status: "pending",
  });
}

async function createInvoice(customer: mongoose.Types.ObjectId) {
  counter += 1;
  return InvoiceModel.create({
    number: `INV-TEST-${counter}`,
    customer,
    items: oneItem,
    status: "draft",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
}

describe("assertQuotationBelongsToCustomer", () => {
  it("resolves when the quotation exists and matches the customer", async () => {
    const customer = new mongoose.Types.ObjectId();
    const quotation = await createQuotation(customer);
    await assert.doesNotReject(
      assertQuotationBelongsToCustomer(String(quotation._id), customer),
    );
  });

  it("rejects with 404 when the quotation does not exist", async () => {
    await assert.rejects(
      assertQuotationBelongsToCustomer(String(new mongoose.Types.ObjectId()), new mongoose.Types.ObjectId()),
      (error: unknown) => {
        assert.ok(error instanceof CommercialReferenceError);
        assert.equal(error.status, 404);
        return true;
      },
    );
  });

  it("rejects with 400 for a malformed id", async () => {
    await assert.rejects(
      assertQuotationBelongsToCustomer("not-an-id", new mongoose.Types.ObjectId()),
      (error: unknown) => {
        assert.ok(error instanceof CommercialReferenceError);
        assert.equal(error.status, 400);
        return true;
      },
    );
  });

  it("rejects with 409 when the quotation belongs to a different customer", async () => {
    const quotation = await createQuotation(new mongoose.Types.ObjectId());
    await assert.rejects(
      assertQuotationBelongsToCustomer(String(quotation._id), new mongoose.Types.ObjectId()),
      (error: unknown) => {
        assert.ok(error instanceof CommercialReferenceError);
        assert.equal(error.status, 409);
        return true;
      },
    );
  });
});

describe("assertOrderBelongsToCustomer", () => {
  it("resolves for a matching customer and rejects (409) for a mismatched one", async () => {
    const customer = new mongoose.Types.ObjectId();
    const order = await createOrder(customer);
    await assert.doesNotReject(assertOrderBelongsToCustomer(String(order._id), customer));
    await assert.rejects(
      assertOrderBelongsToCustomer(String(order._id), new mongoose.Types.ObjectId()),
      (error: unknown) => {
        assert.ok(error instanceof CommercialReferenceError);
        assert.equal(error.status, 409);
        return true;
      },
    );
  });

  it("rejects with 404 when the order does not exist", async () => {
    await assert.rejects(
      assertOrderBelongsToCustomer(String(new mongoose.Types.ObjectId()), new mongoose.Types.ObjectId()),
      (error: unknown) => {
        assert.ok(error instanceof CommercialReferenceError);
        assert.equal(error.status, 404);
        return true;
      },
    );
  });
});

describe("assertInvoiceBelongsToCustomer", () => {
  it("resolves for a matching customer and rejects (409) for a mismatched one", async () => {
    const customer = new mongoose.Types.ObjectId();
    const invoice = await createInvoice(customer);
    await assert.doesNotReject(assertInvoiceBelongsToCustomer(String(invoice._id), customer));
    await assert.rejects(
      assertInvoiceBelongsToCustomer(String(invoice._id), new mongoose.Types.ObjectId()),
      (error: unknown) => {
        assert.ok(error instanceof CommercialReferenceError);
        assert.equal(error.status, 409);
        return true;
      },
    );
  });

  it("rejects with 404 when the invoice does not exist", async () => {
    await assert.rejects(
      assertInvoiceBelongsToCustomer(String(new mongoose.Types.ObjectId()), new mongoose.Types.ObjectId()),
      (error: unknown) => {
        assert.ok(error instanceof CommercialReferenceError);
        assert.equal(error.status, 404);
        return true;
      },
    );
  });
});
