import mongoose from "mongoose";
import type { IOrder } from "@/lib/models/Order";

type OrderStatus = IOrder["status"];

const FORWARD_FLOW: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered"];

const TERMINAL_STATUSES: OrderStatus[] = ["delivered", "cancelled"];

/**
 * Same shape as modules/checkout/order-status.ts's validator, kept as its
 * own copy rather than shared: Order and StoreOrder are unrelated models
 * that happen to reuse the same status vocabulary, and diverging rules
 * later (e.g. Order needing an extra internal status) shouldn't be
 * blocked by a shared implementation.
 *
 * Returns null when the transition is allowed, or an error message when
 * it isn't. Rules:
 *  - Forward-only along pending -> confirmed -> processing -> shipped -> delivered.
 *  - No skipping ahead, no moving backward.
 *  - Cancellation is only allowed before an order ships (stock only ever
 *    leaves inventory at "shipped" - see app/api/orders/[id]/route.ts -
 *    so a pre-ship cancellation has nothing to restore, only a
 *    `reserved` hold to release).
 *  - `delivered` and `cancelled` are terminal - no further status changes.
 */
export function validateOrderStatusTransition(current: OrderStatus, next: OrderStatus): string | null {
  if (current === next) {
    return null;
  }

  if (TERMINAL_STATUSES.includes(current)) {
    return `Order is already ${current} and cannot be changed further`;
  }

  if (next === "cancelled") {
    if (current === "shipped") {
      return "Shipped orders can no longer be cancelled";
    }
    return null;
  }

  const currentIndex = FORWARD_FLOW.indexOf(current);
  const nextIndex = FORWARD_FLOW.indexOf(next);

  if (nextIndex === -1) {
    return `Invalid status: ${next}`;
  }

  if (nextIndex < currentIndex) {
    return `Cannot move an order from ${current} back to ${next}`;
  }

  if (nextIndex > currentIndex + 1) {
    return `Cannot skip statuses - move to "${FORWARD_FLOW[currentIndex + 1]}" first`;
  }

  return null;
}

/**
 * Only genuinely active sales orders are safe to physically remove. Once an
 * order has crossed into shipment/delivery or been cancelled, it becomes part of
 * the historical commercial record and must remain traceable.
 */
export function canDeleteOrderStatus(status: OrderStatus): boolean {
  return status === "pending" || status === "confirmed" || status === "processing";
}

export function canDeleteConvertedQuotation(quotation: { orderId?: string | null | mongoose.Types.ObjectId | undefined }): boolean {
  return !quotation.orderId;
}

export function canMutateCommercialReference(
  current: string | undefined,
  next: string | undefined,
): boolean {
  return !current || !next || current === next;
}
