import mongoose, { Schema, type Document, type Model } from "mongoose";

export type ProductStatus =
  | "active"
  | "draft"
  | "out_of_stock"
  | "archived";

export interface IProductSpec {
  label: string;
  value: string;
}

export interface IProductVariant {
  sku: string;
  size: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  reserved: number;
  image?: string;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;

  category: mongoose.Types.ObjectId;
  subcategory?: string;

  brand?: string;
  sku?: string;

  price: number;
  compareAtPrice?: number;

  stock: number;
  // Units held against accepted-but-not-yet-invoiced Sales Orders (see
  // lib/server/availability.ts). `stock` is never decremented until an
  // Order is converted to an Invoice - until then, the quantity is only
  // "reserved", so it still counts toward on-hand inventory but not
  // toward what's available to quote/sell again. available = stock - reserved.
  reserved: number;
  status: ProductStatus;

  // Present only for variant products (e.g. sizes). When set and non-empty,
  // this array is the source of truth for stock/reserved/price/sku at the
  // variant level; the top-level `stock`/`reserved` fields are kept in sync
  // (sum of variants) so code that only knows about simple products keeps
  // working, but must not be written to directly for a variant product.
  variants: IProductVariant[];

  image: string;
  images: string[];

  featured: boolean;
  isNewArrival: boolean;

  features: string[];
  specs: IProductSpec[];

  weight?: string;
  dimensions?: string;
  warranty?: string;
  certifications: string[];

  createdAt: Date;
  updatedAt: Date;
}

const productSpecSchema = new Schema<IProductSpec>(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const productVariantSchema = new Schema<IProductVariant>(
  {
    sku: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    compareAtPrice: {
      type: Number,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    reserved: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    image: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  },
);

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    subcategory: {
      type: String,
      trim: true,
      default: "",
    },

    brand: {
      type: String,
      trim: true,
      default: "",
    },

    sku: {
      type: String,
      trim: true,
      default: "",
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    compareAtPrice: {
      type: Number,
      min: 0,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    reserved: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    variants: {
      type: [productVariantSchema],
      default: [],
    },

    status: {
      type: String,
      enum: ["active", "draft", "out_of_stock", "archived"],
      default: "active",
    },

    image: {
      type: String,
      default: "",
    },

    images: {
      type: [String],
      default: [],
    },

    featured: {
      type: Boolean,
      default: false,
    },

    isNewArrival: {
      type: Boolean,
      default: false,
    },

    features: {
      type: [String],
      default: [],
    },

    specs: {
      type: [productSpecSchema],
      default: [],
    },

    weight: {
      type: String,
      trim: true,
      default: "",
    },

    dimensions: {
      type: String,
      trim: true,
      default: "",
    },

    warranty: {
      type: String,
      trim: true,
      default: "",
    },

    certifications: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

// Keep variant SKUs/sizes unique within a product, keep reserved <= stock
// per variant, and roll the parent stock/reserved up to the sum of variant
// stock/reserved so any code that only reads the top-level fields (listing
// cards, legacy inventory reports) still sees a correct number.
productSchema.pre("validate", function preValidateVariants() {
  const product = this as unknown as IProduct;

  if (!Array.isArray(product.variants) || product.variants.length === 0) {
    return;
  }

  const seenSkus = new Set<string>();
  const seenSizes = new Set<string>();

  for (const variant of product.variants) {
    const sku = (variant.sku || "").trim().toUpperCase();
    const size = (variant.size || "").trim().toUpperCase();

    if (!sku) {
      throw new Error("Every variant requires a SKU.");
    }
    if (!size) {
      throw new Error("Every variant requires a size.");
    }
    if (seenSkus.has(sku)) {
      throw new Error(`Duplicate variant SKU "${variant.sku}" within this product.`);
    }
    if (seenSizes.has(size)) {
      throw new Error(`Duplicate variant size "${variant.size}" within this product.`);
    }
    seenSkus.add(sku);
    seenSizes.add(size);

    if (variant.reserved > variant.stock) {
      throw new Error(`Reserved quantity for size "${variant.size}" cannot exceed its stock.`);
    }
  }

  product.stock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
  product.reserved = product.variants.reduce((sum, v) => sum + (v.reserved || 0), 0);
});

productSchema.index({
  name: "text",
  description: "text",
  brand: "text",
  sku: "text",
});

productSchema.index({
  category: 1,
  status: 1,
});

export const ProductModel =
  mongoose.models.Product ||
  mongoose.model<IProduct>("Product", productSchema);