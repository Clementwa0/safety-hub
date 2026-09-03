import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IInvoiceLineItem {
  productId?: string;
  name: string;
  description?: string;
  /** Present only when this line is a specific size/variant of a
   *  variant-enabled product - matches `IProductVariant.sku`/`size` on the
   *  Product document. Absent for simple (non-variant) products. */
  variantSku?: string;
  size?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount: number;
}

export interface IInvoice extends Document {
  number: string;
  customer: mongoose.Types.ObjectId | string;
  items: IInvoiceLineItem[];
  status: "draft" | "unpaid" | "partially_paid" | "paid" | "overdue" | "cancelled";
  issueDate: Date;
  dueDate: Date;
  amountPaid: number;
  notes?: string;
  terms?: string;
  quotationId?: mongoose.Types.ObjectId | string;
  orderId?: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const invoiceSchema = new Schema<IInvoice>(
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
    }],
    status: {
      type: String,
      enum: ["draft", "unpaid", "partially_paid", "paid", "overdue", "cancelled"],
      default: "draft",
    },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    amountPaid: { type: Number, default: 0, min: 0 },
    notes: { type: String },
    terms: { type: String },
    quotationId: { type: Schema.Types.ObjectId, ref: "Quotation" },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
  },
  {
    timestamps: true,
  },
);


export const InvoiceModel: Model<IInvoice> =
  mongoose.models.Invoice || mongoose.model<IInvoice>("Invoice", invoiceSchema);
