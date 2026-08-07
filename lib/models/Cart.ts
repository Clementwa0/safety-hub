// lib/models/Cart.ts
import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ICartItem {
  id: string;
  product: mongoose.Types.ObjectId;
  quantity: number;
}

export type CartUserModel = "User" | "StorefrontCustomer";

export interface ICart extends Document {
  user?: mongoose.Types.ObjectId;
  userModel?: CartUserModel;
  sessionId?: string;
  items: ICartItem[];
  abandonedEmailSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Helper to generate unique IDs for cart items
const generateCartItemId = (): string => {
  return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const cartItemSchema = new Schema<ICartItem>(
  {
    id: {
      type: String,
      required: true,
      default: generateCartItemId,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be greater than zero"],
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a whole number",
      },
    },
  },
  {
    _id: false,
  },
);

const cartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      refPath: "userModel",
      default: undefined,
    },
    userModel: {
      type: String,
      enum: ["User", "StorefrontCustomer"],
      default: undefined,
    },
    sessionId: {
      type: String,
      trim: true,
      default: undefined,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
    abandonedEmailSentAt: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: true,
  },
);

// Validation: Cart must belong to either a user or a guest session
cartSchema.pre("validate", async function validateCart() {
  if (!this.user && !this.sessionId) {
    throw new Error("Cart must belong to either a user or a guest session");
  }
});

// Indexes for uniqueness
cartSchema.index(
  { user: 1 },
  {
    unique: true,
    partialFilterExpression: { user: { $exists: true } },
  },
);

cartSchema.index(
  { sessionId: 1 },
  {
    unique: true,
    partialFilterExpression: { sessionId: { $exists: true } },
  },
);

export const CartModel: Model<ICart> =
  mongoose.models.Cart ?? mongoose.model<ICart>("Cart", cartSchema);