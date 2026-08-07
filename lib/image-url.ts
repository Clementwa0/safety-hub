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

export function withImageFallback(url: string | null | undefined): string {
  if (!url || !url.trim()) return PLACEHOLDER_IMAGE_URL;
  return validateImageUrlFormat(url).valid ? url : PLACEHOLDER_IMAGE_URL;
}
