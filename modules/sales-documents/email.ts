import { sendMail } from "@/lib/email/mailer";
import { formatKES } from "@/lib/format";
import { computeTotals } from "@/lib/sales";
import type { PortalSettings } from "@/services/sentinel/settings.service";
import type { NormalizedSalesDocument } from "@/types/sentinel/document-share";

/**
 * Emails a normalized sales document as a PDF attachment. Shared by
 * invoices, quotations, and orders - the subject/body only vary by the
 * document's own label/number/total, never by bespoke per-type copy.
 */
export async function sendSalesDocumentEmail(
  doc: NormalizedSalesDocument,
  settings: PortalSettings,
  pdfBuffer: Buffer,
  filename: string,
  to: string,
): Promise<void> {
  const totals = computeTotals(doc.items);
  const greetingName = doc.customer?.name || "there";
  const subject = `${doc.label} ${doc.number} from ${settings.companyName}`;

  const text = [
    `Hi ${greetingName},`,
    "",
    `Please find attached ${doc.label.toLowerCase()} ${doc.number} from ${settings.companyName}.`,
    `Total: ${formatKES(totals.total)}`,
    "",
    settings.contactPhone ? `Questions? Call us on ${settings.contactPhone}.` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="font-family:system-ui, sans-serif; line-height:1.5; color:#111;">
      <p>Hi ${greetingName},</p>
      <p>Please find attached <strong>${doc.label} ${doc.number}</strong> from ${settings.companyName}.</p>
      <p><strong>Total:</strong> ${formatKES(totals.total)}</p>
      ${settings.contactPhone ? `<p>Questions? Call us on ${settings.contactPhone}.</p>` : ""}
    </div>
  `;

  await sendMail({
    to,
    subject,
    text,
    html,
    attachments: [{ filename, content: pdfBuffer, contentType: "application/pdf" }],
    replyTo: settings.contactEmail || undefined,
  });
}
