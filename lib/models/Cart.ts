import mongoose, {
  Schema,
  type Document,
  type Model,
} from "mongoose";

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
}

export type CartUserModel = "User" | "StorefrontCustomer";

export interface ICart extends Document {
  user?: mongoose.Types.ObjectId;
  /**
   * Which model `user` refers to: `"User"` for a staff/admin shopping while
   * signed into Sentinel (the original, pre-existing behavior), or
   * `"StorefrontCustomer"` for a signed-in storefront customer account.
   * Only meaningful when `user` is set. See `resolveCartIdentity` in
   * `lib/storefront/session.ts` for how this gets decided.
   */
  userModel?: CartUserModel;
  sessionId?: string;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>(
  {
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
      // `refPath` lets this same field point at either the staff `User`
      // model or the `StorefrontCustomer` model depending on `userModel`,
      // so `.populate("user")` resolves correctly either way.
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
  },
  {
    timestamps: true,
  },
);

/**
 * A cart must belong to either:
 * - an authenticated user
 * - a guest session
 *
 * It cannot belong to neither.
 */
cartSchema.pre("validate", async function validateCart() {
  if (!this.user && !this.sessionId) {
    throw new Error(
      "Cart must belong to either a user or a guest session",
    );
  }
});

/**
 * One cart per authenticated user.
 */
cartSchema.index(
  { user: 1 },
  {
    unique: true,
    partialFilterExpression: {
      user: {
        $exists: true,
      },
    },
  },
);

/**
 * One cart per guest session.
 */
cartSchema.index(
  { sessionId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      sessionId: {
        $exists: true,
      },
    },
  },
);

export const CartModel: Model<ICart> =
  mongoose.models.Cart ??
  mongoose.model<ICart>("Cart", cartSchema);
