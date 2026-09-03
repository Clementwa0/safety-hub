import jwt from "jsonwebtoken";

import type { SalesDocumentType } from "@/types/sentinel/document-share";

// Secure document links (WhatsApp / copy link) don't require the recipient
// to be signed in to Sentinel, so they're valid for a while rather than
// just the current session - 30 days comfortably covers an invoice's
// payment terms or a quotation's validity window without staying open
// forever.
const SHARE_TOKEN_EXPIRY = "30d";

interface SharePayload {
  docType: SalesDocumentType;
  docId: string;
}

function getShareTokenSecret(): string {
  // JWT_SECRET is reserved for exactly this kind of standalone signed
  // token; AUTH_SECRET is Auth.js's own signing key and is only used as a
  // fallback so this still works in environments that haven't set
  // JWT_SECRET yet.
  const secret = process.env.JWT_SECRET || process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("Missing JWT_SECRET (or AUTH_SECRET) - required to sign document share links.");
  }
  return secret;
}

export function signDocumentShareToken(docType: SalesDocumentType, docId: string): string {
  const payload: SharePayload = { docType, docId };
  return jwt.sign(payload, getShareTokenSecret(), { expiresIn: SHARE_TOKEN_EXPIRY });
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
    const decoded = jwt.verify(token, getShareTokenSecret()) as jwt.JwtPayload & Partial<SharePayload>;
    return decoded.docType === docType && decoded.docId === docId;
  } catch {
    return false;
  }
}
