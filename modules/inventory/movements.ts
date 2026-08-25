import mongoose from "mongoose";
import { MovementModel, type MovementType } from "@/lib/models/Movement";

/**
 * Records one Movement row. Callers pass the product's stock *after* the
 * $inc that caused this movement has already been applied, so
 * `resultingStock` is always accurate without a second read. Intentionally
 * not itself part of the caller's transaction/session in most call sites —
 * a Movement row failing to write should never roll back the stock change
 * that actually happened, since the row is a record of history, not a
 * source of truth for `Product.stock` itself.
 */
export async function recordMovement(params: {
  productId: mongoose.Types.ObjectId | string;
  type: MovementType;
  delta: number;
  resultingStock: number;
  reference?: string;
  session?: mongoose.ClientSession;
}) {
  await MovementModel.create(
    [
      {
        product: params.productId,
        type: params.type,
        delta: params.delta,
        resultingStock: params.resultingStock,
        reference: params.reference,
      },
    ],
    params.session ? { session: params.session } : undefined,
  );
}
