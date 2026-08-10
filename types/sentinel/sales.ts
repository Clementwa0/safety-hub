import type { LineItemDTO, CustomerObjectDTO } from "@/lib/schemas/sales";

// LineItem and Customer are derived from the same Zod schema the
// quotations/invoices/orders API routes validate against
// (lib/schemas/sales.ts) - see that file for why `id`/`productId` exist
// and which fields are optional. `id` is required here (not just
// optional, as it is for API input) because every line item in local
// component state has one, assigned by lib/sales.ts#createLineItem.
//
// `availableAtQuote` is added on top of the schema (not part of it)
// because it's a server-computed, response-only field (see
// lib/server/availability.ts) - it's never something a client submits,
// so it has no place in the input schema, but UI code reading a
// quotation back from the API needs it on the type.
export type LineItem = LineItemDTO & { id: string; availableAtQuote?: number };

export type Customer = CustomerObjectDTO;

export interface DocumentTotals {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}
