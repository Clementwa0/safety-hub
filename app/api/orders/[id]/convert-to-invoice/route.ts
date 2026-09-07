import type { NextRequest } from "next/server";
import { apiError, apiSuccess, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { convertOrderToInvoice, translateInvoiceServiceError } from "@/modules/invoicing/invoice.service";

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
// All the actual work — the existence/state checks, the atomic
// create-invoice-and-stamp-order-invoiceId transaction, and the
// duplicate-conversion race handling — lives in
// modules/invoicing/invoice.service.ts#convertOrderToInvoice, so it can
// be exercised directly in tests without going through a Next.js
// request/response cycle. This route is just the HTTP adapter around
// it, translating the service's `__TAG__message` errors the same way
// the payments routes already do.
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

    const { invoice, alreadyExisted } = await convertOrderToInvoice(id, user.name || user.email || "system");

    return apiSuccess(
      serializeDoc(invoice.toObject()),
      alreadyExisted ? "Invoice already exists" : "Invoice created from sales order",
    );
  } catch (error) {
    const { message, status } = translateInvoiceServiceError(error);
    return apiError(message, [], status);
  }
}
