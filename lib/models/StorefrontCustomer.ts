import mongoose, { Schema, type Document, type Model } from "mongoose";

/**
 * NOTE ON NAMING (UPDATED — this is now the single identity collection)
 * -----------------------------------------------------------------------
 * This model started out as "the storefront customer record" and has since
 * become the ONE identity collection for every person who can sign in to
 * this app — storefront shoppers *and* Sentinel staff/admin — following the
 * auth consolidation onto a single Auth.js instance. The Mongoose model
 * name (`StorefrontCustomer`) and collection name (`storefront_customers`)
 * were deliberately left unchanged rather than renamed:
 *
 *  - Every existing customer document, and every existing `ref`/`refPath`
 *    pointing at this model (see `lib/models/Cart.ts`,
 *    `lib/models/StoreOrder.ts`), keeps resolving without a rewrite.
 *  - The Auth.js MongoDB adapter (`lib/auth/index.ts`) is already
 *    configured to read/write this exact collection for Google/Facebook/
 *    email sign-in — nothing about that wiring needs to change.
 *
 * Migrated-in Sentinel staff/admin accounts (see
 * `scripts/admin/migrate-users-to-identity.ts`) live in this same
 * collection now, keeping their original `_id` so every existing
 * `StoreOrder`/`Cart` reference to a staff id stays valid.
 *
 * This is STILL a distinct concept from `lib/models/Customer.ts`
 * (`Customer`, collection `customers`) — that's a B2B CRM contact record
 * used by quotations/invoices, not an account anyone signs into, and is
 * intentionally untouched by this migration.
 */

export type IdentityRole = "customer" | "staff" | "admin";
export type IdentityStatus = "active" | "suspended";

export interface IStorefrontCustomer extends Document {
  name?: string;
  email: string;
  emailVerified?: Date | null;
  image?: string;
  /** Delivery contact number, editable by the customer in /account/profile. */
  phone?: string;
  /**
   * `"customer"` for everyone who signed up via Google/Facebook/email on
   * the storefront — the adapter's `createUser` event backfills this (see
   * lib/auth/index.ts) since the adapter itself doesn't set it.
   * `"staff"`/`"admin"` only ever come from the migration script or an
   * admin explicitly creating a Sentinel account — NEVER inferred from an
   * email address or domain.
   */
  role: IdentityRole;
  status: IdentityStatus;
  /**
   * bcrypt hash, set only for Credentials-provider (staff/admin) sign-in.
   * Storefront customers who only ever use Google/Facebook/email sign-in
   * have no password and can never authenticate via Credentials.
   */
  passwordHash?: string | null;
  /**
   * Enforces "one active session at a time" for staff/admin accounts only
   * (see lib/auth/session.ts and the `jwt` callback in lib/auth/config.ts).
   * Left undefined for ordinary customers, who are allowed concurrent
   * sessions across devices same as before.
   */
  activeSessionId?: string | null;
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
    role: { type: String, enum: ["customer", "staff", "admin"], default: "customer" },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    // `select: false` — never returned unless explicitly requested (same
    // pattern as the old lib/models/User.ts), so a stray `.lean()` spread
    // into a JSON response can't leak it.
    passwordHash: { type: String, select: false, default: null },
    activeSessionId: { type: String, select: false, default: null },
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

// Mirrors the single-admin constraint that used to live on lib/models/User.ts
// — preserved as-is so the migration doesn't loosen this guarantee.
storefrontCustomerSchema.pre("save", async function enforceSingleAdmin() {
  if (this.role !== "admin" || !(this.isNew || this.isModified("role"))) {
    return;
  }

  const existingAdmin = await StorefrontCustomerModel.findOne({
    role: "admin",
    _id: { $ne: this._id },
  }).lean();

  if (existingAdmin) {
    throw new Error("Only one admin account is allowed.");
  }
});

export const StorefrontCustomerModel: Model<IStorefrontCustomer> =
  mongoose.models.StorefrontCustomer ||
  mongoose.model<IStorefrontCustomer>("StorefrontCustomer", storefrontCustomerSchema);
