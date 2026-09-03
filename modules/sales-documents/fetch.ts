import { InvoiceModel } from "@/lib/models/Invoice";
import { QuotationModel } from "@/lib/models/Quotation";
import { OrderModel } from "@/lib/models/Order";
import { serializeDoc } from "@/lib/api";
import { effectiveInvoiceStatus, invoiceOutstandingBalance } from "@/lib/sales";
import type { Invoice } from "@/types/sentinel/invoice";
import type { Quotation } from "@/types/sentinel/quotation";
import type { Order } from "@/types/sentinel/order";
import {
  SALES_DOCUMENT_LABELS,
  type NormalizedSalesDocument,
  type SalesDocumentType,
} from "@/types/sentinel/document-share";

/**
 * Single place that knows how to load each document type and normalize it
 * into the shared shape the PDF renderer and email composer work from.
 * Callers must have already called connectToDatabase() - this module stays
 * DB-connection-agnostic so it can be reused from routes that share one
 * connection across several calls.
 */
export async function loadSalesDocument(
  type: SalesDocumentType,
  id: string,
): Promise<NormalizedSalesDocument | null> {
  switch (type) {
    case "invoice": {
      const doc = await InvoiceModel.findById(id).populate("customer").lean();
      if (!doc) return null;

      const invoice = serializeDoc<Invoice>(doc);
      const customer = invoice.customer ?? null;
      const effectiveStatus = effectiveInvoiceStatus(invoice);
      const balance = invoiceOutstandingBalance(invoice);

      return {
        type,
        id: invoice.id,
        number: invoice.number,
        label: SALES_DOCUMENT_LABELS.invoice,
        statusLabel: effectiveStatus.replace(/_/g, " "),
        customer,
        customerEmail: customer?.email || undefined,
        items: invoice.items,
        dates: [
          { label: "Issue date", value: invoice.issueDate },
          { label: "Due date", value: invoice.dueDate },
        ],
        notes: invoice.notes,
        terms: invoice.terms,
        paymentSummary: { amountPaid: invoice.amountPaid, balance },
      };
    }

    case "quotation": {
      const doc = await QuotationModel.findById(id).populate("customer").lean();
      if (!doc) return null;

      const quotation = serializeDoc<Quotation>(doc);
      const customer = quotation.customer ?? null;

      return {
        type,
        id: quotation.id,
        number: quotation.number,
        label: SALES_DOCUMENT_LABELS.quotation,
        statusLabel: quotation.status.replace(/_/g, " "),
        customer,
        customerEmail: customer?.email || undefined,
        items: quotation.items,
        dates: [
          { label: "Issue date", value: quotation.issueDate },
          { label: "Valid until", value: quotation.validUntil },
        ],
        notes: quotation.notes,
        terms: quotation.terms,
      };
    }

    case "order": {
      const doc = await OrderModel.findById(id).populate("customer").lean();
      if (!doc) return null;

      const order = serializeDoc<Order>(doc);
      const customer = order.customer ?? null;

      return {
        type,
        id: order.id,
        number: order.number,
        label: SALES_DOCUMENT_LABELS.order,
        statusLabel: order.status.replace(/_/g, " "),
        customer,
        customerEmail: customer?.email || undefined,
        items: order.items,
        dates: [{ label: "Order date", value: order.createdAt }],
        notes: order.notes,
      };
    }

    default: {
      // Exhaustiveness guard - SalesDocumentType only ever has the three
      // members above, so this keeps a future fourth type from silently
      // falling through without a case here.
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}
