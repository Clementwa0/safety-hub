import mongoose, { Schema, type Document, type Model } from "mongoose";

/**
 * NOTE ON NAMING
 * ---------------
 * This codebase already has a `lib/models/Order.ts` — but that model backs
 * the internal Sentinel CRM (quotations -> orders -> invoices for
 * B2B "Customer" records) and is unrelated to the public storefront.
 * Renaming or repurposing it would break /sentinel/orders, /sentinel/quotations
 * and /sentinel/invoices. `StoreOrder` is the permanent record created by the
 * customer-facing Cart -> Checkout flow. It is intentionally separate.
 */

export type StoreOrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type StorePaymentStatus = "pending" | "paid" | "failed" | "refunded";

/** How the customer chose to pay at checkout. */
export type StorePaymentMethod = "mpesa" | "cod";

export const STORE_ORDER_STATUSES: StoreOrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export const STORE_PAYMENT_STATUSES: StorePaymentStatus[] = [
  "pending",
  "paid",
  "failed",
  "refunded",
];

export const STORE_PAYMENT_METHODS: StorePaymentMethod[] = ["mpesa", "cod"];

export interface IStoreOrderItem {
  product?: mongoose.Types.ObjectId;
  name: string;
  slug?: string;
  sku?: string;
  image?: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export type StoreOrderUserModel = "User" | "StorefrontCustomer";

export interface IStoreOrder extends Document {
  orderNumber: string;
  user?: mongoose.Types.ObjectId;
  /**
   * Which model `user` refers to — `"User"` for a staff/admin account,
   * `"StorefrontCustomer"` for a signed-in storefront customer. See
   * `lib/models/Cart.ts` for the same pattern and rationale.
   */
  userModel?: StoreOrderUserModel;
  sessionId?: string;

  items: IStoreOrderItem[];

  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;

  status: StoreOrderStatus;
  paymentStatus: StorePaymentStatus;
  /** Payment method the customer chose at checkout. M-Pesa requires the
   *  customer to be signed in (enforced client-side and re-validated on the
   *  server in `performCheckout`); Cash on Delivery is available to guests. */
  paymentMethod: StorePaymentMethod;

  /** Populated only for `paymentMethod: "mpesa"` orders — tracks the STK
   *  push lifecycle so the storefront can poll for and the callback route
   *  can record the outcome. */
  mpesa?: {
    phone?: string;
    merchantRequestId?: string;
    checkoutRequestId?: string;
    resultCode?: string;
    resultDesc?: string;
    receiptNumber?: string;
    transactionDate?: string;
    requestedAt?: Date;
  };

  customer: {
    name: string;
    email: string;
    phone: string;
  };

  shippingAddress: {
    address: string;
    city: string;
    country: string;
  };

  /** Guards against restoring stock twice if an order is cancelled. */
  stockRestored: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const storeOrderItemSchema = new Schema<IStoreOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    name: { type: String, required: true },
    slug: { type: String },
    sku: { type: String },
    image: { type: String },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const storeOrderSchema = new Schema<IStoreOrder>(
  {
    orderNumber: { type: String, required: true, trim: true },

    user: { type: Schema.Types.ObjectId, refPath: "userModel" },
    userModel: { type: String, enum: ["User", "StorefrontCustomer"] },
    sessionId: { type: String, trim: true },

    items: {
      type: [storeOrderItemSchema],
      required: true,
      validate: {
        validator: (items: IStoreOrderItem[]) => items.length > 0,
        message: "An order must have at least one item",
      },
    },

    subtotal: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, required: true, min: 0, default: 0 },
    tax: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: STORE_ORDER_STATUSES,
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: STORE_PAYMENT_STATUSES,
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: STORE_PAYMENT_METHODS,
      required: true,
      default: "cod",
    },

    mpesa: {
      type: new Schema(
        {
          phone: { type: String, trim: true },
          merchantRequestId: { type: String, trim: true },
          checkoutRequestId: { type: String, trim: true },
          resultCode: { type: String, trim: true },
          resultDesc: { type: String, trim: true },
          receiptNumber: { type: String, trim: true },
          transactionDate: { type: String, trim: true },
          requestedAt: { type: Date },
        },
        { _id: false },
      ),
      required: false,
    },

    customer: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      phone: { type: String, required: true, trim: true },
    },

    shippingAddress: {
      address: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
    },

    stockRestored: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

storeOrderSchema.index({ orderNumber: 1 }, { unique: true });
storeOrderSchema.index({ user: 1, createdAt: -1 });
storeOrderSchema.index({ sessionId: 1, createdAt: -1 });
storeOrderSchema.index({ status: 1, createdAt: -1 });
storeOrderSchema.index({ paymentStatus: 1 });
storeOrderSchema.index({ "customer.email": 1 });
storeOrderSchema.index({ "customer.name": "text" });
storeOrderSchema.index(
  { "mpesa.checkoutRequestId": 1 },
  { unique: true, partialFilterExpression: { "mpesa.checkoutRequestId": { $exists: true } } },
);

export const StoreOrderModel: Model<IStoreOrder> =
  mongoose.models.StoreOrder ||
  mongoose.model<IStoreOrder>("StoreOrder", storeOrderSchema);
