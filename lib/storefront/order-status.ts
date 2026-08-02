import type { StoreOrderStatus } from "@/lib/models/StoreOrder";

const FORWARD_FLOW: StoreOrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

const TERMINAL_STATUSES: StoreOrderStatus[] = ["delivered", "cancelled"];

/**
 * Returns null when the transition is allowed, or an error message when it
 * isn't. Rules:
 *  - Forward-only along pending -> confirmed -> processing -> shipped -> delivered.
 *  - No skipping ahead, no moving backward.
 *  - Cancellation is only allowed before an order ships.
 *  - `delivered` and `cancelled` are terminal — no further status changes.
 */
export function validateStatusTransition(
  current: StoreOrderStatus,
  next: StoreOrderStatus,
): string | null {
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
    return `Cannot skip statuses — move to "${FORWARD_FLOW[currentIndex + 1]}" first`;
  }

  return null;
}
