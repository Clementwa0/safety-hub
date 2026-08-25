import { z } from "zod";
import type { NextRequest } from "next/server";
import { apiError, apiSuccess, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { QuotationModel, type IQuotation } from "@/lib/models/Quotation";
import { CustomerModel } from "@/lib/models/Customer";
import { OrderModel } from "@/lib/models/Order";
import { ProductModel } from "@/lib/models/Product";
import { requireStaff } from "@/lib/auth";
import { lineItemSchema, customerInputSchema, isDateOrderValid } from "@/lib/schemas/sales";
import { findOrCreateCustomer } from "@/modules/customers/customers";
import { createWithDocumentNumber } from "@/lib/db/document-number";
import { snapshotLineItemAvailability } from "@/modules/inventory/availability";

const quotationSchema = z.object({
  customer: customerInputSchema.optional(),
  items: z.array(lineItemSchema).optional(),
  status: z.enum(["draft", "sent", "accepted", "rejected", "expired"]).optional(),
  issueDate: z.number().optional(),
  validUntil: z.number().optional(),
  notes: z.string().trim().optional(),
  terms: z.string().trim().optional(),
});

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireStaff();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { id } = await params;
    await connectToDatabase();
    const quotation = await QuotationModel.findById(id).populate("customer").lean();

    if (!quotation) {
      return apiError("Quotation not found", [], 404);
    }

    return apiSuccess(serializeDoc(quotation), "Quotation loaded");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load quotation", [], 500);
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
    const parsed = quotationSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Validation failed", parsed.error.issues.map((issue) => issue.message), 400);
    }

    await connectToDatabase();
    const quotation = await QuotationModel.findById(id);

    if (!quotation) {
      return apiError("Quotation not found", [], 404);
    }

    // A PATCH payload is partial - a request updating only `validUntil`
    // (or only `issueDate`) must still be checked against whichever of
    // the two isn't in this payload, taken from the existing document.
    // A Zod-level refine on the schema can't do this since it only ever
    // sees the (possibly one-sided) payload, never the stored document.
    const effectiveIssueDate = parsed.data.issueDate ?? quotation.issueDate.getTime();
    const effectiveValidUntil = parsed.data.validUntil ?? quotation.validUntil.getTime();

    if (!isDateOrderValid(effectiveIssueDate, effectiveValidUntil)) {
      return apiError("Validation failed", ["validUntil must be after issueDate"], 400);
    }

    if (parsed.data.customer) {
      if (typeof parsed.data.customer === "string") {
        const customer = await CustomerModel.findById(parsed.data.customer);
        if (!customer) {
          return apiError("Customer not found", [], 404);
        }
        quotation.customer = customer._id;
      } else {
        const customer = await findOrCreateCustomer(parsed.data.customer);
        quotation.customer = customer._id;
      }
    }

    // Items are re-snapshotted against live stock whenever they're
    // replaced wholesale via PATCH (e.g. the edit form re-submitting the
    // full line-item list) - a stale availableAtQuote from before the
    // edit would misrepresent what's available now. A PATCH that doesn't
    // touch items at all leaves the existing snapshot untouched.
    const items = parsed.data.items
      ? await snapshotLineItemAvailability(parsed.data.items)
      : undefined;

    Object.assign(quotation, parsed.data, {
      customer: quotation.customer,
      items: items ?? quotation.items,
      issueDate: parsed.data.issueDate ? new Date(parsed.data.issueDate) : quotation.issueDate,
      validUntil: parsed.data.validUntil ? new Date(parsed.data.validUntil) : quotation.validUntil,
    });
    await quotation.save();

    return apiSuccess(serializeDoc(quotation.toObject()), "Quotation updated");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update quotation", [], 500);
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
    const quotation = await QuotationModel.findByIdAndDelete(id);

    if (!quotation) {
      return apiError("Quotation not found", [], 404);
    }

    return apiSuccess(null, "Quotation deleted");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete quotation", [], 500);
  }
}

const postActionSchema = z.object({
  // Present + true only on the "Duplicate" action (see
  // services/sentinel/quotation.service.ts's duplicate() vs
  // convertToOrder() — both POST to this same endpoint). Absent/false
  // means "convert this quotation to a sales order", the original meaning
  // of a bare POST here (originally converted straight to an Invoice;
  // see convertQuotationToOrder's docstring for why that changed).
  duplicate: z.boolean().optional(),
});

