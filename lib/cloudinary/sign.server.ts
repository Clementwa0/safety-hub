import crypto from "node:crypto";


export interface CloudinaryServerConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export function getCloudinaryServerConfig(): CloudinaryServerConfig {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim() ?? "";
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim() ?? "";
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim() ?? "";

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.",
    );
  }

  return { cloudName, apiKey, apiSecret };
}


export function signCloudinaryParams(
  params: Record<string, string | number>,
  apiSecret: string,
): string {
  const toSign = Object.keys(params)
    .filter((key) => params[key] !== "" && params[key] !== undefined)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto.createHash("sha1").update(`${toSign}${apiSecret}`).digest("hex");
}

/** Permanently removes an asset from Cloudinary by public_id. */
export async function destroyCloudinaryAsset(publicId: string): Promise<void> {
  const { cloudName, apiKey, apiSecret } = getCloudinaryServerConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = signCloudinaryParams({ public_id: publicId, timestamp }, apiSecret);

  const body = new URLSearchParams({
    public_id: publicId,
    api_key: apiKey,
    timestamp: String(timestamp),
    signature,
  });

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
    { method: "POST", body },
  );

  const payload = (await response.json().catch(() => null)) as
    | { result?: string; error?: { message?: string } }
    | null;

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? "Cloudinary delete failed");
  }

  // "not found" is treated as success - the goal is "this asset is gone".
  if (payload?.result && payload.result !== "ok" && payload.result !== "not found") {
    throw new Error(`Cloudinary delete returned "${payload.result}"`);
  }
}
