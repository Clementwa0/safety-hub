import { z } from "zod";
import type { NextRequest } from "next/server";
import { apiError, apiSuccess, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { InvoiceModel } from "@/lib/models/Invoice";
import { CustomerModel } from "@/lib/models/Customer";
import { requireAdmin } from "@/lib/auth";

const lineItemSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().optional(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  taxRate: z.number().nonnegative().optional(),
  discount: z.number().nonnegative().optional(),
});

// Same mismatch as the POST route: InvoiceForm always sends a full customer
// object, never a bare id string.
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

    if (parsed.data.customer) {
      if (typeof parsed.data.customer === "string") {
        const customer = await CustomerModel.findById(parsed.data.customer);
        if (!customer) {
          return apiError("Customer not found", [], 404);
        }
        invoice.customer = customer._id;
      } else {
        const customer = await CustomerModel.create({
          name: parsed.data.customer.name,
          email: parsed.data.customer.email || undefined,
          phone: parsed.data.customer.phone || undefined,
          company: parsed.data.customer.company || undefined,
          address: parsed.data.customer.address || undefined,
        });
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
