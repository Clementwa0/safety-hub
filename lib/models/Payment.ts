import mongoose, { Schema, type Document, type Model } from "mongoose";

/**
 * A single recorded payment against either an Invoice (B2B) or a
 * StoreOrder (storefront). This is the persistent ledger the dashboard
 * README flagged as missing: before this, `Invoice.amountPaid` was a
 * bare number staff edited by hand, with no record of how or when any
 * of it was actually collected — and `StoreOrder.paymentStatus` had no
 * ledger backing it at all.
 *
 * Exactly one of `invoiceId` / `storeOrderId` is set on every document
 * (enforced by the pre-validate hook below) — this is one ledger
 * collection shared by both money flows rather than two parallel ones,
 * so a payment-integrity rule (never delete, dedupe external
 * references, one source of truth for "active" vs "voided") only has
 * to be written once and can't drift between the two.
 *
 * Payments are never destructively deleted — there is no DELETE route.
 * If a payment was recorded in error, or needs to be refunded, it's
 * voided instead (`status: "voided"`, plus `voidedAt`/`voidedBy`/
 * `voidReason`): the row stays in the ledger forever as a historical
 * record, it just stops counting toward the invoice's/order's active
 * paid total (see modules/invoicing/calculations.ts#sumActivePayments,
 * invoice.service.ts#voidPayment, and
 * modules/payments/store-order-payment.service.ts#refundStoreOrderPayment).
 * `invoiceId`/`storeOrderId` are indexed since the primary access
 * pattern is "list payments for this invoice/order".
 *
 * `reference` (the external transaction reference — an M-Pesa code, a
 * bank slip number, etc.) is uniquely indexed while a payment is
 * `"recorded"` so the same real-world transaction can never be entered
 * twice, whether against the same invoice/order or two different ones.
 * The index is partial (scoped to `status: "recorded"`) so a voided
 * entry — which was never a real transaction, or has since been
 * corrected — doesn't permanently squat on that reference.
 */
export interface IPayment extends Document {
  invoiceId?: mongoose.Types.ObjectId | string;
  storeOrderId?: mongoose.Types.ObjectId | string;
  amount: number;
  method: "cash" | "mpesa" | "cod";
  reference?: string;
  date: Date;
  recordedBy?: string;
  notes?: string;
  status: "recorded" | "voided";
  voidedAt?: Date;
  voidedBy?: string;
  voidReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    // Not `required: true` at the schema level any more — exactly one
    // of invoiceId/storeOrderId is required, which Mongoose's
    // declarative `required` can't express across two fields. See the
    // pre-validate hook below for the actual enforcement.
    invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice", index: true },
    storeOrderId: { type: Schema.Types.ObjectId, ref: "StoreOrder", index: true },
    amount: { type: Number, required: true, min: 0.01 },
    method: { type: String, enum: ["cash", "mpesa", "cod"], required: true },
    // M-Pesa transaction code, bank slip number, etc. Optional since cash
    // payments often have nothing to reference.
    reference: { type: String, trim: true },
    date: { type: Date, default: Date.now },
    // Name of the staff member who recorded the payment (from the
    // session at record-time) - kept as a plain string snapshot rather
    // than a populated ref so the ledger entry still reads correctly
    // even if that staff account is later renamed or removed.
    recordedBy: { type: String, trim: true },
    notes: { type: String, trim: true },
    // "recorded" (active, counts toward the invoice/order's paid total)
    // or "voided" (kept for history, no longer counted). See the class
    // doc comment.
    status: { type: String, enum: ["recorded", "voided"], default: "recorded", index: true },
    voidedAt: { type: Date },
    // Same snapshot-string convention as recordedBy, for the same reason.
    voidedBy: { type: String, trim: true },
    voidReason: { type: String, trim: true },
  },
  {
    timestamps: true,
  },
);

paymentSchema.pre("validate", async function preValidate() {
  const hasInvoice = Boolean(this.invoiceId);
  const hasStoreOrder = Boolean(this.storeOrderId);

  if (hasInvoice === hasStoreOrder) {
    throw new Error(
      "A Payment must reference exactly one of invoiceId or storeOrderId, never both or neither",
    );
  }
});

// Dedupes external transaction references (an M-Pesa code, a bank slip
// number, ...) across the *entire* ledger — invoice payments and store
// order payments share this one uniqueness rule, since the same
// real-world transaction can't have paid for two different things.
// Partial + scoped to "recorded" so a voided/corrected entry frees its
// reference back up. Cash/COD payments routinely have no reference at
// all, so the index only applies once `reference` is an actual string.
paymentSchema.index(
  { reference: 1 },
  {
    unique: true,
    partialFilterExpression: { reference: { $type: "string" }, status: "recorded" },
  },
);

export const PaymentModel: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", paymentSchema);
