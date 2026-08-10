import { ProductModel } from "@/lib/models/Product";
import type { IQuotationLineItem, QuotationFulfillmentPlan } from "@/lib/models/Quotation";
import type { LineItemDTO } from "@/lib/schemas/sales";

export interface ProductAvailability {
  productId: string;
  stock: number;
  reserved: number;
  available: number;
}

/**
 * Looks up live stock/reserved for a set of product ids and returns
 * available = stock - reserved (floored at 0 - reserved should never
 * exceed stock, but this guards against it rather than surfacing a
 * negative "available" number to staff).
 *
 * Ids that don't resolve to a real Product (deleted product, bad id) are
 * simply omitted from the result rather than throwing - callers treat a
 * missing entry as "unknown availability" for that line, same as a
 * custom/one-off line with no productId at all.
 */
export async function getProductAvailability(
  productIds: string[],
): Promise<Map<string, ProductAvailability>> {
  const uniqueIds = Array.from(new Set(productIds.filter(Boolean)));
  const result = new Map<string, ProductAvailability>();
  if (uniqueIds.length === 0) return result;

  const products = await ProductModel.find({ _id: { $in: uniqueIds } })
    .select("stock reserved")
    .lean<{ _id: unknown; stock: number; reserved: number }[]>();

  for (const product of products) {
    const id = String(product._id);
    const stock = product.stock ?? 0;
    const reserved = product.reserved ?? 0;
    result.set(id, {
      productId: id,
      stock,
      reserved,
      available: Math.max(0, stock - reserved),
    });
  }

  return result;
}

function planFor(requested: number, available: number): QuotationFulfillmentPlan {
  if (available >= requested) return "available";
  if (available > 0) return "partial";
  return "procurement";
}

/**
 * Stamps each line item with an `availableAtQuote`/`fulfillmentPlan`
 * snapshot from live stock, for lines that reference a real product.
 * Custom/one-off lines (no productId) and lines whose productId doesn't
 * resolve to a Product are passed through unchanged - there's no stock
 * concept for them.
 *
 * If the caller explicitly chose a `fulfillmentPlan` (e.g. overriding
 * "available" to "procurement" for a known lead-time reason), that
 * choice is preserved rather than overwritten by the computed default -
 * only `availableAtQuote` (the live number itself) is always recomputed,
 * since that's a fact, not a judgment call.
 */
export async function snapshotLineItemAvailability(
  items: LineItemDTO[],
): Promise<IQuotationLineItem[]> {
  const productIds = items
    .map((item) => item.productId)
    .filter((id): id is string => Boolean(id));

  const availability = await getProductAvailability(productIds);

  return items.map((item) => {
    if (!item.productId) return { ...item };
    const entry = availability.get(item.productId);
    if (!entry) return { ...item };

    return {
      ...item,
      availableAtQuote: entry.available,
      fulfillmentPlan: item.fulfillmentPlan ?? planFor(item.quantity, entry.available),
    };
  });
}
