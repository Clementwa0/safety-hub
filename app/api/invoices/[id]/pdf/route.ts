import type { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";

import { apiError } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { InvoiceModel } from "@/lib/models/Invoice";
import { requireStaff } from "@/lib/auth";
import { getSettings } from "@/lib/settings/get-settings.server";
import { resolveLogoDataUri } from "@/lib/pdf/resolve-logo";
import { effectiveInvoiceStatus, invoiceOutstandingBalance } from "@/lib/sales";
import { serializeDoc } from "@/lib/api";
import { InvoicePdfDocument } from "@/components/sentinel/sales/InvoicePdfDocument";
import type { Invoice } from "@/types/sentinel/invoice";


export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireStaff();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { id } = await params;
    await connectToDatabase();
    const doc = await InvoiceModel.findById(id).populate("customer").lean();

    if (!doc) {
      return apiError("Invoice not found", [], 404);
    }

    const invoice = serializeDoc<Invoice>(doc);
    const settings = await getSettings();
    const effectiveStatus = effectiveInvoiceStatus(invoice);
    const balance = invoiceOutstandingBalance(invoice);
    const logoDataUri = await resolveLogoDataUri(settings.logoUrl);

    const buffer = await renderToBuffer(
      InvoicePdfDocument({ invoice, effectiveStatus, balance, settings, logoDataUri }),
    );

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${invoice.number}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to generate PDF", [], 500);
  }
}
