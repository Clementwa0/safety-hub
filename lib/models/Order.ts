import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IOrderLineItem {
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
  /** Quantity currently held in inventory for this line. */
  reservedQuantity?: number;
}

export interface IOrder extends Document {
  number: string;
  customer: mongoose.Types.ObjectId | string;
  items: IOrderLineItem[];
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  notes?: string;
  quotationId?: mongoose.Types.ObjectId | string;
  invoiceId?: mongoose.Types.ObjectId | string;
  /** Guards against decrementing stock twice if "shipped" is somehow set more than once. */
  stockDecremented: boolean;
  /** True only when this Order came from convertQuotationToOrder, which placed a
   *  `Product.reserved` hold for its items. Direct-created orders (POST /api/orders)
   *  never reserve, so their "shipped" transition must decrement stock without also
   *  touching `reserved` — this flag is how that transition tells the two cases apart. */
  reservedStock: boolean;
  fulfillmentStatus: "AVAILABLE" | "PARTIALLY_AVAILABLE" | "BACKORDERED";
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
      variantSku: { type: String },
      size: { type: String },
      quantity: { type: Number, required: true, min: 1 },
      unitPrice: { type: Number, required: true, min: 0 },
      taxRate: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      reservedQuantity: { type: Number, min: 0 },
    }],
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    notes: { type: String },
    quotationId: { type: Schema.Types.ObjectId, ref: "Quotation" },
    invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice" },
    stockDecremented: { type: Boolean, default: false },
    reservedStock: { type: Boolean, default: false },
    fulfillmentStatus: {
      type: String,
      enum: ["AVAILABLE", "PARTIALLY_AVAILABLE", "BACKORDERED"],
      default: "AVAILABLE",
    },
  },
  {
    timestamps: true,
  },
);


export const OrderModel: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);
