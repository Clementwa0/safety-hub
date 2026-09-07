import mongoose, { type ClientSession } from "mongoose";

import { QuotationModel } from "@/lib/models/Quotation";
import { OrderModel } from "@/lib/models/Order";
import { InvoiceModel } from "@/lib/models/Invoice";

/**
 * Thrown by the assert* helpers below. `status` is the HTTP status the
 * calling route should translate this into — 404 when the referenced
 * document simply doesn't exist, 400 for a malformed id, 409 when it
 * exists but the relationship is invalid (wrong customer, or an attempt
 * to replace/break an already-established link). Kept as one error type
 * (rather than throwing raw strings, matching the `__TAG__` convention
 * used elsewhere) so every call site can catch this specific class
 * without string-matching.
 */
export class CommercialReferenceError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

function assertValidObjectId(id: string, label: string): void {
  if (!mongoose.isValidObjectId(id)) {
    throw new CommercialReferenceError(`Invalid ${label} reference`, 400);
  }
}

/**
 * Confirms a `quotationId` supplied on an Order or Invoice actually
 * refers to an existing Quotation that belongs to the same customer as
 * the document being created/updated. Used both when an Order/Invoice
 * first establishes a quotation link, and whenever the customer on a
 * document with an existing link is being changed (the link's customer
 * must keep agreeing with the document's customer).
 */
export async function assertQuotationBelongsToCustomer(
  quotationId: string,
  customerId: string | mongoose.Types.ObjectId,
  session?: ClientSession,
): Promise<void> {
  assertValidObjectId(quotationId, "quotation");
  const quotation = await QuotationModel.findById(quotationId).session(session ?? null);
  if (!quotation) {
    throw new CommercialReferenceError("Referenced quotation was not found", 404);
  }
  if (String(quotation.customer) !== String(customerId)) {
    throw new CommercialReferenceError(
      "Referenced quotation belongs to a different customer",
      409,
    );
  }
}

/** Same contract as {@link assertQuotationBelongsToCustomer}, for Order references. */
export async function assertOrderBelongsToCustomer(
  orderId: string,
  customerId: string | mongoose.Types.ObjectId,
  session?: ClientSession,
): Promise<void> {
  assertValidObjectId(orderId, "order");
  const order = await OrderModel.findById(orderId).session(session ?? null);
  if (!order) {
    throw new CommercialReferenceError("Referenced order was not found", 404);
  }
  if (String(order.customer) !== String(customerId)) {
    throw new CommercialReferenceError("Referenced order belongs to a different customer", 409);
  }
}

/** Same contract as {@link assertQuotationBelongsToCustomer}, for Invoice references. */
export async function assertInvoiceBelongsToCustomer(
  invoiceId: string,
  customerId: string | mongoose.Types.ObjectId,
  session?: ClientSession,
): Promise<void> {
  assertValidObjectId(invoiceId, "invoice");
  const invoice = await InvoiceModel.findById(invoiceId).session(session ?? null);
  if (!invoice) {
    throw new CommercialReferenceError("Referenced invoice was not found", 404);
  }
  if (String(invoice.customer) !== String(customerId)) {
    throw new CommercialReferenceError("Referenced invoice belongs to a different customer", 409);
  }
}

/** Maps a {@link CommercialReferenceError} (or any other error) to an HTTP response shape. */
export function translateCommercialReferenceError(error: unknown): { message: string; status: number } | null {
  if (error instanceof CommercialReferenceError) {
    return { message: error.message, status: error.status };
  }
  return null;
}
