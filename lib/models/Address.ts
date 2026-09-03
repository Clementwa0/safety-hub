import mongoose, { Schema, type Document, type Model } from "mongoose";

/**
 * NOTE ON NAMING
 * ---------------
 * A saved address only makes sense for a signed-in storefront customer
 * (the `User` model, see `lib/models/User.ts` - stored in the
 * `storefront_customers` collection post-unification) - guests
 * never accumulate a reusable address book, they just type a one-off
 * shipping address at checkout (`StoreOrder.shippingAddress`). This model
 * is intentionally separate from that embedded checkout snapshot: it's the
 * customer's own saved book of addresses, always scoped to `customer`.
 */

export interface IAddress extends Document {
  customer: mongoose.Types.ObjectId;
  label?: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>(
  {
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    label: { type: String, trim: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

addressSchema.index({ customer: 1, createdAt: -1 });

export const AddressModel: Model<IAddress> =
  mongoose.models.Address || mongoose.model<IAddress>("Address", addressSchema);
