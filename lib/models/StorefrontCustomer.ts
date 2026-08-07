import mongoose, { Schema, type Document, type Model } from "mongoose";

/**
 * NOTE ON NAMING
 * ---------------
 * This app already has two other things that could plausibly be called
 * "Customer":
 *
 *  - `lib/models/User.ts` (`User`, collection `users`) — Sentinel
 *    staff/admin accounts, authenticated via the JWT system in
 *    `lib/auth.ts`. Not shoppers.
 *  - `lib/models/Customer.ts` (`Customer`, collection `customers`) — B2B
 *    business contacts used by the internal CRM (quotations/invoices).
 *    Not accounts anyone signs into.
 *
 * `StorefrontCustomer` is a third, new concept: a real person who created an
 * account on the public storefront (Google or email sign-in) to track their
 * own orders. It's namespaced as `StorefrontCustomer` / collection
 * `storefront_customers` specifically so it can never collide with either of
 * the above — both by Mongoose model name and by underlying Mongo collection
 * name (the Auth.js MongoDB adapter is configured with the same collection
 * name in `lib/customer-auth.ts`, since this model reads/writes the exact
 * documents the adapter creates on sign-in).
 *
 * The adapter itself owns creating/updating the core fields (`name`, `email`,
 * `emailVerified`, `image`) whenever someone signs in. This model exists so
 * the rest of the app (order linking, `/api/account/me`, populate() on
 * Cart/StoreOrder) has a typed, queryable view of the same collection.
 */

export interface IStorefrontCustomer extends Document {
  name?: string;
  email: string;
  emailVerified?: Date | null;
  image?: string;
  /** Delivery contact number, editable by the customer in /account/profile. */
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const storefrontCustomerSchema = new Schema<IStorefrontCustomer>(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    emailVerified: { type: Date, default: null },
    image: { type: String },
    phone: { type: String, trim: true },
  },
  {
    // The Auth.js MongoDB adapter writes its own `createdAt`/`updatedAt`-less
    // documents; Mongoose's `timestamps` option only sets these fields when
    // *this* model creates/updates a document, which is fine — it never
    // overwrites documents the adapter already wrote, it just adds the
    // fields going forward.
    timestamps: true,
    collection: "storefront_customers",
  },
);

storefrontCustomerSchema.index({ email: 1 }, { unique: true });

export const StorefrontCustomerModel: Model<IStorefrontCustomer> =
  mongoose.models.StorefrontCustomer ||
  mongoose.model<IStorefrontCustomer>("StorefrontCustomer", storefrontCustomerSchema);
