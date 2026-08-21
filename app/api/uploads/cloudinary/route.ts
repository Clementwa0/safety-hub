import { z } from "zod";
import type { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/lib/api";
import { requireStaff } from "@/lib/auth";
import { destroyCloudinaryAsset } from "@/lib/cloudinary/sign.server";

const bodySchema = z.object({
  publicId: z.string().trim().min(1),
});

/**
 * Best-effort cleanup for `CloudinaryImageField`'s "Remove" action — deletes
 * an asset we own by public_id when a staff member clears or replaces an
 * image, so orphaned uploads don't pile up in the Cloudinary media library.
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireStaff();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const body = await request.json();
    const parsed = bodySchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Validation failed", parsed.error.issues.map((issue) => issue.message), 400);
    }

    await destroyCloudinaryAsset(parsed.data.publicId);

    return apiSuccess({ deleted: true });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete asset", [], 500);
  }
}
