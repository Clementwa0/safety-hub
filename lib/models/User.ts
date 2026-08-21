import mongoose, {
  Schema,
  type Document,
  type Model,
} from "mongoose";

export type UserRole = "customer" | "admin" | "staff";
export type UserStatus = "active" | "suspended";

export interface IUser extends Document {
  name?: string;
  email: string;
  emailVerified?: Date | null;
  image?: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  passwordHash?: string | null;
  activeSessionId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    emailVerified: {
      type: Date,
      default: null,
    },

    image: {
      type: String,
    },

    phone: {
      type: String,
      trim: true,
    },

    role: {
      type: String,
      enum: ["customer", "admin", "staff"],
      default: "customer",
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
      required: true,
    },

    passwordHash: {
      type: String,
      select: false,
      default: null,
    },

    activeSessionId: {
      type: String,
      select: false,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "storefront_customers",
  },
);

userSchema.index(
  { email: 1 },
  { unique: true },
);

userSchema.pre(
  "save",
  async function enforceSingleAdmin() {
    if (
      this.role !== "admin" ||
      !(this.isNew || this.isModified("role"))
    ) {
      return;
    }

    const existingAdmin = await UserModel.findOne({
      role: "admin",
      _id: { $ne: this._id },
    })
      .select("_id")
      .lean();

    if (existingAdmin) {
      throw new Error(
        "Only one Sentinel admin account is allowed.",
      );
    }
  },
);

userSchema.pre(
  "findOneAndUpdate",
  async function preventMultipleAdmins() {
    const update = this.getUpdate();

    if (!update || Array.isArray(update)) {
      return;
    }

    const updateDocument = update as {
      role?: UserRole;
      $set?: {
        role?: UserRole;
      };
    };

    const requestedRole =
      updateDocument.role ??
      updateDocument.$set?.role;

    if (requestedRole !== "admin") {
      return;
    }

    const currentDocument = await this.model
      .findOne(this.getQuery())
      .select("_id role")
      .lean();

    if (!currentDocument) {
      return;
    }

    if (currentDocument.role === "admin") {
      return;
    }

    const existingAdmin = await UserModel.findOne({
      role: "admin",
      _id: {
        $ne: currentDocument._id,
      },
    })
      .select("_id")
      .lean();

    if (existingAdmin) {
      throw new Error(
        "Only one Sentinel admin account is allowed.",
      );
    }
  },
);

export const UserModel: Model<IUser> =
  mongoose.models.User ||
  mongoose.model<IUser>("User", userSchema);
