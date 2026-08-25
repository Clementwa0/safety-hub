import mongoose, { Schema, type Document, type Model } from "mongoose";

export type QuotationFulfillmentPlan = "available" | "partial" | "procurement";

export interface IQuotationLineItem {
  productId?: string;
  name: string;
  description?: string;
  /** Present only when this line is a specific size/variant of a
   *  variant-enabled product — matches `IProductVariant.sku`/`size` on the
   *  Product document. Absent for simple (non-variant) products. */
  variantSku?: string;
  size?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount: number;
  // Stock snapshot captured at quote time (see modules/inventory/availability.ts)
  // - not live inventory. A later stock change (a sale, a restock)
  // deliberately does not rewrite these once set, so a quotation always
  // reflects what was actually available when it was quoted. Both are
  // undefined for custom/one-off lines with no productId.
  availableAtQuote?: number;
  fulfillmentPlan?: QuotationFulfillmentPlan;
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
  // Set when an accepted quotation is converted to a Sales Order (see
  // convertQuotationToOrder in app/api/quotations/[id]/route.ts). Stock is
  // reserved at that point, not before - a quotation on its own never
  // touches Product.reserved. Quotations no longer convert directly to an
  // Invoice; that now happens one step later, from the Order.
  orderId?: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const quotationSchema = new Schema<IQuotation>(
  {
    number: { type: String, required: true, unique: true, trim: true },
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    items: [{
      productId: { type: String },
      name: { type: String, required: true },
      description: { type: String },
      variantSku: { type: String },
      size: { type: String },
      quantity: { type: Number, required: true, min: 1 },
      unitPrice: { type: Number, required: true, min: 0 },
      taxRate: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      availableAtQuote: { type: Number },
      fulfillmentPlan: { type: String, enum: ["available", "partial", "procurement"] },
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
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
  },
  {
    timestamps: true,
  },
);


export const QuotationModel: Model<IQuotation> =
  mongoose.models.Quotation || mongoose.model<IQuotation>("Quotation", quotationSchema);
