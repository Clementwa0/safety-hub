import type { NextRequest } from "next/server";
import { apiError, apiSuccess, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { OrderModel } from "@/lib/models/Order";
import { InvoiceModel } from "@/lib/models/Invoice";
import { ProductModel } from "@/lib/models/Product";
import { requireAdmin } from "@/lib/auth";
import { createWithDocumentNumber } from "@/lib/server/documentNumber";

// POST /api/orders/[id]/convert-to-invoice
//
// The second half of the Quotation -> Order -> Invoice pipeline (see
// convertQuotationToOrder in app/api/quotations/[id]/route.ts for the
// first half). This is where stock actually leaves inventory: each
// line's quantity is subtracted from Product.stock, and the matching
// Product.reserved hold (placed when the Order was created) is released
// - the reservation's job was only to keep the quantity out of
// `available` until it was either invoiced or the order fell through, not
// to itself represent lost stock.
//
// A cancelled order should never reach this endpoint (nothing to invoice)
// and a delivered/shipped order that's already invoiced is caught by the
// existing-invoice check below, same idempotency pattern as the
// quotation -> order conversion.
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { id } = await params;
    await connectToDatabase();
    const order = await OrderModel.findById(id);

    if (!order) {
      return apiError("Order not found", [], 404);
    }

    if (order.status === "cancelled") {
      return apiError("Cancelled orders cannot be invoiced", [], 400);
    }

    const existingInvoice = await InvoiceModel.findOne({ orderId: order._id });
    if (existingInvoice) {
      return apiSuccess(serializeDoc(existingInvoice.toObject()), "Invoice already exists");
    }

    const invoice = await createWithDocumentNumber(InvoiceModel, "INV", (number) => ({
      number,
      customer: order.customer,
      items: order.items,
      status: "unpaid",
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      amountPaid: 0,
      quotationId: order.quotationId,
      orderId: order._id,
    }));

    const releases = order.items
      .filter((item) => item.productId)
      .map((item) =>
        ProductModel.updateOne(
          { _id: item.productId },
          {
            $inc: {
              stock: -item.quantity,
              reserved: -item.quantity,
            },
          },
        ),
      );
    await Promise.all(releases);

    order.invoiceId = invoice._id;
    await order.save();

    return apiSuccess(serializeDoc(invoice.toObject()), "Invoice created from sales order");
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to convert order to invoice",
      [],
      500,
    );
  }
}
