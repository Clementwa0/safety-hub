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

export interface Order {
  id: string;
  number: string;
  customer: Customer;
  items: LineItem[];
  status: OrderStatus;
  notes?: string;
  invoiceId?: string;
  quotationId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface OrderInput {
  customer: Customer;
  items: LineItem[];
  status: OrderStatus;
  notes?: string;
  quotationId?: string;
  invoiceId?: string;
}
