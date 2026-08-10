"use client";

import { Badge } from "@/components/ui/badge";
import { formatDate, formatKES } from "@/lib/format";
import type { Payment } from "@/types/sentinel/payment";

const METHOD_LABEL: Record<Payment["method"], string> = {
  cash: "Cash",
  mpesa: "M-Pesa",
};

interface PaymentHistoryListProps {
  payments: Payment[];
  loading: boolean;
}

export function PaymentHistoryList({ payments, loading }: PaymentHistoryListProps) {
  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading payment history...</p>;
  }

  if (payments.length === 0) {
    return <p className="text-sm text-muted-foreground">No payments recorded yet.</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {payments.map((payment) => (
        <li key={payment.id} className="flex items-center justify-between gap-4 py-3 text-sm">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{formatKES(payment.amount)}</span>
              <Badge variant="outline" className="capitalize">{METHOD_LABEL[payment.method]}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDate(payment.date)}
              {payment.reference ? ` · Ref: ${payment.reference}` : ""}
              {payment.recordedBy ? ` · Recorded by ${payment.recordedBy}` : ""}
            </p>
            {payment.notes && <p className="text-xs text-muted-foreground">{payment.notes}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default PaymentHistoryList;
