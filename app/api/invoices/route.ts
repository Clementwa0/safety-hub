import { z } from "zod";
import type { NextRequest } from "next/server";
import { apiError, apiSuccess, getPaginationParams, serializeDoc } from "@/lib/api";
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

// InvoiceForm (components/sentinel/invoices/InvoiceForm.tsx) always submits
// `customer` as a full object from `CustomerFields`, never a bare id
// string - the same mismatch that broke Orders. This schema previously
// only accepted `z.string()`, so every direct invoice create/update failed
// Zod validation. Mirror the union Quotations already use.
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
      customer = await CustomerModel.create({
        name: parsed.data.customer.name,
        email: parsed.data.customer.email || undefined,
        phone: parsed.data.customer.phone || undefined,
        company: parsed.data.customer.company || undefined,
        address: parsed.data.customer.address || undefined,
      });
    }

    const number = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const invoice = await InvoiceModel.create({
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
    });

    return apiSuccess(serializeDoc(invoice.toObject()), "Invoice created");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create invoice", [], 500);
  }
}
