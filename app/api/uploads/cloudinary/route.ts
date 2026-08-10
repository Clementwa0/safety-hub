import { z } from "zod";
import type { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/lib/api";
import { requireStaff } from "@/lib/auth";
import { CLOUDINARY_FOLDERS } from "@/lib/cloudinary";
import { destroyCloudinaryAsset } from "@/lib/cloudinary/sign.server";

/**
 * Deletes one previously uploaded image from Cloudinary.
 *
 * The public_id is validated against our own folder prefixes so a staff
 * member can only delete assets this app uploaded — never something else in
 * the account (other products' originals, backups, unrelated media).
 */
const deleteSchema = z.object({
  publicId: z.string().trim().min(1).max(300),
});

const ALLOWED_PREFIXES = Object.values(CLOUDINARY_FOLDERS);

export async function DELETE(request: NextRequest) {
  const staff = await requireStaff();
  if (!staff) {
    return apiError("You must be signed in as staff to delete images", [], 401);
  }

  const json = await request.json().catch(() => null);
  const parsed = deleteSchema.safeParse(json);

  if (!parsed.success) {
    return apiError(
      "Validation failed",
      parsed.error.issues.map((issue) => issue.message),
      400,
    );
  }

  const { publicId } = parsed.data;

  if (publicId.includes("..") || !ALLOWED_PREFIXES.some((prefix) => publicId.startsWith(`${prefix}/`))) {
    return apiError("That image is not managed by this app", [], 403);
  }

  try {
    await destroyCloudinaryAsset(publicId);
    return apiSuccess({ publicId }, "Image deleted");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete image", [], 500);
  }
}
