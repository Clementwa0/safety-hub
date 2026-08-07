import type { StoreOrderUserModel } from "@/lib/models/StoreOrder";

export function ownerFilter(
  userId: string,
  userModel: StoreOrderUserModel,
  extra: Record<string, unknown> = {},
): Record<string, unknown> {
  return { ...extra, user: userId, userModel };
}

export function customerOrderFilter(
  customerId: string,
  extra: Record<string, unknown> = {},
): Record<string, unknown> {
  // Matches orders explicitly owned by a StorefrontCustomer, and legacy
  // orders where `userModel` was never backfilled (missing/null). Querying
  // for `null` in MongoDB matches both explicit null and a missing field.
  // "User" (staff) is never matched. Run `scripts/audit-order-ownership.ts
  // --fix` to backfill legacy orders so this can later be tightened to an
  // exact match.
  return { ...extra, user: customerId, userModel: { $in: ["StorefrontCustomer", null] } };
}


export function orderBelongsToCustomer(
  order: { user?: unknown; userModel?: string | null },
  customerId: string,
): boolean {
  return (
    order.userModel !== "User" &&
    order.user != null &&
    String(order.user) === customerId
  );
}