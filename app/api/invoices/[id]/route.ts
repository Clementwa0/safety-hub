import { z } from "zod";
import type { NextRequest } from "next/server";
import { apiError, apiSuccess, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { InvoiceModel } from "@/lib/models/Invoice";
import { CustomerModel } from "@/lib/models/Customer";
import { requireStaff } from "@/lib/auth";
import { lineItemSchema, customerInputSchema, isDateOrderValid } from "@/lib/schemas/sales";
import { findOrCreateCustomer } from "@/modules/customers/customers";
import { deleteDraftInvoice, translateInvoiceServiceError } from "@/modules/invoicing/invoice.service";
import { canEditInvoiceItems } from "@/modules/invoicing/invoice-status";

// "paid" and "partially_paid" are deliberately excluded here - those are
// derived exclusively from the Payment ledger via
// modules/invoicing/calculations.ts#calculatePaymentStatus and must never
// be settable directly (see the STAFF_SETTABLE_STATUSES check below). A
// client PATCHing status: "paid" without an actual payment would corrupt
// the invoice's own money math while lying to the sales dashboard, the
// PDF, and every other page that reads `invoice.status`. "overdue" is
// also excluded - it's a computed, not persisted, presentation state
// (see lib/sales.ts#effectiveInvoiceStatus); nothing in the app is meant
// to write it to the document.
const STAFF_SETTABLE_STATUSES = ["draft", "unpaid", "cancelled"] as const;

const invoiceSchema = z.object({
  customer: customerInputSchema.optional(),
  items: z.array(lineItemSchema).optional(),
  status: z.enum(STAFF_SETTABLE_STATUSES).optional(),
  issueDate: z.number().optional(),
  dueDate: z.number().optional(),
  // amountPaid is intentionally NOT accepted here (see the schema
  // omission - previously `z.number().nonnegative().optional()`). It's
  // exclusively derived from the Payment ledger via
  // POST/[id]/payments and POST/[id]/payments/[paymentId]/void; letting
  // a client PATCH it directly would let anyone silently rewrite the
  // financial ledger's total without a corresponding Payment row -
  // exactly the class of bug Priority 1 exists to close. If a request
  // body includes `amountPaid`, Zod's default "strip unknown keys"
  // behavior discards it, matching how `fulfillmentPlan` overrides are
  // already handled in lib/schemas/sales.ts.
  notes: z.string().trim().optional(),
  terms: z.string().trim().optional(),
  quotationId: z.string().trim().optional(),
  orderId: z.string().trim().optional(),
});

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireStaff();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { id } = await params;
    await connectToDatabase();
    const invoice = await InvoiceModel.findById(id).populate("customer").lean();

    if (!invoice) {
      return apiError("Invoice not found", [], 404);
    }

    return apiSuccess(serializeDoc(invoice), "Invoice loaded");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load invoice", [], 500);
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
    const parsed = invoiceSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Validation failed", parsed.error.issues.map((issue) => issue.message), 400);
    }

    await connectToDatabase();
    const invoice = await InvoiceModel.findById(id);

    if (!invoice) {
      return apiError("Invoice not found", [], 404);
    }

    // See the identical comment in quotations/[id]/route.ts's PATCH: a
    // partial payload has to be checked against whichever date isn't
    // included, taken from the existing document, not from `undefined`.
    const effectiveIssueDate = parsed.data.issueDate ?? invoice.issueDate.getTime();
    const effectiveDueDate = parsed.data.dueDate ?? invoice.dueDate.getTime();

    if (!isDateOrderValid(effectiveIssueDate, effectiveDueDate)) {
      return apiError("Validation failed", ["dueDate must be after issueDate"], 400);
    }

    // Guard the last gap this schema restriction alone doesn't close:
    // even limited to draft/unpaid/cancelled, setting status back to
    // "draft" or "unpaid" on an invoice that actually has money against
    // it would make the stored status lie about the real balance (the
    // ledger — Invoice.amountPaid — is unaffected by this PATCH, so the
    // two would silently disagree). Cancelling is unaffected by this
    // check: a partially paid invoice can still be cancelled, preserving
    // both its payment history and its true amountPaid.
    if (
      parsed.data.status &&
      parsed.data.status !== invoice.status &&
      (parsed.data.status === "draft" || parsed.data.status === "unpaid") &&
      invoice.amountPaid > 0
    ) {
      return apiError(
        "This invoice has recorded payments - void them first if you need to reset its status.",
        [],
        400,
      );
    }

    if (parsed.data.items && !canEditInvoiceItems(invoice.status)) {
      return apiError("Issued invoices cannot change their commercial line items", [], 400);
    }

    if (
      parsed.data.quotationId !== undefined &&
      invoice.quotationId &&
      String(invoice.quotationId) !== parsed.data.quotationId
    ) {
      return apiError("Invoice quotation references cannot be changed after issuance", [], 400);
    }

    if (
      parsed.data.orderId !== undefined &&
      invoice.orderId &&
      String(invoice.orderId) !== parsed.data.orderId
    ) {
      return apiError("Invoice order references cannot be changed after issuance", [], 400);
    }

    if (parsed.data.customer) {
      if (typeof parsed.data.customer === "string") {
        const customer = await CustomerModel.findById(parsed.data.customer);
        if (!customer) {
          return apiError("Customer not found", [], 404);
        }
        invoice.customer = customer._id;
      } else {
        const customer = await findOrCreateCustomer(parsed.data.customer);
        invoice.customer = customer._id;
      }
    }

    Object.assign(invoice, parsed.data, {
      customer: invoice.customer,
      issueDate: parsed.data.issueDate ? new Date(parsed.data.issueDate) : invoice.issueDate,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : invoice.dueDate,
    });
    await invoice.save();

    return apiSuccess(serializeDoc(invoice.toObject()), "Invoice updated");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update invoice", [], 500);
  }
}

// DELETE /api/invoices/[id]
//
// Only draft invoices with zero recorded payments can be physically
// deleted - a draft was never a real financial document (see the
// identical rule in the payments route, which refuses payments against
// drafts), so nothing about deleting one touches financial history.
// Every issued invoice (unpaid/partially_paid/paid/overdue) must instead
// be cancelled via `PATCH { status: "cancelled" }`, which preserves the
// invoice document and its full Payment history intact - only the
// status changes, nothing is destroyed. See
// modules/invoicing/invoice.service.ts#deleteDraftInvoice for the
// transactional check-and-delete (including the defensive orphaned-
// payments guard).
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireStaff();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { id } = await params;
    await connectToDatabase();

    await deleteDraftInvoice(id);

    return apiSuccess(null, "Invoice deleted");
  } catch (error) {
    const { message, status } = translateInvoiceServiceError(error);
    return apiError(message, [], status);
  }
}
