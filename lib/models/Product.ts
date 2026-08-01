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
  status: ProductStatus;

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