export const PAYMENT_METHODS = ["cash", "mpesa"] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_LEDGER_STATUSES = ["recorded", "voided"] as const;

export type PaymentLedgerStatus = (typeof PAYMENT_LEDGER_STATUSES)[number];

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  date: number;
  recordedBy?: string;
  notes?: string;
  status: PaymentLedgerStatus;
  voidedAt?: number;
  voidedBy?: string;
  voidReason?: string;
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
