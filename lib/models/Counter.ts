import mongoose, { Schema, type Document, type Model } from "mongoose";

/**
 * Generic atomic counter collection. One document per `key` (e.g. an
 * order-number sequence scoped to a year: "store-order-2026"). Incrementing
 * uses `findOneAndUpdate` with `$inc`, which MongoDB guarantees is atomic
 * even under concurrent requests — this is what keeps order numbers unique
 * without relying on retries or in-memory locks.
 */
export interface ICounter extends Document {
  key: string;
  seq: number;
}

const counterSchema = new Schema<ICounter>({
  key: { type: String, required: true, unique: true },
  seq: { type: Number, required: true, default: 0 },
});

export const CounterModel: Model<ICounter> =
  mongoose.models.Counter || mongoose.model<ICounter>("Counter", counterSchema);
