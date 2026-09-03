import type { Customer, LineItem } from "./sales";

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export const ORDER_FULFILLMENT_STATUSES = ["AVAILABLE", "PARTIALLY_AVAILABLE", "BACKORDERED"] as const;
export type OrderFulfillmentStatus = (typeof ORDER_FULFILLMENT_STATUSES)[number];

export interface Order {
  id: string;
  number: string;
  // Historical orders can outlive a deleted customer document -
  // populate("customer") then resolves to null. See the matching note on
  // Quotation.customer in ./quotation.ts.
  customer: Customer | null;
  items: LineItem[];
  status: OrderStatus;
  notes?: string;
  invoiceId?: string;
  quotationId?: string;
  createdAt: number;
  updatedAt: number;
  fulfillmentStatus?: OrderFulfillmentStatus;
}

export interface OrderInput {
  customer: Customer;
  items: LineItem[];
  status: OrderStatus;
  notes?: string;
  quotationId?: string;
  invoiceId?: string;
}
