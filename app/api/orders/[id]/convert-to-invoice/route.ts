import type { NextRequest } from "next/server";
import { apiError, apiSuccess, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { OrderModel } from "@/lib/models/Order";
import { InvoiceModel } from "@/lib/models/Invoice";
import { requireStaff } from "@/lib/auth";
import { createWithDocumentNumber } from "@/lib/db/document-number";

// POST /api/orders/[id]/convert-to-invoice
//
// The second half of the Quotation -> Order -> Invoice pipeline (see
// convertQuotationToOrder in app/api/quotations/[id]/route.ts for the
// first half). This route is now purely a billing-document step — it no
// longer touches `Product.stock` or `Product.reserved`. Stock actually
// leaves inventory when the Order reaches "shipped" (see the PATCH
// handler in app/api/orders/[id]/route.ts), which can happen before or
// after the order is invoiced; the two are independent now, matching how
// shipping and billing are independent in the real world.
//
// A cancelled order should never reach this endpoint (nothing to invoice)
// and an order that's already invoiced is caught by the existing-invoice
// check below, same idempotency pattern as the quotation -> order
// conversion.
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireStaff();
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
