import { z } from "zod";

/**
 * Single source of truth for a sales-document line item, shared by the
 * quotations, invoices, and orders API routes. Previously each route
 * defined its own copy of this schema, which had drifted from the
 * frontend's `LineItem` type (types/sentinel/sales.ts): the frontend
 * always sends `id` and sometimes `productId`, but the old schemas didn't
 * declare either field, so Zod silently stripped them before anything
 * touched Mongo.
 *
 * `id` is a client-side React key (see lib/sales.ts#createLineItem) - it's
 * accepted here so payloads validate cleanly, but it's never persisted;
 * Mongo assigns its own subdocument `_id`. `productId` *is* persisted, as
 * a loose reference back to the catalog product used to pre-fill the
 * line, when there was one - it's optional because custom/one-off lines
 * have no matching product.
 */
export const lineItemSchema = z.object({
  id: z.string().trim().optional(),
  productId: z.string().trim().optional(),
  name: z.string().trim().min(1),
  description: z.string().trim().optional(),
  // Set only when this line is a specific size/variant of a
  // variant-enabled product (see IProductVariant in lib/models/Product.ts).
  // Both are optional/undefined together for a simple product's line.
  variantSku: z.string().trim().optional(),
  size: z.string().trim().optional(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  // Percentages, not arbitrary multipliers - mirrors the 0-100 clamp
  // LineItemsEditor already applies client-side (Math.min(100, Math.max(0,
  // ...))). That clamp is a UX nicety only; without the matching bound
  // here, a direct API call could submit e.g. taxRate: 1000 or
  // discount: 500 and blow up the document's totals math, since nothing
  // downstream re-clamps these values before they're persisted or used
  // to compute line/document totals.
  taxRate: z.number().min(0).max(100).default(0),
  discount: z.number().min(0).max(100).default(0),
  // Optional client override of the fulfillment plan (e.g. the staff
  // member knows a "available" line actually needs procurement due to
  // lead time). `availableAtQuote` is deliberately NOT accepted here -
  // it's always computed server-side from live stock in
  // lib/server/availability.ts and any client-sent value is silently
  // stripped (the default Zod object behavior for unrecognized keys),
  // so a client can never fake its own availability snapshot.
  fulfillmentPlan: z.enum(["available", "partial", "procurement"]).optional(),
});

export type LineItemDTO = z.infer<typeof lineItemSchema>;

/**
 * The object shape of an inline (not-yet-a-record) customer, as submitted
 * by CustomerFields on the Quotation/Invoice/Order forms. Mirrors the
 * frontend's `Customer` type (types/sentinel/sales.ts).
 */
export const customerObjectSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().optional(),
  company: z.string().trim().optional(),
  address: z.string().trim().optional(),
});

export type CustomerObjectDTO = z.infer<typeof customerObjectSchema>;

/**
 * A sales-document's `customer` field: either an existing customer's id,
 * or inline details for a customer that may or may not exist yet (see
 * lib/server/customers.ts#findOrCreateCustomer for how those are
 * resolved).
 */
export const customerInputSchema = z.union([
  z.string().trim().min(1),
  customerObjectSchema,
]);

export type CustomerInputDTO = z.infer<typeof customerInputSchema>;

/**
 * Shared "the later date must actually be later" check for sales
 * documents (quotation issueDate/validUntil, invoice issueDate/dueDate).
 * Both dates are epoch millis, matching how the routes accept them.
 *
 * Used two ways:
 *  - On create, via `.refine()` directly on the create schema, since the
 *    full payload (or a sensible default for the earlier date) is always
 *    available there.
 *  - On update (PATCH), a Zod-level refine can't help: the payload is
 *    partial, so a request that only sends the later date (leaving the
 *    earlier one unchanged on the existing document) must be validated
 *    against that document's *current* value, not against `undefined`.
 *    Route handlers call this function directly after merging the parsed
 *    patch with the existing document's dates.
 */
export function isDateOrderValid(earlierMs: number, laterMs: number): boolean {
  return laterMs > earlierMs;
}
