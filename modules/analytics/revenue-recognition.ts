import type { IOrder } from "@/lib/models/Order";
import type { IInvoice } from "@/lib/models/Invoice";
import type { IStoreOrder } from "@/lib/models/StoreOrder";

/**
 * THE authoritative revenue-recognition policy for the whole app.
 *
 * Before this module, "is this money recognized as revenue" was decided
 * in two different places that could (and did) disagree:
 *  - modules/analytics/sales-dashboard.ts computed it inline as
 *    "order delivered AND its invoice is paid" (B2B) / "store order
 *    delivered AND paid" (storefront).
 *  - app/api/admin/store-orders/stats/route.ts's `totalRevenue` used a
 *    much looser `{ paymentStatus: "paid" }` aggregate match — no
 *    delivery gate, and no explicit exclusion of a store order that was
 *    paid and *then* cancelled. A paid-but-not-yet-delivered (or
 *    paid-then-cancelled) order counted as "revenue" there while the
 *    dashboard correctly left it out, so the two screens showed two
 *    different numbers for the same underlying data.
 *
 * Every place in the app that needs to know whether a transaction
 * counts as recognized revenue — dashboards, reports, order
 * statistics, invoice statistics, sales analytics — must go through
 * the functions here instead of re-deriving the rule, so the numbers
 * can never drift apart again.
 *
 * POLICY (deliberately conservative — "delivered AND fully paid"):
 *  - B2B: an Order is revenue-recognized when its status is
 *    "delivered" AND the Invoice it's linked to has status "paid".
 *    An accepted quotation is not revenue. An issued invoice is not
 *    revenue. Even a paid invoice for goods that haven't shipped is
 *    not, on its own, revenue. A cancelled order or a cancelled/voided
 *    invoice is never revenue, by construction (cancelled invoices
 *    can't reach "paid" — see modules/invoicing/invoice.service.ts —
 *    and a cancelled order can't reach "delivered" — see
 *    modules/orders/order-status.ts).
 *  - Storefront: a StoreOrder is revenue-recognized when its status is
 *    "delivered" AND its paymentStatus is "paid". A cancelled order,
 *    or one that was paid and later refunded, is never revenue.
 *
 * A future finance configuration could swap this for accrual-on-invoice
 * or another policy; these functions (and their Mongo-aggregation
 * mirror, `STORE_ORDER_REVENUE_MATCH`) are the only places that would
 * need to change.
 */

/** True when a B2B Order + its (already resolved) Invoice count as recognized revenue. */
export function isB2BOrderRevenueRecognized(
  order: Pick<IOrder, "status" | "invoiceId">,
  invoice: Pick<IInvoice, "status"> | null | undefined,
): boolean {
  if (order.status !== "delivered" || !order.invoiceId) return false;
  return invoice?.status === "paid";
}

/** True when a storefront StoreOrder counts as recognized revenue. */
export function isStoreOrderRevenueRecognized(
  storeOrder: Pick<IStoreOrder, "status" | "paymentStatus">,
): boolean {
  return storeOrder.status === "delivered" && storeOrder.paymentStatus === "paid";
}

/**
 * The exact Mongo `$match` equivalent of `isStoreOrderRevenueRecognized`,
 * for callers that aggregate in the database rather than filtering an
 * already-loaded array in memory (e.g. the store-orders stats endpoint).
 * Kept in lockstep with the in-memory predicate above by
 * tests/modules/analytics/revenue-recognition.test.ts, which runs both
 * against the same fixtures and asserts they agree — so this can never
 * silently drift back into being a looser, different rule.
 */
export const STORE_ORDER_REVENUE_MATCH: Pick<Record<keyof IStoreOrder, unknown>, "status" | "paymentStatus"> = {
  status: "delivered",
  paymentStatus: "paid",
};
