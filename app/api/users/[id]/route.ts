import { z } from "zod";
import type { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { UserModel as StorefrontCustomerModel } from "@/lib/models/User";
import { hashPassword, requireAdmin, serializeUser } from "@/lib/auth";

const updateUserSchema = z.object({
  name: z.string().trim().min(2).optional(),
  status: z.enum(["active", "suspended"]).optional(),
  // Empty/omitted password means "leave it unchanged" - only hash and
  // save a new one when a non-empty value is actually sent.
  password: z.string().min(6).optional().or(z.literal("")),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return apiError("Unauthorized", [], 401);
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Validation failed", parsed.error.issues.map((issue) => issue.message), 400);
    }

    await connectToDatabase();
    // Scoped to role: admin/staff so this endpoint can't be used to edit
    // an ordinary storefront customer's account - they share the same
    // collection post-unification, but this is Sentinel user management.
    const user = await StorefrontCustomerModel.findOne({
      _id: id,
      role: { $in: ["admin", "staff"] },
    });

    if (!user) {
      return apiError("User not found", [], 404);
    }

    if (
      parsed.data.status &&
      user.role === "admin" &&
      parsed.data.status === "suspended"
    ) {
      return apiError("The admin account can't be suspended.", [], 400);
    }

    if (parsed.data.name) {
      user.name = parsed.data.name;
    }
    if (parsed.data.status) {
      user.status = parsed.data.status;
    }
    if (parsed.data.password) {
      user.passwordHash = await hashPassword(parsed.data.password);
    }

    await user.save();

    return apiSuccess(serializeUser(user.toObject()), "User updated");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update user", [], 500);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return apiError("Unauthorized", [], 401);
    }

    const { id } = await params;

    if (id === admin.id) {
      return apiError("You can't delete your own account while signed in.", [], 400);
    }

    await connectToDatabase();
    const user = await StorefrontCustomerModel.findOne({
      _id: id,
      role: { $in: ["admin", "staff"] },
    });

    if (!user) {
      return apiError("User not found", [], 404);
    }

    if (user.role === "admin") {
      return apiError("The admin account can't be deleted.", [], 400);
    }

    await user.deleteOne();

    return apiSuccess(null, "User deleted");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete user", [], 500);
  }
}
