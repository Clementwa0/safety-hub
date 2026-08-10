"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { EMPTY_PAYMENT_FORM, paymentFormSchema, type PaymentFormValues } from "@/lib/validation/payment";
import { formatKES } from "@/lib/format";
import type { PaymentInput, PaymentMethod } from "@/types/sentinel/payment";

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Outstanding balance, used to pre-fill the amount and validate client-side - the server re-validates against the real balance regardless. */
  balance: number;
  saving: boolean;
  onSubmit: (input: PaymentInput) => void | Promise<void>;
}

export function RecordPaymentDialog({ open, onOpenChange, balance, saving, onSubmit }: RecordPaymentDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: EMPTY_PAYMENT_FORM,
  });

  // Reset to a fresh form - pre-filled with the full outstanding balance,
  // since paying off what's owed is the common case - every time the
  // dialog opens, so a previous open's values (or its validation errors)
  // never leak into the next one.
  useEffect(() => {
    if (!open) return;
    reset({ ...EMPTY_PAYMENT_FORM, amount: balance > 0 ? String(balance) : "" });
  }, [open, balance, reset]);

  const method = watch("method");

  const submit = (values: PaymentFormValues) => {
    const amount = Number(values.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("amount", { message: "Enter an amount greater than zero." });
      return;
    }
    if (amount - balance > 0.01) {
      setError("amount", { message: `Amount can't exceed the outstanding balance of ${formatKES(balance)}.` });
      return;
    }

    void onSubmit({
      amount,
      method: values.method,
      reference: values.reference?.trim() || undefined,
      notes: values.notes?.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record a payment</DialogTitle>
          <DialogDescription>
            Outstanding balance: <span className="font-medium text-foreground">{formatKES(balance)}</span>
          </DialogDescription>
        </DialogHeader>

        <form id="record-payment-form" onSubmit={handleSubmit(submit)} className="grid gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="pay-amount">Amount (KES)</Label>
            <Input id="pay-amount" type="number" min="0.01" step="0.01" placeholder="0.00" {...register("amount")} />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pay-method">Method</Label>
            <Select
              value={method}
              onValueChange={(v) => typeof v === "string" && setValue("method", v as PaymentMethod)}
            >
              <SelectTrigger id="pay-method"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mpesa">M-Pesa</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pay-reference">Reference (optional)</Label>
            <Input id="pay-reference" placeholder="M-Pesa code, receipt no...." {...register("reference")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pay-notes">Notes (optional)</Label>
            <Input id="pay-notes" placeholder="Any additional detail" {...register("notes")} />
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" disabled={saving} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="record-payment-form" disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Record payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RecordPaymentDialog;
