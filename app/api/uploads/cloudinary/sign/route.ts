import { z } from "zod";
import type { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/lib/api";
import { requireStaff } from "@/lib/auth";
import { CLOUDINARY_FOLDERS } from "@/lib/cloudinary";
import { getCloudinaryServerConfig, signCloudinaryParams } from "@/lib/cloudinary/sign.server";

/**
 * Issues a short-lived signature so a staff member's browser can upload one
 * image directly to Cloudinary. Only the folder is caller-controlled, and it
 * must be one of our known module folders — an attacker can't smuggle in an
 * arbitrary path, transformation, or eager job.
 */
const signRequestSchema = z.object({
  folder: z.enum(["products", "categories", "banners", "testimonials"]),
});

export async function POST(request: NextRequest) {
  const staff = await requireStaff();
  if (!staff) {
    return apiError("You must be signed in as staff to upload images", [], 401);
  }

  let config;
  try {
    config = getCloudinaryServerConfig();
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Cloudinary not configured", [], 500);
  }

  const json = await request.json().catch(() => null);
  const parsed = signRequestSchema.safeParse(json);

  if (!parsed.success) {
    return apiError(
      "Validation failed",
      parsed.error.issues.map((issue) => issue.message),
      400,
    );
  }

  const folder = CLOUDINARY_FOLDERS[parsed.data.folder];
  const timestamp = Math.floor(Date.now() / 1000);

  // Everything signed here is also what the browser must send verbatim.
  const paramsToSign = { folder, timestamp };
  const signature = signCloudinaryParams(paramsToSign, config.apiSecret);

  return apiSuccess(
    {
      cloudName: config.cloudName,
      apiKey: config.apiKey,
      folder,
      timestamp,
      signature,
      uploadUrl: `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
    },
    "Upload signature issued",
  );
}
