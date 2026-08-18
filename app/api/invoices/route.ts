import { z } from "zod";
import type { NextRequest } from "next/server";
import { apiError, apiSuccess, getPaginationParams, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { InvoiceModel } from "@/lib/models/Invoice";
import { CustomerModel } from "@/lib/models/Customer";
import { requireAdmin } from "@/lib/auth";
import { lineItemSchema, customerInputSchema, isDateOrderValid } from "@/lib/schemas/sales";
import { findOrCreateCustomer } from "@/lib/server/customers";
import { createWithDocumentNumber } from "@/lib/server/documentNumber";

const invoiceSchema = z
  .object({
    customer: customerInputSchema,
    items: z.array(lineItemSchema),
    status: z.enum(["draft", "unpaid", "partially_paid", "paid", "overdue", "cancelled"]).optional(),
    issueDate: z.number().optional(),
    dueDate: z.number(),
    amountPaid: z.number().nonnegative().optional(),
    notes: z.string().trim().optional(),
    terms: z.string().trim().optional(),
    quotationId: z.string().trim().optional(),
    orderId: z.string().trim().optional(),
  })
  // issueDate defaults to "now" below if omitted, so check against
  // Date.now() in that case too - see the identical comment on
  // quotationSchema in app/api/quotations/route.ts.
  .refine((data) => isDateOrderValid(data.issueDate ?? Date.now(), data.dueDate), {
    message: "dueDate must be after issueDate",
    path: ["dueDate"],
  });

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin();
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

    const [invoices, total] = await Promise.all([
      InvoiceModel.find(filter).populate("customer").sort(sort).skip((page - 1) * limit).limit(limit).lean(),
      InvoiceModel.countDocuments(filter),
    ]);

    return apiSuccess({
      items: invoices.map((invoice) => serializeDoc(invoice)),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    }, "Invoices loaded");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load invoices", [], 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const body = await request.json();
    const parsed = invoiceSchema.safeParse(body);

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

    const invoice = await createWithDocumentNumber(InvoiceModel, "INV", (number) => ({
      number,
      customer: customer._id,
      items: parsed.data.items,
      status: parsed.data.status ?? "draft",
      issueDate: parsed.data.issueDate ? new Date(parsed.data.issueDate) : new Date(),
      dueDate: new Date(parsed.data.dueDate),
      amountPaid: parsed.data.amountPaid ?? 0,
      notes: parsed.data.notes,
      terms: parsed.data.terms,
      quotationId: parsed.data.quotationId,
      orderId: parsed.data.orderId,
    }));

    return apiSuccess(serializeDoc(invoice.toObject()), "Invoice created");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create invoice", [], 500);
  }
}
