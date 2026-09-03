import type { Customer, LineItem } from "./sales";

/**
 * The three sales-document kinds that share one PDF renderer, one share
 * link/email API, and one <ShareDocumentMenu /> UI - see
 * modules/sales-documents/ for the server-side logic and
 * components/sentinel/sales/ShareDocumentMenu.tsx for the client UI.
 */
export const SALES_DOCUMENT_TYPES = ["invoice", "quotation", "order"] as const;
export type SalesDocumentType = (typeof SALES_DOCUMENT_TYPES)[number];

/**
 * URL segments for /api/documents/[segment]/[id]/... - deliberately mirror
 * the plural, list-page naming already used by /api/invoices,
 * /api/quotations and /api/orders, so this one route family can serve all
 * three document types without inventing a second naming scheme.
 */
export const SALES_DOCUMENT_ROUTE_SEGMENTS: Record<SalesDocumentType, string> = {
  invoice: "invoices",
  quotation: "quotations",
  order: "orders",
};

const ROUTE_SEGMENT_TO_TYPE: Record<string, SalesDocumentType> = {
  invoices: "invoice",
  quotations: "quotation",
  orders: "order",
};

export function parseSalesDocumentType(segment: string): SalesDocumentType | null {
  return ROUTE_SEGMENT_TO_TYPE[segment] ?? null;
}

export const SALES_DOCUMENT_LABELS: Record<SalesDocumentType, string> = {
  invoice: "Invoice",
  quotation: "Quotation",
  order: "Sales Order",
};

export interface SalesDocumentDate {
  label: string;
  value: number;
}

/**
 * The shape every document type is normalized into before it reaches the
 * PDF renderer or the email composer - see
 * modules/sales-documents/fetch.ts#loadSalesDocument. Keeping this shared
 * shape is what lets the PDF layout, the email body, and the share-link
 * flow stay single-implementation instead of being copy-pasted per
 * document type.
 */
export interface NormalizedSalesDocument {
  type: SalesDocumentType;
  id: string;
  number: string;
  label: string;
  statusLabel: string;
  customer: Customer | null;
  customerEmail?: string;
  items: LineItem[];
  dates: SalesDocumentDate[];
  notes?: string;
  terms?: string;
  /** Only present for invoices - quotations and orders never carry payments. */
  paymentSummary?: { amountPaid: number; balance: number };
}
