import type { Customer, LineItem } from "./sales";

export const QUOTATION_STATUSES = [
  "draft",
  "sent",
  "accepted",
  "rejected",
  "expired",
] as const;

export type QuotationStatus = (typeof QUOTATION_STATUSES)[number];

export interface Quotation {
  id: string;
  number: string;
  customer: Customer | null;
  items: LineItem[];
  status: QuotationStatus;
  issueDate: number;
  validUntil: number;
  notes?: string;
  terms?: string;
  orderId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface QuotationInput {
  customer: Customer;
  items: LineItem[];
  status: QuotationStatus;
  issueDate: number;
  validUntil: number;
  notes?: string;
  terms?: string;
}
