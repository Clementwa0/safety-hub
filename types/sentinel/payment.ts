export const PAYMENT_METHODS = ["cash", "mpesa"] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  date: number;
  recordedBy?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface PaymentInput {
  amount: number;
  method: PaymentMethod;
  reference?: string;
  date?: number;
  notes?: string;
}