async function duplicateQuotation(quotation: IQuotation) {
  // Preserve the original's validity window length (e.g. "valid for 30
  // days"), just re-anchored to today, rather than copying the original's
  // now-possibly-past validUntil date verbatim.
  const validityMs = Math.max(quotation.validUntil.getTime() - quotation.issueDate.getTime(), 0);
  const now = new Date();

  const copy = await createWithDocumentNumber(QuotationModel, "QUO", (number) => ({
    number,
    customer: quotation.customer,
    items: quotation.items,
    status: "draft",
    issueDate: now,
    validUntil: new Date(now.getTime() + validityMs),
    notes: quotation.notes,
    terms: quotation.terms,
    // orderId intentionally omitted — a duplicate is a fresh quotation,
    // never linked to the original's (or anyone's) order.
  }));

  return apiSuccess(serializeDoc(copy.toObject()), "Quotation duplicated");
}

/**
 * Converts an accepted Quotation into a Sales Order (`Order`, status
 * "confirmed", linked back via `quotationId`) - the step the Revenue
 * Dashboard's "Sales Order" pipeline stage reads from. This is also the
 * moment stock gets reserved: `Product.reserved` is incremented per line
 * so the quantity still shows as on-hand but no longer available to
 * quote/sell elsewhere, without touching `Product.stock` itself (stock
 * only decrements later, when the Order reaches "shipped" - see the
 * PATCH handler in app/api/orders/[id]/route.ts). The order is stamped
 * `reservedStock: true` so that handler knows this hold exists and needs
 * releasing/consuming, unlike an order created directly via POST
 * /api/orders. A quotation that's merely drafted or sent never reserves
 * anything.
 *
 * Idempotent the same way the old direct-to-invoice conversion was: if
 * an Order already exists for this quotation, it's returned as-is rather
 * than reserving stock a second time.
 */
async function convertQuotationToOrder(quotation: IQuotation) {
  if (quotation.status !== "accepted") {
    return apiError("Only accepted quotations can be converted to a sales order", [], 400);
  }

  const existingOrder = await OrderModel.findOne({ quotationId: quotation._id });
  if (existingOrder) {
    return apiSuccess(serializeDoc(existingOrder.toObject()), "Sales order already exists");
  }

  const order = await createWithDocumentNumber(OrderModel, "ORD", (number) => ({
    number,
    customer: quotation.customer,
    items: quotation.items,
    status: "confirmed",
    notes: quotation.notes,
    quotationId: quotation._id,
    reservedStock: true,
  }));

  const reservations = quotation.items
    .filter((item) => item.productId)
    .map((item) =>
      item.variantSku
        ? ProductModel.updateOne(
            { _id: item.productId },
            // Keep the parent-level rollup in sync too — $inc bypasses the
            // pre-validate hook in lib/models/Product.ts that normally sums
            // variant reserved up to the parent, so it has to be done here.
            { $inc: { "variants.$[v].reserved": item.quantity, reserved: item.quantity } },
            { arrayFilters: [{ "v.sku": item.variantSku }] },
          )
        : ProductModel.updateOne(
            { _id: item.productId },
            { $inc: { reserved: item.quantity } },
          ),
    );
  await Promise.all(reservations);

  quotation.orderId = order._id;
  await quotation.save();

  return apiSuccess(serializeDoc(order.toObject()), "Sales order created from quotation");
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireStaff();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { id } = await params;

    // Body is optional — convertToOrder() sends none at all, so an
    // empty body must not be treated as invalid JSON.
    let body: unknown = {};
    const raw = await request.text();
    if (raw) {
      try {
        body = JSON.parse(raw);
      } catch {
        return apiError("Invalid request body", [], 400);
      }
    }

    const parsed = postActionSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validation failed", parsed.error.issues.map((issue) => issue.message), 400);
    }

    await connectToDatabase();
    const quotation = await QuotationModel.findById(id);

    if (!quotation) {
      return apiError("Quotation not found", [], 404);
    }

    return parsed.data.duplicate
      ? await duplicateQuotation(quotation)
      : await convertQuotationToOrder(quotation);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to process quotation", [], 500);
  }
}
