"use client";

import { apiRequest } from "@/lib/http";
import type { Invoice } from "@/types/sentinel/invoice";
import type { Payment, PaymentInput } from "@/types/sentinel/payment";

export const paymentService = {
  async listForInvoice(invoiceId: string): Promise<Payment[]> {
    return apiRequest<Payment[]>(`/api/invoices/${invoiceId}/payments`);
  },
  async record(invoiceId: string, input: PaymentInput): Promise<{ payment: Payment; invoice: Invoice }> {
    return apiRequest<{ payment: Payment; invoice: Invoice }>(`/api/invoices/${invoiceId}/payments`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  async void(
    invoiceId: string,
    paymentId: string,
    reason?: string,
  ): Promise<{ payment: Payment; invoice: Invoice }> {
    return apiRequest<{ payment: Payment; invoice: Invoice }>(
      `/api/invoices/${invoiceId}/payments/${paymentId}/void`,
      { method: "POST", body: JSON.stringify({ reason }) },
    );
  },
};
