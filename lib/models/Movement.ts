import mongoose, { Schema, type Document, type Model } from "mongoose";

/**
 * An append-only ledger of actual `Product.stock` changes - never
 * `Product.reserved` changes, since a reservation being placed or
 * released isn't stock leaving or entering inventory, just stock being
 * spoken for. Only three things ever write here:
 *  - a manual stock edit (Inventory page or the product edit form)
 *  - a `StoreOrder` reaching "shipped" (see app/api/admin/store-orders/[id]/route.ts)
 *  - a Sentinel `Order` reaching "shipped" (see app/api/orders/[id]/route.ts)
 */
export type MovementType = "manual_adjustment" | "order_shipped" | "store_order_shipped";

export interface IMovement extends Document {
  product: mongoose.Types.ObjectId;
  type: MovementType;
  /** Positive = stock increased, negative = stock decreased. */
  delta: number;
  /** Product.stock immediately after this movement was applied. */
  resultingStock: number;
  /** Human-readable order number / reference, e.g. "ORD-0042". Omitted for manual adjustments. */
  reference?: string;
  createdAt: Date;
}

const movementSchema = new Schema<IMovement>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    type: {
      type: String,
      enum: ["manual_adjustment", "order_shipped", "store_order_shipped"],
      required: true,
    },
    delta: { type: Number, required: true },
    resultingStock: { type: Number, required: true, min: 0 },
    reference: { type: String, trim: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

movementSchema.index({ createdAt: -1 });
movementSchema.index({ product: 1, createdAt: -1 });

export const MovementModel: Model<IMovement> =
  mongoose.models.Movement || mongoose.model<IMovement>("Movement", movementSchema);
