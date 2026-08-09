import mongoose, { Schema, type Document, type Model } from "mongoose";

/**
 * Portal settings is a singleton — exactly one document, always looked up
 * by this fixed id, never created via user input. `findOneAndUpdate` with
 * `upsert: true` in the API route is what creates it on first write.
 */
export const SETTINGS_SINGLETON_ID = "portal-settings";

export interface ISettings extends Omit<Document, "_id"> {
  _id: string;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  whatsapp: string;
  currency: string;
  taxRate: number;
  shippingPolicy: string;
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    _id: { type: String, default: SETTINGS_SINGLETON_ID },
    companyName: { type: String, required: true, trim: true },
    contactEmail: { type: String, required: true, trim: true, lowercase: true },
    contactPhone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    whatsapp: { type: String, required: true, trim: true },
    currency: { type: String, required: true, trim: true, default: "KES" },
    taxRate: { type: Number, required: true, default: 0, min: 0, max: 100 },
    shippingPolicy: { type: String, required: true, trim: true, default: "" },
  },
  {
    timestamps: true,
    _id: false,
  },
);

export const SettingsModel: Model<ISettings> =
  mongoose.models.Settings || mongoose.model<ISettings>("Settings", settingsSchema);
