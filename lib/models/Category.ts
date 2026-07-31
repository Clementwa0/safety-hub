import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description: string;
  image?: string;
  subcategories: string[];
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    subcategories: { type: [String], default: [] },
  },
  {
    timestamps: true,
  },
);

export const CategoryModel: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>("Category", categorySchema);
