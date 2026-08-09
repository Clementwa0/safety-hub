import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IOrderLineItem {
  productId?: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount: number;
}

export interface IOrder extends Document {
  number: string;
  customer: mongoose.Types.ObjectId | string;
  items: IOrderLineItem[];
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  notes?: string;
  quotationId?: mongoose.Types.ObjectId | string;
  invoiceId?: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    number: { type: String, required: true, unique: true, trim: true },
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    items: [{
      productId: { type: String },
      name: { type: String, required: true },
      description: { type: String },
      quantity: { type: Number, required: true, min: 1 },
      unitPrice: { type: Number, required: true, min: 0 },
      taxRate: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
    }],
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    notes: { type: String },
    quotationId: { type: Schema.Types.ObjectId, ref: "Quotation" },
    invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice" },
  },
  {
    timestamps: true,
  },
);


export const OrderModel: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);
