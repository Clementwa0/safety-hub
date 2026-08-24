import mongoose from "mongoose";
import { z } from "zod";
import type { NextRequest } from "next/server";
import { apiError, apiSuccess, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { OrderModel } from "@/lib/models/Order";
import { ProductModel } from "@/lib/models/Product";
import { CustomerModel } from "@/lib/models/Customer";
import { requireStaff } from "@/lib/auth";
import { lineItemSchema, customerInputSchema } from "@/lib/schemas/sales";
import { findOrCreateCustomer } from "@/lib/server/customers";
import { validateOrderStatusTransition } from "@/lib/server/order-status";
import { recordMovement } from "@/lib/server/movements";

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

    // Resolve/create the customer up front — it doesn't touch stock, so it
    // doesn't need to be inside the transaction below.
    let resolvedCustomerId: mongoose.Types.ObjectId | string | undefined;
    if (parsed.data.customer) {
      if (typeof parsed.data.customer === "string") {
        const customer = await CustomerModel.findById(parsed.data.customer);
        if (!customer) {
          return apiError("Customer not found", [], 404);
        }
        resolvedCustomerId = customer._id as mongoose.Types.ObjectId;
      } else {
        const customer = await findOrCreateCustomer(parsed.data.customer);
        resolvedCustomerId = customer._id as mongoose.Types.ObjectId;
      }
    }

    const session = await mongoose.startSession();
    try {
      let updated: Awaited<ReturnType<typeof OrderModel.findById>> | null = null;

      await session.withTransaction(async () => {
        const order = await OrderModel.findById(id).session(session);
        if (!order) {
          throw new Error("__ORDER_NOT_FOUND__");
        }

        if (parsed.data.status && parsed.data.status !== order.status) {
          const transitionError = validateOrderStatusTransition(order.status, parsed.data.status);
          if (transitionError) {
            throw new Error(`__TRANSITION__${transitionError}`);
          }

          const previousStatus = order.status;
          order.status = parsed.data.status;

          // Stock actually leaves inventory here, at "shipped" — not when
          // the order is converted to an invoice (see
          // app/api/orders/[id]/convert-to-invoice/route.ts, which no
          // longer touches stock at all). Guarded by `stockDecremented`
          // so re-sending the same status can't double-decrement.
          if (parsed.data.status === "shipped" && !order.stockDecremented) {
            for (const item of order.items) {
              if (!item.productId) continue;

              // Only orders created from an accepted Quotation placed a
              // `reserved` hold (see convertQuotationToOrder) — a
              // directly-created order (POST /api/orders) never
              // reserved, so releasing `reserved` for it would push the
              // field negative. Two static $inc shapes rather than a
              // dynamically-built one, to stay within Mongoose's typed
              // update signature.
              // As above, $inc bypasses the pre-validate rollup hook, so a
              // variant line must increment both its own
              // variants.$[v].stock/reserved and the parent-level
              // stock/reserved in the same op to keep the rollup correct.
              const arrayFilters = item.variantSku ? [{ "v.sku": item.variantSku }] : undefined;
              const updatedProduct = order.reservedStock
                ? await ProductModel.findOneAndUpdate(
                    { _id: item.productId },
                    item.variantSku
                      ? {
                          $inc: {
                            "variants.$[v].stock": -item.quantity,
                            "variants.$[v].reserved": -item.quantity,
                            stock: -item.quantity,
                            reserved: -item.quantity,
                          },
                        }
                      : { $inc: { stock: -item.quantity, reserved: -item.quantity } },
                    { session, returnDocument: "after", arrayFilters },
                  )
                : await ProductModel.findOneAndUpdate(
                    { _id: item.productId },
                    item.variantSku
                      ? { $inc: { "variants.$[v].stock": -item.quantity, stock: -item.quantity } }
                      : { $inc: { stock: -item.quantity } },
                    { session, returnDocument: "after", arrayFilters },
                  );

              if (updatedProduct) {
                await recordMovement({
                  productId: updatedProduct._id as mongoose.Types.ObjectId,
                  type: "order_shipped",
                  delta: -item.quantity,
                  resultingStock: updatedProduct.stock,
                  reference: order.number,
                  session,
                });
              }
            }
            order.stockDecremented = true;
          }

          // Cancellation is only reachable before "shipped" (enforced by
          // validateOrderStatusTransition above), so `stock` was never
          // touched for this order — only a `reserved` hold (if any)
          // needs releasing. No Movement is logged: nothing actually
          // moved.
          if (parsed.data.status === "cancelled" && previousStatus !== "shipped" && order.reservedStock) {
            for (const item of order.items) {
              if (!item.productId) continue;
              await ProductModel.updateOne(
                { _id: item.productId },
                item.variantSku
                  ? { $inc: { "variants.$[v].reserved": -item.quantity, reserved: -item.quantity } }
                  : { $inc: { reserved: -item.quantity } },
                {
                  session,
                  arrayFilters: item.variantSku ? [{ "v.sku": item.variantSku }] : undefined,
                },
              );
            }
          }
        }

        if (parsed.data.items) {
          order.items = parsed.data.items;
        }
        if (parsed.data.notes !== undefined) {
          order.notes = parsed.data.notes;
        }
        if (parsed.data.quotationId !== undefined) {
          order.quotationId = parsed.data.quotationId;
        }
        if (parsed.data.invoiceId !== undefined) {
          order.invoiceId = parsed.data.invoiceId;
        }
        if (resolvedCustomerId) {
          order.customer = resolvedCustomerId;
        }

        await order.save({ session });
        updated = order;
      });

      if (!updated) {
        return apiError("Order not found", [], 404);
      }

      return apiSuccess(serializeDoc((updated as InstanceType<typeof OrderModel>).toObject()), "Order updated");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update order";

      if (message === "__ORDER_NOT_FOUND__") {
        return apiError("Order not found", [], 404);
      }
      if (message.startsWith("__TRANSITION__")) {
        return apiError(message.replace("__TRANSITION__", ""), [], 400);
      }

      return apiError(message, [], 500);
    } finally {
      await session.endSession();
    }
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
