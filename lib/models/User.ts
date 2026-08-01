import mongoose, { Schema, type Document, type Model } from "mongoose";

export type UserRole = "admin" | "staff";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ["admin", "staff"],
      default: "staff",
    },
  },
  {
    timestamps: true,
  },
);

export const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);
