import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { hashPassword, requireAdmin } from "@/lib/auth";
import { StorefrontCustomerModel } from "@/lib/models/StorefrontCustomer";
import { apiError, apiSuccess } from "@/lib/api";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.string().trim().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  role: z.enum(["admin", "staff"]).optional(),
});

/**
 * Creates a Sentinel (staff/admin) account, in the single unified identity
 * collection (`StorefrontCustomer` / `storefront_customers` — see that
 * model's header comment for why the name stayed the same post-migration).
 *
 * Writes here MUST land in `StorefrontCustomerModel`, not the old
 * `UserModel`: the Credentials provider in `lib/auth/config.ts` only ever
 * authenticates against `StorefrontCustomerModel`, so an account created
 * anywhere else could never sign in.
 *
 * No custom JWT is minted here anymore — Auth.js owns sessions entirely.
 * This route only ever creates the account; callers sign in afterward
 * through the normal `signIn("sentinel-credentials", ...)` flow with the
 * same credentials.
 *
 * Staff accounts are NOT self-service, and there is no anonymous path
 * here anymore: the caller must already be signed in as an admin, full
 * stop. Only an admin can create additional staff/admin accounts, via
 * this endpoint.
 *
 * This intentionally does NOT bootstrap the first admin — an anonymous
 * "create the admin if none exists yet" branch used to live here, but
 * that meant anyone who could reach this route before an admin was
 * provisioned (e.g. during deploy, or if the admin account was ever lost)
 * could create themselves an admin account. First-admin creation is
 * instead a deliberate, out-of-band operation: run
 * `npx tsx scripts/admin/create-admin.ts --name ... --email ... --password ...`
 * against the database directly. See that script for details.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        "Validation failed",
        parsed.error.issues.map((issue) => issue.message),
        400,
      );
    }

    const { name, email, password } = parsed.data;

    await connectToDatabase();

    const normalizedEmail = email.toLowerCase();

    const existingAccount = await StorefrontCustomerModel.findOne({
      email: normalizedEmail,
    });

    if (existingAccount) {
      return apiError("A user with this email already exists.", [], 409);
    }

    const requestingAdmin = await requireAdmin();

    if (!requestingAdmin) {
      return apiError(
        "Only an admin can create new staff accounts.",
        [],
        401,
      );
    }

    const role: "admin" | "staff" = parsed.data.role ?? "staff";

    const passwordHash = await hashPassword(password);

    let account;
    try {
      account = await StorefrontCustomerModel.create({
        name,
        email: normalizedEmail,
        passwordHash,
        role,
        status: "active",
      });
    } catch (createError) {
      if (createError instanceof Error && createError.message.includes("Only one admin account is allowed")) {
        return apiError("Only one admin account is allowed.", [], 409);
      }
      throw createError;
    }

    return apiSuccess(
      {
        user: {
          id: account._id.toString(),
          name: account.name,
          email: account.email,
          role: account.role,
          createdAt: account.createdAt,
          updatedAt: account.updatedAt,
        },
      },
      "Account created successfully.",
    );
  } catch (error) {
    console.error("Registration Error:", error);

    return apiError(
      "Something went wrong while creating your account.",
      [],
      500,
    );
  }
}
