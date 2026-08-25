export function ownerFilter(
  userId: string,
  extra: Record<string, unknown> = {},
): Record<string, unknown> {
  return { ...extra, user: userId };
}

export function customerOrderFilter(
  customerId: string,
  extra: Record<string, unknown> = {},
): Record<string, unknown> {
  // There's a single identity model now, so `user` alone (no second
  // discriminator field) is enough to scope to this customer's orders.
  return { ...extra, user: customerId };
}

export function orderBelongsToCustomer(
  order: { user?: unknown },
  customerId: string,
): boolean {
  return order.user != null && String(order.user) === customerId;
}