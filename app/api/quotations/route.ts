import { z } from "zod";
import type { NextRequest } from "next/server";
import { apiError, apiSuccess, getPaginationParams, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { QuotationModel } from "@/lib/models/Quotation";
import { CustomerModel } from "@/lib/models/Customer";
import { requireStaff } from "@/lib/auth";
import { lineItemSchema, customerInputSchema, isDateOrderValid } from "@/lib/schemas/sales";
import { findOrCreateCustomer } from "@/lib/server/customers";
import { createWithDocumentNumber } from "@/lib/server/documentNumber";
import { snapshotLineItemAvailability } from "@/lib/server/availability";

const quotationSchema = z
  .object({
    customer: customerInputSchema,
    items: z.array(lineItemSchema),
    status: z.enum(["draft", "sent", "accepted", "rejected", "expired"]).optional(),
    issueDate: z.number().optional(),
    validUntil: z.number(),
    notes: z.string().trim().optional(),
    terms: z.string().trim().optional(),
  })
  // issueDate defaults to "now" below if omitted, so an omitted issueDate
  // is checked against Date.now() here too - a validUntil in the past
  // relative to today must be rejected even when the caller doesn't send
  // issueDate at all.
  .refine((data) => isDateOrderValid(data.issueDate ?? Date.now(), data.validUntil), {
    message: "validUntil must be after issueDate",
    path: ["validUntil"],
  });

export async function GET(request: NextRequest) {
  try {
    const user = await requireStaff();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { searchParams } = new URL(request.url);
    const { page, limit, sort, query, status } = getPaginationParams(searchParams);
    await connectToDatabase();

    const filter: Record<string, unknown> = {};
    if (query) {
      filter.$or = [
        { number: { $regex: query, $options: "i" } },
        { notes: { $regex: query, $options: "i" } },
      ];
    }
    if (status) {
      filter.status = status;
    }

    const [quotations, total] = await Promise.all([
      QuotationModel.find(filter).populate("customer").sort(sort).skip((page - 1) * limit).limit(limit).lean(),
      QuotationModel.countDocuments(filter),
    ]);

    return apiSuccess({
      items: quotations.map((quotation) => serializeDoc(quotation)),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    }, "Quotations loaded");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load quotations", [], 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireStaff();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const body = await request.json();
    const parsed = quotationSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Validation failed", parsed.error.issues.map((issue) => issue.message), 400);
    }

    await connectToDatabase();
    let customer;

    if (typeof parsed.data.customer === "string") {
      customer = await CustomerModel.findById(parsed.data.customer);
      if (!customer) {
        return apiError("Customer not found", [], 404);
      }
    } else {
      customer = await findOrCreateCustomer(parsed.data.customer);
    }

    const items = await snapshotLineItemAvailability(parsed.data.items);

    const quotation = await createWithDocumentNumber(QuotationModel, "QUO", (number) => ({
      number,
      customer: customer._id,
      items,
      status: parsed.data.status ?? "draft",
      issueDate: parsed.data.issueDate ? new Date(parsed.data.issueDate) : new Date(),
      validUntil: new Date(parsed.data.validUntil),
      notes: parsed.data.notes,
      terms: parsed.data.terms,
    }));

    return apiSuccess(serializeDoc(quotation.toObject()), "Quotation created");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create quotation", [], 500);
  }
}
