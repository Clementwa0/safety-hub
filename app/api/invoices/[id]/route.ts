import { z } from "zod";
import type { NextRequest } from "next/server";
import { apiError, apiSuccess, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { InvoiceModel } from "@/lib/models/Invoice";
import { CustomerModel } from "@/lib/models/Customer";
import { requireAdmin } from "@/lib/auth";
import { lineItemSchema, customerInputSchema, isDateOrderValid } from "@/lib/schemas/sales";
import { findOrCreateCustomer } from "@/lib/server/customers";

const invoiceSchema = z.object({
  customer: customerInputSchema.optional(),
  items: z.array(lineItemSchema).optional(),
  status: z.enum(["draft", "unpaid", "partially_paid", "paid", "overdue", "cancelled"]).optional(),
  issueDate: z.number().optional(),
  dueDate: z.number().optional(),
  amountPaid: z.number().nonnegative().optional(),
  notes: z.string().trim().optional(),
  terms: z.string().trim().optional(),
  quotationId: z.string().trim().optional(),
  orderId: z.string().trim().optional(),
});

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { id } = await params;
    await connectToDatabase();
    const invoice = await InvoiceModel.findById(id).populate("customer").lean();

    if (!invoice) {
      return apiError("Invoice not found", [], 404);
    }

    return apiSuccess(serializeDoc(invoice), "Invoice loaded");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load invoice", [], 500);
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
    const parsed = invoiceSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Validation failed", parsed.error.issues.map((issue) => issue.message), 400);
    }

    await connectToDatabase();
    const invoice = await InvoiceModel.findById(id);

    if (!invoice) {
      return apiError("Invoice not found", [], 404);
    }

    // See the identical comment in quotations/[id]/route.ts's PATCH: a
    // partial payload has to be checked against whichever date isn't
    // included, taken from the existing document, not from `undefined`.
    const effectiveIssueDate = parsed.data.issueDate ?? invoice.issueDate.getTime();
    const effectiveDueDate = parsed.data.dueDate ?? invoice.dueDate.getTime();

    if (!isDateOrderValid(effectiveIssueDate, effectiveDueDate)) {
      return apiError("Validation failed", ["dueDate must be after issueDate"], 400);
    }

    if (parsed.data.customer) {
      if (typeof parsed.data.customer === "string") {
        const customer = await CustomerModel.findById(parsed.data.customer);
        if (!customer) {
          return apiError("Customer not found", [], 404);
        }
        invoice.customer = customer._id;
      } else {
        const customer = await findOrCreateCustomer(parsed.data.customer);
        invoice.customer = customer._id;
      }
    }

    Object.assign(invoice, parsed.data, {
      customer: invoice.customer,
      issueDate: parsed.data.issueDate ? new Date(parsed.data.issueDate) : invoice.issueDate,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : invoice.dueDate,
    });
    await invoice.save();

    return apiSuccess(serializeDoc(invoice.toObject()), "Invoice updated");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update invoice", [], 500);
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
    const invoice = await InvoiceModel.findByIdAndDelete(id);

    if (!invoice) {
      return apiError("Invoice not found", [], 404);
    }

    return apiSuccess(null, "Invoice deleted");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete invoice", [], 500);
  }
}
