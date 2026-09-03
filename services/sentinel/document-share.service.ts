"use client";

import { apiRequest } from "@/lib/http";
import { SALES_DOCUMENT_ROUTE_SEGMENTS, type SalesDocumentType } from "@/types/sentinel/document-share";

function routePath(type: SalesDocumentType, id: string, suffix: string): string {
  return `/api/documents/${SALES_DOCUMENT_ROUTE_SEGMENTS[type]}/${id}/${suffix}`;
}

export const documentShareService = {
  /**
   * Fetches the document's PDF as a Blob for Print and for native-share's
   * file-attach path. Not used to trigger a browser download - see
   * ShareDocumentMenu.tsx, which only ever opens this in a new tab or
   * hands it to navigator.share().
   *
   * Not using apiRequest here: that always parses the response as JSON,
   * but this endpoint returns a raw application/pdf stream, so it's
   * fetched directly and handed to the browser as a blob.
   */
  async fetchPdfBlob(type: SalesDocumentType, id: string): Promise<Blob> {
    const response = await fetch(routePath(type, id, "pdf"), { credentials: "include" });
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.message || "Could not generate PDF");
    }
    return response.blob();
  },

  /** Mints a fresh secure link, used by "Copy secure link" and WhatsApp share. */
  async getShareLink(type: SalesDocumentType, id: string): Promise<string> {
    const payload = await apiRequest<{ url: string }>(routePath(type, id, "share-link"));
    return payload.url;
  },

  /** Emails the document's PDF as an attachment; `to` defaults server-side to the customer's email on file. */
  async emailDocument(type: SalesDocumentType, id: string, to?: string): Promise<string> {
    const payload = await apiRequest<{ sentTo: string }>(routePath(type, id, "email"), {
      method: "POST",
      body: JSON.stringify({ to }),
    });
    return payload.sentTo;
  },
};
