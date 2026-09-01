import type { NextRequest } from "next/server";
import { apiError, apiSuccess, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { voidPaymentSchema } from "@/lib/validation/payment";
import { voidPayment, translateInvoiceServiceError } from "@/modules/invoicing/invoice.service";

// POST /api/invoices/[id]/payments/[paymentId]/void
//
// Safe correction/refund path for a recorded payment. Never deletes the
// Payment row - see modules/invoicing/invoice.service.ts#voidPayment for
// why - it marks it voided (with who/when/why) and recalculates the
// invoice's amountPaid/status from the remaining active ledger, all in
// one transaction. Staff-only, same as every other invoice/payment
// mutation in this file tree.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; paymentId: string }> },
) {
  try {
    const user = await requireStaff();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { id, paymentId } = await params;

    let body: unknown = {};
    try {
      body = await request.json();
    } catch {
      // No body sent - voiding without a reason is allowed.
      body = {};
    }
    const parsed = voidPaymentSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validation failed", parsed.error.issues.map((issue) => issue.message), 400);
    }

    await connectToDatabase();

    const { payment, invoice } = await voidPayment(
      id,
      paymentId,
      user.name || user.email || undefined,
      parsed.data.reason,
      user.role === "admin" || user.role === "staff" ? user.role : "customer",
    );

    return apiSuccess(
      {
        payment: serializeDoc(payment.toObject()),
        invoice: serializeDoc(invoice.toObject()),
      },
      "Payment voided",
    );
  } catch (error) {
    const { message, status } = translateInvoiceServiceError(error);
    return apiError(message, [], status);
  }
}
