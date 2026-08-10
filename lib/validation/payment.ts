import { z } from "zod";

import { PAYMENT_METHODS } from "@/types/sentinel/payment";


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
