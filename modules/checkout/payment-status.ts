import type { StorePaymentStatus } from "@/lib/models/StoreOrder";

/**
 * Allowed next-states for each current payment status. Mirrors the shape
 * of `validateStatusTransition` in `order-status.ts`, but for
 * `paymentStatus` specifically.
 *
 * Rules:
 *  - `pending` -> `paid` or `failed` (the normal outcomes of a payment
 *    attempt), or stays `pending` (e.g. a status poll that hasn't
 *    resolved yet).
 *  - `failed` -> `pending` (customer/staff retries the payment) or `paid`
 *    (a late confirmation — e.g. staff reconciling a manual Paybill/Till
 *    payment against the M-Pesa statement after initially marking it
 *    failed).
 *  - `paid` -> `refunded` only. A paid order can never silently become
 *    unpaid again through a status edit — that would hide money that was
 *    actually received. Refunds are the only way out of `paid`.
 *  - `refunded` is terminal — no further transitions.
 */
const ALLOWED_TRANSITIONS: Record<StorePaymentStatus, StorePaymentStatus[]> = {
  pending: ["pending", "paid", "failed"],
  failed: ["failed", "pending", "paid"],
  paid: ["paid", "refunded"],
  refunded: ["refunded"],
};

/**
 * Returns null when the transition is allowed, or an error message when
 * it isn't.
 */
export function validatePaymentStatusTransition(
  current: StorePaymentStatus,
  next: StorePaymentStatus,
): string | null {
  if (current === next) {
    return null;
  }

  const allowed = ALLOWED_TRANSITIONS[current];

  if (!allowed?.includes(next)) {
    return `Cannot change payment status from "${current}" to "${next}"`;
  }

  return null;
}
