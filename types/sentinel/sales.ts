import type { LineItemDTO, CustomerObjectDTO } from "@/lib/schemas/sales";

export type Customer = CustomerObjectDTO;

export interface DocumentTotals {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

export type FulfillmentPlan = "available" | "partial" | "procurement";

export interface Product {
  id: string;
  name: string;
  description?: string | undefined;
  price: number;
}

export interface ProductAvailability {
  productId: string;
  available: number;
}

export interface LineItem {
  id: string;
  productId?: string | undefined;
  name: string;
  description?: string | undefined;
  /** Set only when this line is a specific size/variant of a
   *  variant-enabled product. Both undefined together for a simple line. */
  variantSku?: string | undefined;
  size?: string | undefined;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  availableAtQuote?: number | undefined;
  fulfillmentPlan?: FulfillmentPlan | undefined;
}

export interface Totals {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}
