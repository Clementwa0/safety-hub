import { z } from "zod";
import type { NextRequest } from "next/server";
import { apiError, apiSuccess, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { InvoiceModel } from "@/lib/models/Invoice";
import { PaymentModel } from "@/lib/models/Payment";
import { requireStaff } from "@/lib/auth";

// Mirrors lib/sales.ts#computeTotals exactly. Reimplemented locally
// rather than imported because computeTotals is typed against the
// client-side `LineItem` shape (which requires a React-only `id`
// field); the persisted Mongoose invoice document here never has one.
// See the identical local copy in lib/server/sales-dashboard.ts - if
// lib/sales.ts changes, both of these need to change with it.
type MoneyItem = { quantity: number; unitPrice: number; taxRate: number; discount: number };

function invoiceTotal(items: MoneyItem[]): number {
  let sum = 0;
  for (const item of items) {
    const gross = item.quantity * item.unitPrice;
    const discounted = Math.max(0, gross - gross * (item.discount / 100));
    const tax = discounted * (item.taxRate / 100);
    sum += discounted + tax;
  }
  return sum;
}

const paymentSchema = z.object({
  amount: z.number().positive(),
  method: z.enum(["cash", "mpesa"]),
  reference: z.string().trim().optional(),
  date: z.number().optional(),
  notes: z.string().trim().optional(),
});

// GET /api/invoices/[id]/payments
//
// Payment history for one invoice, newest first - backs the "Record
// payment" panel on the invoice detail page.
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
// Records one payment against an invoice: creates the ledger entry,
// increments Invoice.amountPaid, and auto-transitions status the same
// way the dashboard already infers it (0 < paid < total -> partially
// paid, paid >= total -> paid). Overpayment is rejected outright rather
// than clamped or allowed through - a payment that doesn't fit the
// remaining balance almost always means the amount or the invoice is
// wrong, and silently accepting it would corrupt the ledger.
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
    const parsed = paymentSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Validation failed", parsed.error.issues.map((issue) => issue.message), 400);
    }

    await connectToDatabase();
    const invoice = await InvoiceModel.findById(id);

    if (!invoice) {
      return apiError("Invoice not found", [], 404);
    }

    if (invoice.status === "draft") {
      return apiError("Draft invoices can't take payments - send the invoice first", [], 400);
    }
    if (invoice.status === "cancelled") {
      return apiError("Cancelled invoices can't take payments", [], 400);
    }

    const total = invoiceTotal(invoice.items);
    const balance = Math.max(0, total - invoice.amountPaid);

    // Guard against float rounding (e.g. 999.9999999 vs 1000) producing a
    // false "overpayment" rejection on an exact final payment.
    const EPSILON = 0.01;
    if (parsed.data.amount - balance > EPSILON) {
      return apiError(
        `Payment of ${parsed.data.amount} exceeds the outstanding balance of ${balance.toFixed(2)}`,
        [],
        400,
      );
    }

    const payment = await PaymentModel.create({
      invoiceId: invoice._id,
      amount: parsed.data.amount,
      method: parsed.data.method,
      reference: parsed.data.reference,
      date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
      recordedBy: user.name || user.email || undefined,
      notes: parsed.data.notes,
    });

    invoice.amountPaid = Math.min(total, invoice.amountPaid + parsed.data.amount);
    invoice.status = invoice.amountPaid >= total ? "paid" : "partially_paid";
    await invoice.save();

    return apiSuccess(
      {
        payment: serializeDoc(payment.toObject()),
        invoice: serializeDoc(invoice.toObject()),
      },
      "Payment recorded",
    );
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to record payment", [], 500);
  }
}
