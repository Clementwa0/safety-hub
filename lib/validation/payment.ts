import { z } from "zod";

import { PAYMENT_METHODS } from "@/types/sentinel/payment";

/**
 * Flat payment form schema for React Hook Form (`zodResolver`), used by
 * RecordPaymentDialog. The server (`app/api/invoices/[id]/payments/route.ts`)
 * remains the real source of truth - it re-validates amount against the
 * invoice's actual outstanding balance, which this schema can't see.
 *
 * `amount` is a string here (not a number) because it's bound to a text
 * `<Input type="number">` - RHF forms take the raw input value, and
 * `.min(0.01)` on a string field would compare lengths, not magnitude,
 * so the positivity/balance checks happen in RecordPaymentDialog's
 * submit handler instead, against the live `balance` prop.
 */
export const paymentFormSchema = z.object({
  amount: z.string().trim().min(1, "Enter an amount"),
  method: z.enum(PAYMENT_METHODS),
  reference: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export const EMPTY_PAYMENT_FORM: PaymentFormValues = {
  amount: "",
  method: "mpesa",
  reference: "",
  notes: "",
};

/**
 * Server-side schema for POST /api/invoices/[id]/payments - the real
 * validation gate (unlike paymentFormSchema above, which only guards the
 * form's raw string input client-side). `amount` must be a genuine
 * positive number here since nothing downstream re-parses it from a
 * string. Exported (rather than kept inline in the route) so it has its
 * own tests - see tests/lib/validation/payment.test.ts.
 */
export const recordPaymentSchema = z.object({
  amount: z.number().positive(),
  method: z.enum(PAYMENT_METHODS),
  reference: z.string().trim().optional(),
  date: z.number().optional(),
  notes: z.string().trim().optional(),
});

export type RecordPaymentDTO = z.infer<typeof recordPaymentSchema>;

/** Server-side schema for POST /api/invoices/[id]/payments/[paymentId]/void. */
export const voidPaymentSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export type VoidPaymentDTO = z.infer<typeof voidPaymentSchema>;
