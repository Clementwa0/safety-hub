import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IQuotationLineItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount: number;
}

export interface IQuotation extends Document {
  number: string;
  customer: mongoose.Types.ObjectId | string;
  items: IQuotationLineItem[];
  status: "draft" | "sent" | "accepted" | "rejected" | "expired";
  issueDate: Date;
  validUntil: Date;
  notes?: string;
  terms?: string;
  invoiceId?: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const quotationSchema = new Schema<IQuotation>(
  {
    number: { type: String, required: true, unique: true, trim: true },
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    items: [{
      name: { type: String, required: true },
      description: { type: String },
      quantity: { type: Number, required: true, min: 1 },
      unitPrice: { type: Number, required: true, min: 0 },
      taxRate: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
    }],
    status: {
      type: String,
      enum: ["draft", "sent", "accepted", "rejected", "expired"],
      default: "draft",
    },
    issueDate: { type: Date, default: Date.now },
    validUntil: { type: Date, required: true },
    notes: { type: String },
    terms: { type: String },
    invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice" },
  },
  {
    timestamps: true,
  },
);

quotationSchema.index({ number: 1 });

export const QuotationModel: Model<IQuotation> =
  mongoose.models.Quotation || mongoose.model<IQuotation>("Quotation", quotationSchema);
