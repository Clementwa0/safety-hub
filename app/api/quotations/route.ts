import { z } from "zod";
import type { NextRequest } from "next/server";
import { apiError, apiSuccess, getPaginationParams, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { QuotationModel } from "@/lib/models/Quotation";
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
  customer: customerInputSchema,
  items: z.array(lineItemSchema),
  status: z.enum(["draft", "sent", "accepted", "rejected", "expired"]).optional(),
  issueDate: z.number().optional(),
  validUntil: z.number(),
  notes: z.string().trim().optional(),
  terms: z.string().trim().optional(),
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
    const user = await requireAdmin();
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
      customer = await CustomerModel.create({
        name: parsed.data.customer.name,
        email: parsed.data.customer.email || undefined,
        phone: parsed.data.customer.phone || undefined,
        company: parsed.data.customer.company || undefined,
        address: parsed.data.customer.address || undefined,
      });
    }

    const number = `QUO-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const quotation = await QuotationModel.create({
      number,
      customer: customer._id,
      items: parsed.data.items,
      status: parsed.data.status ?? "draft",
      issueDate: parsed.data.issueDate ? new Date(parsed.data.issueDate) : new Date(),
      validUntil: new Date(parsed.data.validUntil),
      notes: parsed.data.notes,
      terms: parsed.data.terms,
    });

    return apiSuccess(serializeDoc(quotation.toObject()), "Quotation created");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create quotation", [], 500);
  }
}
