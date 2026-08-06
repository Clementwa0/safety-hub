import { z } from "zod";

import { apiError, apiSuccess } from "@/lib/api";
import { auth } from "@/lib/customer-auth";
import { connectToDatabase } from "@/lib/db";
import { StorefrontCustomerModel } from "@/lib/models/StorefrontCustomer";
import type { AccountMe } from "@/types/account";

const updateSchema = z.object({
  phone: z
    .string()
    .trim()
    .max(30, "Phone number is too long")
    .regex(/^[0-9+()\s-]*$/, "Enter a valid phone number")
    .optional()
    .default(""),
});

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return apiError("Not signed in", [], 401);
    }

    await connectToDatabase();

    const customer = await StorefrontCustomerModel.findById(session.user.id)
      .select("phone")
      .lean();

    const payload: AccountMe = {
      id: session.user.id,
      name: session.user.name ?? null,
      email: session.user.email ?? null,
      image: session.user.image ?? null,
      phone: customer?.phone ?? null,
    };

    return apiSuccess(payload, "Authenticated");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Unable to load account", [], 500);
  }
}

/**
 * SSO accounts own name/email/avatar, so the only self-service editable
 * field is the delivery phone number.
 */
export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return apiError("Not signed in", [], 401);
    }

    const body = await request.json().catch(() => null);
    const parsed = updateSchema.safeParse(body ?? {});

    if (!parsed.success) {
      return apiError(
        "Invalid profile details",
        parsed.error.issues.map((issue) => issue.message),
        400,
      );
    }

    await connectToDatabase();

    const updated = await StorefrontCustomerModel.findByIdAndUpdate(
      session.user.id,
      { $set: { phone: parsed.data.phone } },
      { new: true },
    )
      .select("phone")
      .lean();

    const payload: AccountMe = {
      id: session.user.id,
      name: session.user.name ?? null,
      email: session.user.email ?? null,
      image: session.user.image ?? null,
      phone: updated?.phone ?? null,
    };

    return apiSuccess(payload, "Profile updated");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Unable to update profile", [], 500);
  }
}
