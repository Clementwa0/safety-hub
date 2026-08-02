/**
 * Centralized URL-only image validation.
 *
 * This app never stores uploaded files — every image (product, category,
 * banner, testimonial, etc.) is referenced by a public HTTPS URL. All
 * format/shape validation for those URLs lives here so the admin UI (see
 * `components/shared/ImageUrlInput.tsx`), form schemas, and API routes stay
 * in sync instead of re-implementing the same regex in five places.
 */

/** Extensions we recognize as image files when a URL has a file extension. */
export const SUPPORTED_IMAGE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "avif",
  "svg",
  "gif",
] as const;

/** Fallback shown whenever an image URL is missing, invalid, or fails to load. */
export const PLACEHOLDER_IMAGE_URL = "/images/placeholder.svg";

export type ImageUrlValidation =
  | { valid: true }
  | { valid: false; reason: string };

/**
 * Synchronous, format-only validation: is this a well-formed HTTPS URL that
 * plausibly points at an image? This does NOT confirm the image actually
 * loads — pair it with `checkImageLoads` (browser-only) for that.
 */
export function validateImageUrlFormat(rawUrl: string): ImageUrlValidation {
  const url = rawUrl.trim();

  if (!url) {
    return { valid: false, reason: "Enter an image URL." };
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { valid: false, reason: "Enter a valid URL, e.g. https://example.com/images/product.jpg" };
  }

  if (parsed.protocol !== "https:") {
    return { valid: false, reason: "Image URLs must use HTTPS." };
  }

  // Many CDNs (Cloudinary, ImageKit, Unsplash, S3 signed URLs, etc.) serve
  // images without a file extension in the pathname, so we only reject a URL
  // outright when it has an extension we recognize as non-image. A missing
  // or unrecognized extension is allowed through to the real load check.
  const pathname = parsed.pathname.toLowerCase();
  const lastSegment = pathname.split("/").pop() ?? "";
  const extensionMatch = lastSegment.match(/\.([a-z0-9]+)$/);

  if (extensionMatch) {
    const extension = extensionMatch[1];
    const looksLikeKnownNonImage = [
      "html",
      "htm",
      "pdf",
      "doc",
      "docx",
      "mp4",
      "mov",
      "zip",
      "json",
      "txt",
    ].includes(extension);

    if (looksLikeKnownNonImage) {
      return { valid: false, reason: "That URL doesn't point to an image file." };
    }
  }

  return { valid: true };
}

/**
 * Browser-only: attempts to actually load the image so we can show a live
 * preview and catch broken/inaccessible URLs before saving. Resolves true/
 * false rather than throwing, so callers can drive UI state directly.
 */
export function checkImageLoads(url: string, timeoutMs = 8000): Promise<boolean> {
  if (typeof window === "undefined") {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const img = new window.Image();
    let settled = false;

    const finish = (result: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      img.onload = null;
      img.onerror = null;
      resolve(result);
    };

    const timer = window.setTimeout(() => finish(false), timeoutMs);

    img.onload = () => finish(true);
    img.onerror = () => finish(false);
    img.src = url;
  });
}

/** Returns `url` if it looks like a usable image URL, otherwise the shared placeholder. */
export function withImageFallback(url: string | null | undefined): string {
  if (!url || !url.trim()) return PLACEHOLDER_IMAGE_URL;
  return validateImageUrlFormat(url).valid ? url : PLACEHOLDER_IMAGE_URL;
}
