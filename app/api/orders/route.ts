import { z } from "zod";
import type { NextRequest } from "next/server";
import { apiError, apiSuccess, getPaginationParams, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { OrderModel } from "@/lib/models/Order";
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

// OrderForm (components/sentinel/orders/OrderForm.tsx) always submits
// `customer` as a full object typed from `CustomerFields`
// ({ name, email?, phone?, company?, address? }), never as a bare id
// string. This schema previously only accepted `z.string()`, so every
// order create/update from the actual UI failed Zod validation with
// "Validation failed" and nothing was ever saved. Quotations already
// solved this correctly - mirror that union here.
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

const orderSchema = z.object({
  customer: customerInputSchema,
  items: z.array(lineItemSchema),
  status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]).optional(),
  notes: z.string().trim().optional(),
  quotationId: z.string().trim().optional(),
  invoiceId: z.string().trim().optional(),
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

    const [orders, total] = await Promise.all([
      OrderModel.find(filter).populate("customer").sort(sort).skip((page - 1) * limit).limit(limit).lean(),
      OrderModel.countDocuments(filter),
    ]);

    return apiSuccess({
      items: orders.map((order) => serializeDoc(order)),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    }, "Orders loaded");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load orders", [], 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const body = await request.json();
    const parsed = orderSchema.safeParse(body);

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

    const number = `ORD-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const order = await OrderModel.create({
      number,
      customer: customer._id,
      items: parsed.data.items,
      status: parsed.data.status ?? "pending",
      notes: parsed.data.notes,
      quotationId: parsed.data.quotationId,
      invoiceId: parsed.data.invoiceId,
    });

    return apiSuccess(serializeDoc(order.toObject()), "Order created");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create order", [], 500);
  }
}
