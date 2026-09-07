import mongoose from "mongoose";
import { releaseReservation, reserveStock } from "@/modules/inventory/inventory.service";

/**
 * The minimal shape `reconcileOrderInventory` needs from a commercial line
 * item. `IOrderLineItem` and the incoming `LineItemDTO` both satisfy this
 * structurally, so callers can pass either without adapting them first.
 */
export interface ReconciliationLineItem {
  productId?: string;
  variantSku?: string;
  quantity: number;
  /** Quantity currently held in inventory for this line, if any. */
  reservedQuantity?: number;
}

interface ReservationTarget {
  productId: string;
  variantSku?: string;
}

function reservationKey(productId: string, variantSku?: string): string {
  return `${productId}::${variantSku ?? ""}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Reconciles an order's `Product.reserved` holds when its line items are
 * edited pre-shipment. This is the ONLY place order-item edits should
 * touch inventory — the API route is expected to call this instead of
 * re-implementing any reserve/release logic itself.
 *
 * Only lines that reference a catalog product (`productId` set) hold a
 * reservation at all — custom/one-off lines are skipped, matching every
 * other inventory call site in this codebase (see app/api/orders/route.ts,
 * convertQuotationToOrder).
 *
 * Reservations are matched and diffed per (productId, variantSku) pair,
 * independent of array position, so every edit shape reduces to the same
 * two primitives (`reserveStock` / `releaseReservation`):
 *  - a pure quantity change (10 -> 20, 20 -> 10, 10 -> 0) adjusts the
 *    existing hold for that pair by exactly the requested delta,
 *  - swapping to a different product or variant releases the old pair's
 *    entire hold and reserves the new pair's hold as unrelated operations
 *    (there is no shared pool between two different products/variants),
 *  - a line removed from the order releases its full existing hold,
 *  - a newly added line reserves its full requested quantity,
 *  - several of the above at once are just several independent pairs
 *    processed in the same pass.
 *
 * Only the *change* in requested quantity is trued up against inventory —
 * a line that was already under-reserved (backordered) before this edit
 * and whose requested quantity is unchanged is left alone. That keeps an
 * edit to one line (or to a non-item field) from silently attempting to
 * fill an unrelated line's pre-existing backorder.
 *
 * Every mutation goes through the existing `reserveStock`/
 * `releaseReservation` primitives, so the `available = stock - reserved`
 * invariant and the "reservation can never push available below zero"
 * guarantee are enforced by the same atomic, filtered `updateOne` queries
 * used everywhere else — this function never writes to `Product` itself.
 *
 * `reserveStock` throws `InventoryError` (`INSUFFICIENT_STOCK`) the
 * instant a single increase can't be satisfied. Because every call here
 * shares the caller's transaction `session`, callers should run this
 * inside a `session.withTransaction(...)` block and let that error
 * propagate: MongoDB then rolls back every reserve/release already applied
 * in this pass (and anything else done earlier in the same transaction)
 * together, so there is never a partially-applied result to clean up by
 * hand.
 *
 * Returns the reservedQuantity that should be persisted on each
 * `newItems` entry, keyed by its index in that array. Only indices backed
 * by a real product (`productId` set) get an entry — callers should leave
 * a custom line's `reservedQuantity` alone (undefined) for any index not
 * present in the returned map.
 */
export async function reconcileOrderInventory(
  oldItems: readonly ReconciliationLineItem[],
  newItems: readonly ReconciliationLineItem[],
  session: mongoose.ClientSession,
): Promise<Map<number, number>> {
  const oldReservedByKey = new Map<string, number>();
  const oldQuantityByKey = new Map<string, number>();
  const targets = new Map<string, ReservationTarget>();

  for (const item of oldItems) {
    if (!item.productId) continue;
    const key = reservationKey(item.productId, item.variantSku);
    const reserved = item.reservedQuantity ?? item.quantity;
    oldReservedByKey.set(key, (oldReservedByKey.get(key) ?? 0) + reserved);
    oldQuantityByKey.set(key, (oldQuantityByKey.get(key) ?? 0) + item.quantity);
    targets.set(key, { productId: item.productId, variantSku: item.variantSku });
  }

  const newQuantityByKey = new Map<string, number>();
  const newIndicesByKey = new Map<string, number[]>();

  newItems.forEach((item, index) => {
    if (!item.productId) return;
    const key = reservationKey(item.productId, item.variantSku);
    newQuantityByKey.set(key, (newQuantityByKey.get(key) ?? 0) + item.quantity);
    const indices = newIndicesByKey.get(key);
    if (indices) {
      indices.push(index);
    } else {
      newIndicesByKey.set(key, [index]);
    }
    targets.set(key, { productId: item.productId, variantSku: item.variantSku });
  });

  const allKeys = new Set<string>([...oldReservedByKey.keys(), ...newQuantityByKey.keys()]);
  const result = new Map<number, number>();

  for (const key of allKeys) {
    const target = targets.get(key)!;
    const oldReserved = oldReservedByKey.get(key) ?? 0;
    const oldQuantity = oldQuantityByKey.get(key) ?? 0;
    const newQuantity = newQuantityByKey.get(key) ?? 0;

    // How much the requested quantity for this product/variant pair
    // changed, trued up against whatever is actually held today, and
    // clamped so the hold can never exceed what's now being requested
    // (or drop below zero).
    const requestedDelta = newQuantity - oldQuantity;
    const targetReserved = clamp(oldReserved + requestedDelta, 0, newQuantity);
    const reservationDelta = targetReserved - oldReserved;

    if (reservationDelta > 0) {
      await reserveStock({
        productId: target.productId,
        variantSku: target.variantSku,
        quantity: reservationDelta,
        session,
      });
    } else if (reservationDelta < 0) {
      await releaseReservation({
        productId: target.productId,
        variantSku: target.variantSku,
        quantity: -reservationDelta,
        session,
      });
    }

    const indices = newIndicesByKey.get(key);
    if (!indices || indices.length === 0) {
      // The line for this product/variant was removed entirely — its
      // hold has just been released above, nothing further to report.
      continue;
    }

    // The common case is one line per (productId, variantSku) pair, where
    // this just assigns `targetReserved` straight through. If the same
    // pair appears on more than one line, fill each line's own requested
    // quantity in order from the pooled reservation.
    let remaining = targetReserved;
    for (const index of indices) {
      const allocated = Math.min(remaining, newItems[index].quantity);
      result.set(index, allocated);
      remaining -= allocated;
    }
  }

  return result;
}
