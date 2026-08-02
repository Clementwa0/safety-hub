import { z } from "zod";
import type { NextRequest } from "next/server";
import { apiError, apiSuccess, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { QuotationModel } from "@/lib/models/Quotation";
import { CustomerModel } from "@/lib/models/Customer";
import { InvoiceModel } from "@/lib/models/Invoice";
import { requireAdmin } from "@/lib/auth";

const lineItemSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().optional(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  taxRate: z.number().nonnegative().optional(),
  discount: z.number().nonnegative().optional(),
});

const customerInputSchema = z.union([
  z.string().trim().min(1),
  z.object({
    name: z.string().trim().min(1),
    email: z.string().trim().email().optional().or(z.literal("")),
    phone: z.string().trim().optional(),
    company: z.string().trim().optional(),
    address: z.string().trim().optional(),
  }),
]);

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
    const user = await requireAdmin();
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
    const user = await requireAdmin();
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

    if (parsed.data.customer) {
      if (typeof parsed.data.customer === "string") {
        const customer = await CustomerModel.findById(parsed.data.customer);
        if (!customer) {
          return apiError("Customer not found", [], 404);
        }
        quotation.customer = customer._id;
      } else {
        const customer = await CustomerModel.create({
          name: parsed.data.customer.name,
          email: parsed.data.customer.email || undefined,
          phone: parsed.data.customer.phone || undefined,
          company: parsed.data.customer.company || undefined,
          address: parsed.data.customer.address || undefined,
        });
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
    const user = await requireAdmin();
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

export async function POST_CONVERT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { id } = await params;
    await connectToDatabase();
    const quotation = await QuotationModel.findById(id);

    if (!quotation) {
      return apiError("Quotation not found", [], 404);
    }

    if (quotation.status !== "accepted") {
      return apiError("Only accepted quotations can be converted to invoice", [], 400);
    }

    const existingInvoice = await InvoiceModel.findOne({ quotationId: quotation._id });
    if (existingInvoice) {
      return apiSuccess(serializeDoc(existingInvoice.toObject()), "Invoice already exists");
    }

    const invoice = await InvoiceModel.create({
      number: `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      customer: quotation.customer,
      items: quotation.items,
      status: "unpaid",
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      amountPaid: 0,
      quotationId: quotation._id,
    });

    quotation.invoiceId = invoice._id;
    await quotation.save();

    return apiSuccess(serializeDoc(invoice.toObject()), "Invoice created from quotation");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to convert quotation", [], 500);
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return POST_CONVERT(request, context);
}
