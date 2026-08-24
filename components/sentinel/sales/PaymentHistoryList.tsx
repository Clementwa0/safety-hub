"use client";

import { Ban } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatKES } from "@/lib/format";
import type { Payment } from "@/types/sentinel/payment";

const METHOD_LABEL: Record<Payment["method"], string> = {
  cash: "Cash",
  mpesa: "M-Pesa",
};

interface PaymentHistoryListProps {
  payments: Payment[];
  loading: boolean;
  /** Omit to hide the void action entirely (e.g. a read-only context). */
  onVoid?: (payment: Payment) => void;
  voidingPaymentId?: string | null;
}

export function PaymentHistoryList({ payments, loading, onVoid, voidingPaymentId }: PaymentHistoryListProps) {
  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading payment history...</p>;
  }

  if (payments.length === 0) {
    return <p className="text-sm text-muted-foreground">No payments recorded yet.</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {payments.map((payment) => {
        const voided = payment.status === "voided";
        return (
          <li key={payment.id} className="py-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`font-medium tabular-nums ${voided ? "text-muted-foreground line-through" : "text-foreground"}`}>
                  {formatKES(payment.amount)}
                </span>
                <Badge variant="outline" className="capitalize">{METHOD_LABEL[payment.method]}</Badge>
                {voided ? <Badge variant="destructive">Voided</Badge> : null}
              </div>
              {onVoid && !voided ? (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={voidingPaymentId === payment.id}
                  onClick={() => onVoid(payment)}
                  aria-label={`Void payment of ${formatKES(payment.amount)}`}
                >
                  <Ban className="h-3.5 w-3.5" /> Void
                </Button>
              ) : null}
            </div>
            <p className="mt-0.5 break-words text-xs text-muted-foreground">
              {formatDate(payment.date)}
              {payment.reference ? ` · Ref: ${payment.reference}` : ""}
              {payment.recordedBy ? ` · Recorded by ${payment.recordedBy}` : ""}
            </p>
            {payment.notes && (
              <p className="mt-0.5 break-words text-xs text-muted-foreground">{payment.notes}</p>
            )}
            {voided && (
              <p className="mt-0.5 break-words text-xs text-muted-foreground">
                Voided {payment.voidedAt ? formatDate(payment.voidedAt) : ""}
                {payment.voidedBy ? ` by ${payment.voidedBy}` : ""}
                {payment.voidReason ? ` · ${payment.voidReason}` : ""}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default PaymentHistoryList;
