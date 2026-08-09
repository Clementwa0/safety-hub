import type { LineItemDTO, CustomerObjectDTO } from "@/lib/schemas/sales";

// LineItem and Customer are derived from the same Zod schema the
// quotations/invoices/orders API routes validate against
// (lib/schemas/sales.ts) - see that file for why `id`/`productId` exist
// and which fields are optional. `id` is required here (not just
// optional, as it is for API input) because every line item in local
// component state has one, assigned by lib/sales.ts#createLineItem.
export type LineItem = LineItemDTO & { id: string };

export type Customer = CustomerObjectDTO;

export interface DocumentTotals {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}
