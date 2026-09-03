import type { NextRequest } from "next/server";

import { apiError, apiSuccess } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { loadSalesDocument } from "@/modules/sales-documents/fetch";
import { signDocumentShareToken } from "@/modules/sales-documents/share-token";
import { parseSalesDocumentType } from "@/types/sentinel/document-share";

/**
 * Mints the secure, token-authenticated link used by "Copy secure link"
 * and the WhatsApp share message. Staff-only to issue - once minted, the
 * link itself is what carries access (see pdf/route.ts), valid for 30 days.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  try {
    const user = await requireStaff();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { type: routeSegment, id } = await params;
    const type = parseSalesDocumentType(routeSegment);
    if (!type) {
      return apiError("Unknown document type", [], 404);
    }

    await connectToDatabase();
    const doc = await loadSalesDocument(type, id);
    if (!doc) {
      return apiError(`${routeSegment.replace(/s$/, "")} not found`, [], 404);
    }

    const token = signDocumentShareToken(type, id);
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || request.nextUrl.origin).replace(
      /\/$/,
      "",
    );
    const url = `${appUrl}/api/documents/${routeSegment}/${id}/pdf?token=${token}`;

    return apiSuccess({ url }, "Share link generated");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to generate share link", [], 500);
  }
}
