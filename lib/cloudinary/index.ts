/**
 * Cloudinary delivery layer (client-safe).
 *
 * Nothing in this file touches the API secret — it only reads the public
 * cloud name (`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`) and rewrites delivery
 * URLs so Cloudinary does the resizing/format negotiation instead of the
 * Next.js image optimizer.
 *
 * Signing lives in `lib/cloudinary/sign.server.ts` and is only reachable
 * from the signing API route.
 */

export const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() ?? "";

/** Folders every module uploads into, so the Cloudinary media library stays tidy. */
export const CLOUDINARY_FOLDERS = {
  products: "safety-hub/products",
  categories: "safety-hub/categories",
  banners: "safety-hub/banners",
  testimonials: "safety-hub/testimonials",
} as const;

export type CloudinaryFolderKey = keyof typeof CLOUDINARY_FOLDERS;

export function isCloudinaryConfigured(): boolean {
  return CLOUDINARY_CLOUD_NAME.length > 0;
}

/** True for any Cloudinary delivery URL (res.cloudinary.com/<cloud>/image/upload/...). */
export function isCloudinaryUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === "res.cloudinary.com" &&
      parsed.pathname.includes("/image/upload/")
    );
  } catch {
    return false;
  }
}

export type CloudinaryCrop = "fill" | "fit" | "limit" | "pad" | "scale" | "thumb";

export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  /** Defaults to "limit" (never upscales, preserves aspect ratio). */
  crop?: CloudinaryCrop;
  /** Defaults to "auto" — Cloudinary picks the quality per image. */
  quality?: number | "auto" | "auto:eco" | "auto:good" | "auto:best";
  /** Defaults to "auto" — AVIF/WebP when the browser supports it. */
  format?: "auto" | "webp" | "avif" | "jpg" | "png";
  /** Device pixel ratio; "auto" requires Client Hints, so we default to 2 for crisp retina output. */
  dpr?: number | "auto";
  /** Focus point for cropped images, e.g. "auto" or "center". */
  gravity?: "auto" | "center" | "face" | "faces";
}

function buildTransformSegment(options: CloudinaryTransformOptions): string {
  const parts: string[] = [];

  if (options.width) parts.push(`w_${Math.round(options.width)}`);
  if (options.height) parts.push(`h_${Math.round(options.height)}`);
  if (options.width || options.height) parts.push(`c_${options.crop ?? "limit"}`);
  if (options.gravity) parts.push(`g_${options.gravity}`);

  parts.push(`f_${options.format ?? "auto"}`);
  parts.push(`q_${options.quality ?? "auto"}`);

  if (options.dpr) parts.push(`dpr_${options.dpr}`);

  return parts.join(",");
}

/**
 * Rewrites a Cloudinary delivery URL to include the requested
 * transformation. Non-Cloudinary URLs (legacy S3/ImageKit/raw GitHub links
 * saved before this integration) are returned untouched, so mixed catalogs
 * keep working.
 */
export function cloudinaryUrl(
  url: string | null | undefined,
  options: CloudinaryTransformOptions = {},
): string {
  if (!url) return "";
  if (!isCloudinaryUrl(url)) return url;

  const marker = "/image/upload/";
  const index = url.indexOf(marker);
  const prefix = url.slice(0, index + marker.length);
  let rest = url.slice(index + marker.length);

  // Strip any transformation segment we (or a previous save) already added,
  // so calling this twice never stacks w_400/w_800 on top of each other.
  const segments = rest.split("/");
  if (segments.length > 1 && /(^|,)(w_|h_|c_|f_|q_|dpr_|g_)/.test(segments[0])) {
    rest = segments.slice(1).join("/");
  }

  return `${prefix}${buildTransformSegment(options)}/${rest}`;
}

/**
 * Per-slot presets so every surface requests a sensibly sized image instead
 * of the full-resolution original. Add a preset here rather than passing raw
 * widths at call sites.
 */
export const CLOUDINARY_PRESETS = {
  thumbnail: { width: 96, height: 96, crop: "fill", gravity: "auto" },
  cardSmall: { width: 320, height: 320, crop: "fill", gravity: "auto" },
  card: { width: 480, height: 480, crop: "fill", gravity: "auto" },
  categoryCard: { width: 640, height: 400, crop: "fill", gravity: "auto" },
  productGallery: { width: 900, crop: "limit" },
  productHero: { width: 1200, crop: "limit" },
  banner: { width: 1920, height: 720, crop: "fill", gravity: "auto" },
  adminPreview: { width: 400, crop: "limit" },
} satisfies Record<string, CloudinaryTransformOptions>;

export type CloudinaryPreset = keyof typeof CLOUDINARY_PRESETS;

export function cloudinaryPresetUrl(
  url: string | null | undefined,
  preset: CloudinaryPreset,
  overrides: CloudinaryTransformOptions = {},
): string {
  return cloudinaryUrl(url, { ...CLOUDINARY_PRESETS[preset], ...overrides });
}

/** Extracts the public_id from a delivery URL so it can be deleted later. */
export function cloudinaryPublicId(url: string | null | undefined): string | null {
  if (!isCloudinaryUrl(url)) return null;

  const marker = "/image/upload/";
  const rest = (url as string).slice((url as string).indexOf(marker) + marker.length);
  const segments = rest.split("/").filter(Boolean);

  // Drop a leading transformation segment and the version segment (v123456).
  if (segments.length > 1 && /(^|,)(w_|h_|c_|f_|q_|dpr_|g_)/.test(segments[0])) {
    segments.shift();
  }
  if (segments.length > 1 && /^v\d+$/.test(segments[0])) {
    segments.shift();
  }

  const path = segments.join("/");
  if (!path) return null;

  return path.replace(/\.[a-z0-9]+$/i, "");
}
