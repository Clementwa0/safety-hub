import type { LineItemDTO } from "@/lib/schemas/sales";
import type { IOrderLineItem, IOrder } from "@/lib/models/Order";

type OrderStatus = IOrder["status"];

/**
 * Commercial lines become historical once stock has shipped.  Keep this
 * rule independent of the HTTP handler so every mutation path can apply the
 * same lifecycle protection.
 */
export function areOrderItemsLocked(status: OrderStatus): boolean {
  return status === "shipped" || status === "delivered";
}

function optionalText(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

/**
 * Compares the persisted commercial snapshot with an incoming line-item
 * patch. Client-only fields and inventory bookkeeping are deliberately
 * excluded; every commercial field is included so price/name changes cannot
 * alter the historical order either.
 */
export function areOrderLineItemsUnchanged(
  existing: readonly IOrderLineItem[],
  requested: readonly LineItemDTO[],
): boolean {
  if (existing.length !== requested.length) return false;

  return existing.every((line, index) => {
    const next = requested[index];

    return (
      optionalText(line.productId) === optionalText(next.productId) &&
      line.name === next.name &&
      optionalText(line.description) === optionalText(next.description) &&
      optionalText(line.variantSku) === optionalText(next.variantSku) &&
      optionalText(line.size) === optionalText(next.size) &&
      line.quantity === next.quantity &&
      line.unitPrice === next.unitPrice &&
      (line.taxRate ?? 0) === next.taxRate &&
      (line.discount ?? 0) === next.discount
    );
  });
}
