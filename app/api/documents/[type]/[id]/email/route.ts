import { z } from "zod";
import type { NextRequest } from "next/server";

import { apiError, apiSuccess, parseJsonBodyFromRequest } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { loadSalesDocument } from "@/modules/sales-documents/fetch";
import { renderSalesDocumentPdf } from "@/modules/sales-documents/pdf";
import { sendSalesDocumentEmail } from "@/modules/sales-documents/email";
import { parseSalesDocumentType } from "@/types/sentinel/document-share";

const emailRequestSchema = z.object({
  to: z.string().trim().email("Enter a valid email address").optional(),
});

/**
 * Emails the document's PDF as an attachment. Staff-only. Defaults to the
 * customer's email on file when `to` isn't provided in the body.
 */
export async function POST(
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

    const parsed = await parseJsonBodyFromRequest(request, emailRequestSchema);
    if (!parsed.success) {
      return apiError("Validation failed", parsed.error.issues.map((issue) => issue.message), 400);
    }

    await connectToDatabase();
    const doc = await loadSalesDocument(type, id);
    if (!doc) {
      return apiError(`${routeSegment.replace(/s$/, "")} not found`, [], 404);
    }

    const to = parsed.data.to || doc.customerEmail;
    if (!to) {
      return apiError("This customer has no email on file - enter an email address to send to.", [], 400);
    }

    const { buffer, filename, settings } = await renderSalesDocumentPdf(doc);
    await sendSalesDocumentEmail(doc, settings, buffer, filename, to);

    return apiSuccess({ sentTo: to }, `${doc.label} emailed to ${to}`);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to email document", [], 500);
  }
}
