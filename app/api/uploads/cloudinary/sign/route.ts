import { z } from "zod";
import type { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/lib/api";
import { requireStaff } from "@/lib/auth";
import { CLOUDINARY_FOLDERS, type CloudinaryFolderKey } from "@/lib/cloudinary";
import { getCloudinaryServerConfig, signCloudinaryParams } from "@/lib/cloudinary/sign.server";

const bodySchema = z.object({
  folder: z.enum(
    Object.keys(CLOUDINARY_FOLDERS) as [CloudinaryFolderKey, ...CloudinaryFolderKey[]],
  ),
});

/**
 * Staff-gated signature for direct-to-Cloudinary uploads (see
 * `useCloudinaryUpload`). The file itself never touches our servers -
 * we only hand back a short-lived signature the browser uses to PUT
 * straight at Cloudinary.
 */
export async function POST(request: NextRequest) {
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

    const { cloudName, apiKey, apiSecret } = getCloudinaryServerConfig();
    const folder = CLOUDINARY_FOLDERS[parsed.data.folder];
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = signCloudinaryParams({ folder, timestamp }, apiSecret);

    return apiSuccess({
      cloudName,
      apiKey,
      folder,
      timestamp,
      signature,
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to sign upload", [], 500);
  }
}
