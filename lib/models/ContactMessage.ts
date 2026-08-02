import mongoose, { Schema, type Document, type Model } from "mongoose";

export const CONTACT_MESSAGE_STATUSES = ["new", "read", "replied", "archived"] as const;

export type ContactMessageStatus = (typeof CONTACT_MESSAGE_STATUSES)[number];

export interface IContactMessage extends Document {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  createdAt: Date;
  updatedAt: Date;
}

const contactMessageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: CONTACT_MESSAGE_STATUSES,
      default: "new",
    },
  },
  {
    timestamps: true,
  },
);

contactMessageSchema.index({ status: 1, createdAt: -1 });
contactMessageSchema.index({ name: "text", email: "text", subject: "text", message: "text" });

export const ContactMessageModel: Model<IContactMessage> =
  mongoose.models.ContactMessage ||
  mongoose.model<IContactMessage>("ContactMessage", contactMessageSchema);
