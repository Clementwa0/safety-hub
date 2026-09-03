import type { NextRequest } from "next/server";

import { apiError } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { loadSalesDocument } from "@/modules/sales-documents/fetch";
import { renderSalesDocumentPdf } from "@/modules/sales-documents/pdf";
import { verifyDocumentShareToken } from "@/modules/sales-documents/share-token";
import { parseSalesDocumentType } from "@/types/sentinel/document-share";

/**
 * Serves the PDF for an invoice/quotation/order. Two ways in:
 *  - a signed `token` query param (the customer-facing secure link shared
 *    via WhatsApp/copy-link/email - no Sentinel session required), or
 *  - a signed-in staff session (used internally for Print and the
 *    "Share..." native-share fallback).
 * Never exposed in the Sentinel UI as a "Download" action - see
 * ShareDocumentMenu.tsx, which only uses this for Print/native-share/the
 * secure link itself.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  try {
    const { type: routeSegment, id } = await params;
    const type = parseSalesDocumentType(routeSegment);
    if (!type) {
      return apiError("Unknown document type", [], 404);
    }

    const token = request.nextUrl.searchParams.get("token");
    let authorized = Boolean(token) && verifyDocumentShareToken(token as string, type, id);

    if (!authorized) {
      const user = await requireStaff();
      authorized = Boolean(user);
    }

    if (!authorized) {
      return apiError("Unauthorized", [], 401);
    }

    await connectToDatabase();
    const doc = await loadSalesDocument(type, id);
    if (!doc) {
      return apiError(`${routeSegment.replace(/s$/, "")} not found`, [], 404);
    }

    const { buffer, filename } = await renderSalesDocumentPdf(doc);

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        // "inline", not "attachment" - this route backs Print and the
        // secure link (opened in a browser tab), never a "Download" button.
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to generate PDF", [], 500);
  }
}
