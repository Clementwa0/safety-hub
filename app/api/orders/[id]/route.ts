import { z } from "zod";
import type { NextRequest } from "next/server";
import { apiError, apiSuccess, serializeDoc } from "@/lib/api";
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

// Same mismatch as the POST route: OrderForm always sends a full customer
// object, never a bare id string. Accept the same union Quotations use.
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
  customer: customerInputSchema.optional(),
  items: z.array(lineItemSchema).optional(),
  status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]).optional(),
  notes: z.string().trim().optional(),
  quotationId: z.string().trim().optional(),
  invoiceId: z.string().trim().optional(),
});

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { id } = await params;
    await connectToDatabase();
    const order = await OrderModel.findById(id).populate("customer").lean();

    if (!order) {
      return apiError("Order not found", [], 404);
    }

    return apiSuccess(serializeDoc(order), "Order loaded");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load order", [], 500);
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
    const parsed = orderSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Validation failed", parsed.error.issues.map((issue) => issue.message), 400);
    }

    await connectToDatabase();
    const order = await OrderModel.findById(id);

    if (!order) {
      return apiError("Order not found", [], 404);
    }

    if (parsed.data.customer) {
      if (typeof parsed.data.customer === "string") {
        const customer = await CustomerModel.findById(parsed.data.customer);
        if (!customer) {
          return apiError("Customer not found", [], 404);
        }
        order.customer = customer._id;
      } else {
        const customer = await CustomerModel.create({
          name: parsed.data.customer.name,
          email: parsed.data.customer.email || undefined,
          phone: parsed.data.customer.phone || undefined,
          company: parsed.data.customer.company || undefined,
          address: parsed.data.customer.address || undefined,
        });
        order.customer = customer._id;
      }
    }

    Object.assign(order, { ...parsed.data, customer: order.customer });
    await order.save();

    return apiSuccess(serializeDoc(order.toObject()), "Order updated");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update order", [], 500);
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
    const order = await OrderModel.findByIdAndDelete(id);

    if (!order) {
      return apiError("Order not found", [], 404);
    }

    return apiSuccess(null, "Order deleted");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete order", [], 500);
  }
}
