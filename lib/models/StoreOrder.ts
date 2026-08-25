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
  /** Present only when the ordered line is a specific size/variant of a
   *  variant-enabled product — matches `IProductVariant.sku`/`size` on the
   *  Product document. Absent for simple (non-variant) products. */
  variantSku?: string;
  size?: string;
  image?: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface IStoreOrder extends Document {
  orderNumber: string;
  /** Refs `User` — the single identity collection post-unification (stored
   *  in the `storefront_customers` collection for compatibility). */
  user?: mongoose.Types.ObjectId;
  sessionId?: string;
  /** Refs the CRM `Customer` record matched/created at checkout via
   *  findOrCreateCustomer (see modules/checkout/checkout.ts) — separate from
   *  `user`, which is the storefront login identity, not the CRM contact.
   *  Optional only because orders placed before this linkage existed
   *  won't have it backfilled. */
  customerId?: mongoose.Types.ObjectId;

  items: IStoreOrderItem[];

  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;

  status: StoreOrderStatus;
  paymentStatus: StorePaymentStatus;
  /** Payment method the customer chose at checkout. Both M-Pesa and Cash
   *  on Delivery are available to guests as well as signed-in customers -
   *  a guest's order/payment ownership is tracked via `sessionId` below
   *  exactly the way a signed-in customer's is tracked via `user`. */
  paymentMethod: StorePaymentMethod;

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

  /** Guards against decrementing stock twice if "shipped" is somehow set more than once. */
  stockDecremented: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const storeOrderItemSchema = new Schema<IStoreOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    name: { type: String, required: true },
    slug: { type: String },
    sku: { type: String },
    variantSku: { type: String },
    size: { type: String },
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

    user: { type: Schema.Types.ObjectId, ref: "User" },
    sessionId: { type: String, trim: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },

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

    stockDecremented: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

storeOrderSchema.index({ orderNumber: 1 }, { unique: true });
// (user, createdAt): every ownership-scoped query (customerOrderFilter,
// the store-orders list/detail routes) filters by `user` then sorts by
// `createdAt` — this index satisfies both from the index alone. There's
// only one identity model now, so no second discriminator field is
// needed alongside `user`.
storeOrderSchema.index({ user: 1, createdAt: -1 });
storeOrderSchema.index({ sessionId: 1, createdAt: -1 });
storeOrderSchema.index({ customerId: 1, createdAt: -1 });
storeOrderSchema.index({ status: 1, createdAt: -1 });
storeOrderSchema.index({ paymentStatus: 1 });
storeOrderSchema.index({ "customer.email": 1 });
storeOrderSchema.index({ "customer.name": "text" });

export const StoreOrderModel: Model<IStoreOrder> =
  mongoose.models.StoreOrder ||
  mongoose.model<IStoreOrder>("StoreOrder", storeOrderSchema);
