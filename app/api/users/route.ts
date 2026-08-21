import { z } from "zod";
import type { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { UserModel as StorefrontCustomerModel } from "@/lib/models/User";
import { hashPassword, requireAdmin, serializeUser } from "@/lib/auth";

const createUserSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(6),
  role: z.enum(["staff"]),
});

/**
 * Sentinel user management. Reads/writes the same unified `UserModel`
 * (`storefront_customers` collection) as everything else — that
 * collection also holds ordinary storefront customers, who must never
 * show up in (or be created through) this list, so every query here is
 * scoped to `role: { $in: ["admin", "staff"] }`.
 *
 * There is EXACTLY ONE admin account system-wide (enforced at the model
 * layer in lib/models/User.ts), but any number of staff accounts. Staff
 * have the same Sentinel access as admin except Users, Settings, and
 * Reports (gated by requireAdmin() on those specific routes/pages).
 * This endpoint only ever creates `role: "staff"` — the admin account is
 * provisioned out of band via `scripts/admin/create-admin.ts` and can't
 * be created here. Only an already-authenticated admin can reach this
 * route (requireAdmin() below) — there's no anonymous bootstrap path.
 */
export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return apiError("Unauthorized", [], 401);
    }

    await connectToDatabase();
    const users = await StorefrontCustomerModel.find({
      role: { $in: ["admin", "staff"] },
    })
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

    const user = await StorefrontCustomerModel.create({
      name: parsed.data.name,
      email: normalizedEmail,
      passwordHash,
      role: parsed.data.role,
      status: "active",
    });

    return apiSuccess(serializeUser(user.toObject()), "Staff account created");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create user", [], 500);
  }
}
