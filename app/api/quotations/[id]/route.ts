import { z } from "zod";
import type { NextRequest } from "next/server";
import { apiError, apiSuccess, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { QuotationModel, type IQuotation } from "@/lib/models/Quotation";
import { CustomerModel } from "@/lib/models/Customer";
import { InvoiceModel } from "@/lib/models/Invoice";
import { requireStaff } from "@/lib/auth";
import { lineItemSchema, customerInputSchema, isDateOrderValid } from "@/lib/schemas/sales";
import { findOrCreateCustomer } from "@/lib/server/customers";
import { createWithDocumentNumber } from "@/lib/server/documentNumber";

const quotationSchema = z.object({
  customer: customerInputSchema.optional(),
  items: z.array(lineItemSchema).optional(),
  status: z.enum(["draft", "sent", "accepted", "rejected", "expired"]).optional(),
  issueDate: z.number().optional(),
  validUntil: z.number().optional(),
  notes: z.string().trim().optional(),
  terms: z.string().trim().optional(),
});

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireStaff();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { id } = await params;
    await connectToDatabase();
    const quotation = await QuotationModel.findById(id).populate("customer").lean();

    if (!quotation) {
      return apiError("Quotation not found", [], 404);
    }

    return apiSuccess(serializeDoc(quotation), "Quotation loaded");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load quotation", [], 500);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireStaff();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = quotationSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Validation failed", parsed.error.issues.map((issue) => issue.message), 400);
    }

    await connectToDatabase();
    const quotation = await QuotationModel.findById(id);

    if (!quotation) {
      return apiError("Quotation not found", [], 404);
    }

    // A PATCH payload is partial - a request updating only `validUntil`
    // (or only `issueDate`) must still be checked against whichever of
    // the two isn't in this payload, taken from the existing document.
    // A Zod-level refine on the schema can't do this since it only ever
    // sees the (possibly one-sided) payload, never the stored document.
    const effectiveIssueDate = parsed.data.issueDate ?? quotation.issueDate.getTime();
    const effectiveValidUntil = parsed.data.validUntil ?? quotation.validUntil.getTime();

    if (!isDateOrderValid(effectiveIssueDate, effectiveValidUntil)) {
      return apiError("Validation failed", ["validUntil must be after issueDate"], 400);
    }

    if (parsed.data.customer) {
      if (typeof parsed.data.customer === "string") {
        const customer = await CustomerModel.findById(parsed.data.customer);
        if (!customer) {
          return apiError("Customer not found", [], 404);
        }
        quotation.customer = customer._id;
      } else {
        const customer = await findOrCreateCustomer(parsed.data.customer);
        quotation.customer = customer._id;
      }
    }

    Object.assign(quotation, parsed.data, {
      customer: quotation.customer,
      issueDate: parsed.data.issueDate ? new Date(parsed.data.issueDate) : quotation.issueDate,
      validUntil: parsed.data.validUntil ? new Date(parsed.data.validUntil) : quotation.validUntil,
    });
    await quotation.save();

    return apiSuccess(serializeDoc(quotation.toObject()), "Quotation updated");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update quotation", [], 500);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireStaff();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { id } = await params;
    await connectToDatabase();
    const quotation = await QuotationModel.findByIdAndDelete(id);

    if (!quotation) {
      return apiError("Quotation not found", [], 404);
    }

    return apiSuccess(null, "Quotation deleted");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete quotation", [], 500);
  }
}

const postActionSchema = z.object({
  // Present + true only on the "Duplicate" action (see
  // services/sentinel/quotation.service.ts's duplicate() vs
  // convertToInvoice() — both POST to this same endpoint). Absent/false
  // means "convert this quotation to an invoice", the original meaning
  // of a bare POST here.
  duplicate: z.boolean().optional(),
});

async function duplicateQuotation(quotation: IQuotation) {
  // Preserve the original's validity window length (e.g. "valid for 30
  // days"), just re-anchored to today, rather than copying the original's
  // now-possibly-past validUntil date verbatim.
  const validityMs = Math.max(quotation.validUntil.getTime() - quotation.issueDate.getTime(), 0);
  const now = new Date();

  const copy = await createWithDocumentNumber(QuotationModel, "QUO", (number) => ({
    number,
    customer: quotation.customer,
    items: quotation.items,
    status: "draft",
    issueDate: now,
    validUntil: new Date(now.getTime() + validityMs),
    notes: quotation.notes,
    terms: quotation.terms,
    // invoiceId intentionally omitted — a duplicate is a fresh quotation,
    // never linked to the original's (or anyone's) invoice.
  }));

  return apiSuccess(serializeDoc(copy.toObject()), "Quotation duplicated");
}

async function convertQuotationToInvoice(quotation: IQuotation) {
  if (quotation.status !== "accepted") {
    return apiError("Only accepted quotations can be converted to invoice", [], 400);
  }

  const existingInvoice = await InvoiceModel.findOne({ quotationId: quotation._id });
  if (existingInvoice) {
    return apiSuccess(serializeDoc(existingInvoice.toObject()), "Invoice already exists");
  }

  const invoice = await createWithDocumentNumber(InvoiceModel, "INV", (number) => ({
    number,
    customer: quotation.customer,
    items: quotation.items,
    status: "unpaid",
    issueDate: new Date(),
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    amountPaid: 0,
    quotationId: quotation._id,
  }));

  quotation.invoiceId = invoice._id;
  await quotation.save();

  return apiSuccess(serializeDoc(invoice.toObject()), "Invoice created from quotation");
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireStaff();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { id } = await params;

    // Body is optional — convertToInvoice() sends none at all, so an
    // empty body must not be treated as invalid JSON.
    let body: unknown = {};
    const raw = await request.text();
    if (raw) {
      try {
        body = JSON.parse(raw);
      } catch {
        return apiError("Invalid request body", [], 400);
      }
    }

    const parsed = postActionSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validation failed", parsed.error.issues.map((issue) => issue.message), 400);
    }

    await connectToDatabase();
    const quotation = await QuotationModel.findById(id);

    if (!quotation) {
      return apiError("Quotation not found", [], 404);
    }

    return parsed.data.duplicate
      ? await duplicateQuotation(quotation)
      : await convertQuotationToInvoice(quotation);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to process quotation", [], 500);
  }
}
