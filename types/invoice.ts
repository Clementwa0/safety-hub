import type { Customer, LineItem } from "./sales";

export const INVOICE_STATUSES = [
  "draft",
  "unpaid",
  "partially_paid",
  "paid",
  "overdue",
  "cancelled",
] as const;

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export interface Invoice {
  id: string;
  number: string;
  customer: Customer;
  items: LineItem[];
  status: InvoiceStatus;
  issueDate: number;
  dueDate: number;
  amountPaid: number;
  notes?: string;
  terms?: string;
  quotationId?: string;
  orderId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface InvoiceInput {
  customer: Customer;
  items: LineItem[];
  status: InvoiceStatus;
  issueDate: number;
  dueDate: number;
  amountPaid: number;
  notes?: string;
  terms?: string;
  quotationId?: string;
  orderId?: string;
}
