import { z } from "zod";
import type { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { StorefrontCustomerModel } from "@/lib/models/StorefrontCustomer";
import { hashPassword, requireAdmin, serializeUser } from "@/lib/auth";

const createUserSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(6),
  role: z.enum(["admin", "staff"]),
});

/**
 * Sentinel team management — admin-only. Reads/writes the same unified
 * `StorefrontCustomer` collection as everything else post-consolidation,
 * scoped to `role: staff|admin` — that collection also holds ordinary
 * storefront customers, who must never show up in (or be created through)
 * this list. Same as `/api/auth/register`, every account created here is
 * created by an already-authenticated admin — there is no anonymous
 * bootstrap path on either route; the first admin is provisioned out of
 * band via `scripts/admin/create-admin.ts`.
 */
export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return apiError("Unauthorized", [], 401);
    }

    await connectToDatabase();
    const users = await StorefrontCustomerModel.find({ role: { $in: ["admin", "staff"] } })
      .sort("-createdAt")
      .lean();

    return apiSuccess({ items: users.map((user) => serializeUser(user)) }, "Users loaded");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load users", [], 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return apiError("Unauthorized", [], 401);
    }

    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Validation failed", parsed.error.issues.map((issue) => issue.message), 400);
    }

    await connectToDatabase();

    const normalizedEmail = parsed.data.email.toLowerCase();
    const existing = await StorefrontCustomerModel.findOne({ email: normalizedEmail });

    if (existing) {
      return apiError("A user with this email already exists.", [], 409);
    }

    const passwordHash = await hashPassword(parsed.data.password);

    let user;
    try {
      user = await StorefrontCustomerModel.create({
        name: parsed.data.name,
        email: normalizedEmail,
        passwordHash,
        role: parsed.data.role,
        status: "active",
      });
    } catch (createError) {
      if (createError instanceof Error && createError.message.includes("Only one admin account is allowed")) {
        return apiError("Only one admin account is allowed.", [], 409);
      }
      throw createError;
    }

    return apiSuccess(serializeUser(user.toObject()), "User created");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create user", [], 500);
  }
}
