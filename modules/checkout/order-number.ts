import mongoose from "mongoose";
import { CounterModel } from "@/lib/models/Counter";

/**
 * Generates the next order number for the current year, e.g. "ORD-2026-000001".
 *
 * Uniqueness under concurrency comes from `findOneAndUpdate`'s atomic `$inc` -
 * two requests hitting this at the same instant still get distinct, ordered
 * sequence numbers, no in-memory locking needed. When called inside a
 * transaction (`session` passed), the increment is part of that transaction,
 * so a rolled-back checkout doesn't burn a number permanently... though since
 * counters aren't rolled back by Mongo on abort in older drivers reliably in
 * all configurations, callers should not assume strict contiguity - only
 * uniqueness is guaranteed, which is all that matters for an order number.
 */
export async function getNextOrderNumber(session?: mongoose.ClientSession): Promise<string> {
  const year = new Date().getFullYear();
  const key = `store-order-${year}`;

  const counter = await CounterModel.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { returnDocument: "after", upsert: true, session },
  );

  const sequence = String(counter.seq).padStart(6, "0");
  return `ORD-${year}-${sequence}`;
}
