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
import { createWithDocumentNumber, isDuplicateKeyErrorOn } from "@/lib/db/document-number";
import { reserveAvailableStock } from "@/modules/inventory/inventory.service";
import { recordAuditEvent } from "@/modules/audit/audit.service";
import {
  assertInvoiceBelongsToCustomer,
  assertQuotationBelongsToCustomer,
  CommercialReferenceError,
} from "@/modules/orders/commercial-references";

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

    // A direct order-creation request can supply a quotationId/invoiceId
    // just like the quotation-conversion and order-to-invoice flows do —
    // so it must be held to the same relationship rules: the referenced
    // document has to actually exist, and it has to belong to the same
    // customer this order is being created for. Without this, anyone
    // could POST /api/orders with someone else's quotationId and splice
    // an unrelated order into that quotation's history.
    try {
      if (parsed.data.quotationId) {
        await assertQuotationBelongsToCustomer(parsed.data.quotationId, customer._id);
      }
      if (parsed.data.invoiceId) {
        await assertInvoiceBelongsToCustomer(parsed.data.invoiceId, customer._id);
      }
    } catch (error) {
      if (error instanceof CommercialReferenceError) {
        return apiError(error.message, [], error.status);
      }
      throw error;
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

        await recordAuditEvent(
          {
            actor: user.name || user.email || "system",
            action: "order_mutated",
            entity: "Order",
            entityId: String(order._id),
            metadata: { created: true, number: order.number, status: order.status },
          },
          session,
        );
      });

      if (!createdOrder) {
        throw new Error("Order creation failed");
      }

      const payload =
        typeof createdOrder === "object" && createdOrder !== null && "toObject" in createdOrder
          ? (createdOrder as { toObject: () => Record<string, unknown> }).toObject()
          : createdOrder;

      return apiSuccess(serializeDoc(payload), "Order created");
    } catch (error) {
      // Lost a race to another request claiming the same
      // quotation/invoice — the unique index on Order.quotationId /
      // Order.invoiceId (see lib/models/Order.ts) rejected this insert.
      // The transaction is fully rolled back, so nothing was left
      // behind; report it as a conflict rather than a generic 500.
      if (isDuplicateKeyErrorOn(error, "quotationId")) {
        return apiError("Another order already exists for this quotation", [], 409);
      }
      if (isDuplicateKeyErrorOn(error, "invoiceId")) {
        return apiError("Another order already exists for this invoice", [], 409);
      }
      throw error;
    } finally {
      await session.endSession();
    }
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create order", [], 500);
  }
}
