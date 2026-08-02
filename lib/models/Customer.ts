import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ICustomer extends Document {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    address: { type: String, trim: true },
  },
  {
    timestamps: true,
  },
);

customerSchema.index({ name: "text", email: "text", company: "text" });

export const CustomerModel: Model<ICustomer> =
  mongoose.models.Customer || mongoose.model<ICustomer>("Customer", customerSchema);
