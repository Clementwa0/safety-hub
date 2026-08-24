import type { NextRequest } from "next/server";
import { apiError, apiSuccess, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { InvoiceModel } from "@/lib/models/Invoice";
import { PaymentModel } from "@/lib/models/Payment";
import { requireStaff } from "@/lib/auth";
import { recordPaymentSchema } from "@/lib/validation/payment";
import { recordPayment, translateInvoiceServiceError } from "@/modules/invoicing/invoice.service";

// GET /api/invoices/[id]/payments
//
// Payment history for one invoice, newest first - backs the "Record
// payment" panel on the invoice detail page. Includes voided payments
// (with their status) so the ledger reads as a complete, honest history
// rather than hiding corrections.
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireStaff();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { id } = await params;
    await connectToDatabase();

    const invoice = await InvoiceModel.findById(id).select("_id").lean();
    if (!invoice) {
      return apiError("Invoice not found", [], 404);
    }

    const payments = await PaymentModel.find({ invoiceId: id }).sort("-date").lean();

    return apiSuccess(payments.map((payment) => serializeDoc(payment)), "Payments loaded");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load payments", [], 500);
  }
}

// POST /api/invoices/[id]/payments
//
// Records one payment against an invoice inside a MongoDB transaction
// (see modules/invoicing/invoice.service.ts#recordPayment): reads the
// invoice's authoritative outstanding balance, validates the payment
// against it, creates the ledger entry, and updates
// Invoice.amountPaid/status, all atomically. Overpayment is rejected
// outright rather than clamped or allowed through - a payment that
// doesn't fit the remaining balance almost always means the amount or
// the invoice is wrong, and silently accepting it would corrupt the
// ledger. Concurrent requests against the same invoice can never both
// succeed past the invoice total - see the concurrency note on
// recordPayment itself.
//
// Cancelled/draft invoices can't take payments: draft isn't a real
// receivable yet, and a cancelled one has none outstanding by
// definition. Already-paid invoices are blocked for the same
// overpayment reason above (balance is 0, so anything positive would
// overshoot).
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireStaff();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = recordPaymentSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Validation failed", parsed.error.issues.map((issue) => issue.message), 400);
    }

    await connectToDatabase();

    const { payment, invoice } = await recordPayment(
      id,
      {
        amount: parsed.data.amount,
        method: parsed.data.method,
        reference: parsed.data.reference,
        date: parsed.data.date ? new Date(parsed.data.date) : undefined,
        notes: parsed.data.notes,
      },
      user.name || user.email || undefined,
    );

    return apiSuccess(
      {
        payment: serializeDoc(payment.toObject()),
        invoice: serializeDoc(invoice.toObject()),
      },
      "Payment recorded",
    );
  } catch (error) {
    const { message, status } = translateInvoiceServiceError(error);
    return apiError(message, [], status);
  }
}
