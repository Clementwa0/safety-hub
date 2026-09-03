import { renderToBuffer } from "@react-pdf/renderer";

import { getSettings } from "@/lib/settings/get-settings.server";
import { resolveLogoDataUri } from "@/lib/pdf/resolve-logo";
import { SalesDocumentPdfDocument } from "@/components/sentinel/sales/SalesDocumentPdfDocument";
import type { PortalSettings } from "@/services/sentinel/settings.service";
import type { NormalizedSalesDocument } from "@/types/sentinel/document-share";

export interface RenderedSalesDocumentPdf {
  buffer: Buffer;
  filename: string;
  settings: PortalSettings;
}

/**
 * Renders a normalized sales document to a PDF buffer - the one place that
 * knows how to turn a document into bytes, used by both the pdf route
 * (view/print/download-less preview) and the email route (attachment), so
 * neither has its own copy of the render call.
 */
export async function renderSalesDocumentPdf(doc: NormalizedSalesDocument): Promise<RenderedSalesDocumentPdf> {
  const settings = await getSettings();
  const logoDataUri = await resolveLogoDataUri(settings.logoUrl);

  const buffer = await renderToBuffer(SalesDocumentPdfDocument({ doc, settings, logoDataUri }));
  const filename = `${doc.type}-${doc.number}.pdf`;

  return { buffer, filename, settings };
}
