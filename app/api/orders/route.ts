import mongoose from "mongoose";
import { z } from "zod";
import type { NextRequest } from "next/server";
import { apiError, apiSuccess, getPaginationParams, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { OrderModel } from "@/lib/models/Order";
import { CustomerModel } from "@/lib/models/Customer";
import { requireStaff } from "@/lib/auth";
import { lineItemSchema, customerInputSchema } from "@/lib/schemas/sales";
import { findOrCreateCustomer } from "@/modules/customers/customers";
import { createWithDocumentNumber } from "@/lib/db/document-number";
import { reserveAvailableStock } from "@/modules/inventory/inventory.service";

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
    const user = await requireStaff();
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
      customer = await findOrCreateCustomer(parsed.data.customer);
    }

    const session = await mongoose.startSession();
    try {
      let createdOrder: unknown = null;
      await session.withTransaction(async () => {
        const order = await createWithDocumentNumber(OrderModel, "ORD", (number) => ({
          number,
          customer: customer._id,
          items: parsed.data.items,
          status: parsed.data.status ?? "pending",
          notes: parsed.data.notes,
          quotationId: parsed.data.quotationId,
          invoiceId: parsed.data.invoiceId,
          reservedStock: true,
          fulfillmentStatus: "AVAILABLE",
        }), session);

        let fullyAvailable = true;
        let partiallyAvailable = false;
        for (const item of parsed.data.items) {
          if (!item.productId) continue;

          const reservedQuantity = await reserveAvailableStock({
            productId: item.productId,
            variantSku: item.variantSku,
            quantity: item.quantity,
            session,
          });

          const orderItem = order.items.find(
            (entry) => entry.productId === item.productId && entry.variantSku === item.variantSku,
          );
          if (orderItem) orderItem.reservedQuantity = reservedQuantity;

          if (reservedQuantity < item.quantity) {
            fullyAvailable = false;
            if (reservedQuantity > 0) partiallyAvailable = true;
          }
        }

        order.fulfillmentStatus = fullyAvailable ? "AVAILABLE" : partiallyAvailable ? "PARTIALLY_AVAILABLE" : "BACKORDERED";
        await order.save({ session });
        createdOrder = order;
      });

      if (!createdOrder) {
        throw new Error("Order creation failed");
      }

      const payload =
        typeof createdOrder === "object" && createdOrder !== null && "toObject" in createdOrder
          ? (createdOrder as { toObject: () => Record<string, unknown> }).toObject()
          : createdOrder;

      return apiSuccess(serializeDoc(payload), "Order created");
    } finally {
      await session.endSession();
    }
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create order", [], 500);
  }
}
