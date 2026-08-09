import { z } from "zod";
import type { NextRequest } from "next/server";
import { apiError, apiSuccess, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { OrderModel } from "@/lib/models/Order";
import { CustomerModel } from "@/lib/models/Customer";
import { requireStaff } from "@/lib/auth";
import { lineItemSchema, customerInputSchema } from "@/lib/schemas/sales";
import { findOrCreateCustomer } from "@/lib/server/customers";

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
    const user = await requireStaff();
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
    const user = await requireStaff();
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
        const customer = await findOrCreateCustomer(parsed.data.customer);
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
    const user = await requireStaff();
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
