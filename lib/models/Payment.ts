import mongoose, { Schema, type Document, type Model } from "mongoose";

/**
 * A single recorded payment against an Invoice. This is the persistent
 * ledger the dashboard README flagged as missing: before this,
 * `Invoice.amountPaid` was a bare number staff edited by hand, with no
 * record of how or when any of it was actually collected.
 *
 * Payments are immutable once created (no PATCH/edit route) - if a
 * payment was recorded in error, the fix is to record an equal-and-
 * opposite adjustment or contact an admin directly, not to silently
 * rewrite history on a financial ledger. `invoiceId` is indexed since the
 * primary access pattern is "list payments for this invoice".
 */
export interface IPayment extends Document {
  invoiceId: mongoose.Types.ObjectId | string;
  amount: number;
  method: "cash" | "mpesa";
  reference?: string;
  date: Date;
  recordedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice", required: true, index: true },
    amount: { type: Number, required: true, min: 0.01 },
    method: { type: String, enum: ["cash", "mpesa"], required: true },
    // M-Pesa transaction code, receipt number, etc. Optional since cash
    // payments often have nothing to reference.
    reference: { type: String, trim: true },
    date: { type: Date, default: Date.now },
    // Name of the staff member who recorded the payment (from the
    // session at record-time) - kept as a plain string snapshot rather
    // than a populated ref so the ledger entry still reads correctly
    // even if that staff account is later renamed or removed.
    recordedBy: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  {
    timestamps: true,
  },
);

export const PaymentModel: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", paymentSchema);
