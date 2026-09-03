import { readFile } from "fs/promises";
import path from "path";

/**
 * Resolves the company logo into a data: URI that @react-pdf/renderer can
 * embed directly, so the PDF route never needs its own live fetch inside
 * the render tree.
 *
 * - `settings.logoUrl` (when set) is a Cloudinary URL uploaded via the
 *   settings page - fetched over the network.
 * - Otherwise falls back to the same bundled `public/logo.png` the
 *   storefront navbar uses when no custom logo is configured.
 *
 * Best-effort: any failure (network error, bad content-type, missing
 * file) resolves to `undefined` rather than throwing, so a broken or
 * slow logo never breaks invoice PDF generation - the document just
 * renders without one.
 */
export async function resolveLogoDataUri(logoUrl: string): Promise<string | undefined> {
  if (logoUrl) {
    try {
      const response = await fetch(logoUrl);
      if (!response.ok) throw new Error(`Logo fetch failed with ${response.status}`);
      const contentType = response.headers.get("content-type") || "image/png";
      if (!contentType.startsWith("image/")) throw new Error(`Unexpected content-type: ${contentType}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      return `data:${contentType};base64,${buffer.toString("base64")}`;
    } catch (error) {
      console.error("[invoice-pdf] failed to fetch configured logo, falling back", error);
      // fall through to the bundled default below
    }
  }

  try {
    const filePath = path.join(process.cwd(), "public", "logo.png");
    const buffer = await readFile(filePath);
    return `data:image/png;base64,${buffer.toString("base64")}`;
  } catch (error) {
    console.error("[invoice-pdf] failed to read bundled logo", error);
    return undefined;
  }
}