import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { clearTestDatabase, startTestDatabase, stopTestDatabase } from "../setup/db";

const { requireStaffMock } = vi.hoisted(() => ({ requireStaffMock: vi.fn() }));

vi.mock("@/lib/auth", () => ({ requireStaff: requireStaffMock }));

import { POST } from "@/app/api/quotations/[id]/route";
import { QuotationModel } from "@/lib/models/Quotation";
import { InvoiceModel } from "@/lib/models/Invoice";
import { CustomerModel } from "@/lib/models/Customer";

beforeAll(startTestDatabase);
afterEach(clearTestDatabase);
afterAll(stopTestDatabase);

beforeEach(() => {
  requireStaffMock.mockReset();
  requireStaffMock.mockResolvedValue({ id: "staff-1", role: "staff" });
});

async function makeQuotation(overrides: Partial<{ status: string }> = {}) {
  const customer = await CustomerModel.create({ name: "Acme Ltd", email: "acme@example.com" });
  const issueDate = new Date("2026-01-01T00:00:00.000Z");
  const validUntil = new Date("2026-01-31T00:00:00.000Z"); // 30-day window

  return QuotationModel.create({
    number: `QUO-TEST-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    customer: customer._id,
    items: [{ name: "Fire extinguisher", quantity: 2, unitPrice: 5000, taxRate: 0.16, discount: 0 }],
    status: overrides.status ?? "draft",
    issueDate,
    validUntil,
    notes: "Handle with care",
    terms: "Net 30",
  });
}

function postRequest(body?: unknown) {
  return new Request("http://localhost/api/quotations/x", {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
  }) as unknown as Parameters<typeof POST>[0];
}

async function callPost(id: string, body?: unknown) {
  return POST(postRequest(body), { params: Promise.resolve({ id }) });
}

describe("POST /api/quotations/[id] — duplicate vs convert-to-invoice", () => {
  it("REGRESSION: duplicate:true creates a copy instead of converting, even for a draft quotation that could never be converted", async () => {
    const quotation = await makeQuotation({ status: "draft" });

    const response = await callPost(String(quotation._id), { duplicate: true });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toBe("Quotation duplicated");
    expect(body.data.status).toBe("draft");
    expect(body.data.id).not.toBe(String(quotation._id));
    expect(body.data.invoiceId).toBeUndefined();

    // The original must be completely untouched.
    const original = await QuotationModel.findById(quotation._id);
    expect(original?.status).toBe("draft");
    expect(original?.invoiceId).toBeUndefined();
  });

  it("duplicate preserves the customer, items, and notes/terms, resets to draft, and re-anchors the validity window to today", async () => {
    const quotation = await makeQuotation({ status: "sent" });

    const before = Date.now();
    const response = await callPost(String(quotation._id), { duplicate: true });
    const body = await response.json();
    const after = Date.now();

    expect(body.data.customer).toBe(String(quotation.customer));
    expect(body.data.notes).toBe("Handle with care");
    expect(body.data.terms).toBe("Net 30");
    expect(body.data.items).toHaveLength(1);
    expect(body.data.items[0].name).toBe("Fire extinguisher");

    const issueDate = new Date(body.data.issueDate).getTime();
    const validUntil = new Date(body.data.validUntil).getTime();

    // issueDate is "now", not the original's 2026-01-01.
    expect(issueDate).toBeGreaterThanOrEqual(before);
    expect(issueDate).toBeLessThanOrEqual(after);
    // Same 30-day window length as the original, just re-anchored.
    expect(validUntil - issueDate).toBe(30 * 24 * 60 * 60 * 1000);
  });

  it("a bare POST (no body) still converts an accepted quotation to an invoice, unchanged from before", async () => {
    const quotation = await makeQuotation({ status: "accepted" });

    const response = await callPost(String(quotation._id));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Invoice created from quotation");
    expect(body.data.status).toBe("unpaid");

    const updated = await QuotationModel.findById(quotation._id);
    expect(String(updated?.invoiceId)).toBe(body.data.id);

    const invoice = await InvoiceModel.findById(body.data.id);
    expect(invoice).not.toBeNull();
  });

  it("rejects converting a non-accepted quotation, same as before", async () => {
    const quotation = await makeQuotation({ status: "draft" });

    const response = await callPost(String(quotation._id));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Only accepted quotations can be converted/);
  });

  it("duplicate:false behaves like a bare POST (converts, subject to the same accepted-only rule)", async () => {
    const quotation = await makeQuotation({ status: "draft" });

    const response = await callPost(String(quotation._id), { duplicate: false });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Only accepted quotations can be converted/);
  });

  it("requires staff auth for both actions", async () => {
    requireStaffMock.mockResolvedValue(null);
    const quotation = await makeQuotation({ status: "draft" });

    const response = await callPost(String(quotation._id), { duplicate: true });
    expect(response.status).toBe(401);
  });
});
