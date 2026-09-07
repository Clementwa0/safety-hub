import jwt from "jsonwebtoken";

import type { SalesDocumentType } from "@/types/sentinel/document-share";

// Secure document links (WhatsApp / copy link) don't require the recipient
// These are bearer credentials in a URL, so a shorter lifetime materially
// reduces the impact of accidental forwarding, browser history, or logs.
const SHARE_TOKEN_EXPIRY = "7d";
const SHARE_TOKEN_ISSUER = "safety-hub";
const SHARE_TOKEN_AUDIENCE = "sales-document-pdf";

interface SharePayload {
  docType: SalesDocumentType;
  docId: string;
}

function getShareTokenSecret(): string {
  // This must be distinct from Auth.js's session key: compromising or
  // rotating one credential must not affect the other security boundary.
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Missing JWT_SECRET - required to sign document share links.");
  }
  return secret;
}

export function signDocumentShareToken(docType: SalesDocumentType, docId: string): string {
  const payload: SharePayload = { docType, docId };
  return jwt.sign(payload, getShareTokenSecret(), {
    algorithm: "HS256",
    expiresIn: SHARE_TOKEN_EXPIRY,
    issuer: SHARE_TOKEN_ISSUER,
    audience: SHARE_TOKEN_AUDIENCE,
  });
}

/**
 * Verifies a share token is validly signed, unexpired, and actually issued
 * for this exact document - never trusts a token for one document to grant
 * access to another.
 */
export function verifyDocumentShareToken(
  token: string,
  docType: SalesDocumentType,
  docId: string,
): boolean {
  try {
    const decoded = jwt.verify(token, getShareTokenSecret(), {
      algorithms: ["HS256"],
      issuer: SHARE_TOKEN_ISSUER,
      audience: SHARE_TOKEN_AUDIENCE,
    }) as jwt.JwtPayload & Partial<SharePayload>;
    return decoded.docType === docType && decoded.docId === docId;
  } catch {
    return false;
  }
}
