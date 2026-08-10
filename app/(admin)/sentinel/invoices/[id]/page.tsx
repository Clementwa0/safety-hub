"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CreditCard, Download, Pencil, Printer } from "lucide-react";
import { toast } from "sonner";

import DocumentPreview from "@/components/sentinel/sales/DocumentPreview";
import { InvoiceStatusBadge } from "@/components/sentinel/sales/StatusBadge";
import { RecordPaymentDialog } from "@/components/sentinel/sales/RecordPaymentDialog";
import { PaymentHistoryList } from "@/components/sentinel/sales/PaymentHistoryList";
import { EmptyState } from "@/components/shared/EmptyState";
import { Loading } from "@/components/shared/Loading";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { invoiceService } from "@/services/sentinel/invoice.service";
import { paymentService } from "@/services/sentinel/payment.service";
import { INVOICE_STATUSES, type Invoice, type InvoiceStatus } from "@/types/sentinel/invoice";
import type { Payment, PaymentInput } from "@/types/sentinel/payment";
import { formatKES } from "@/lib/format";

export default function InvoiceViewPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [recordingPayment, setRecordingPayment] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true); setError(null);
    try { setInvoice(await invoiceService.getById(id)); }
    catch (c) { setError(c instanceof Error ? c.message : "Could not load"); }
    finally { setLoading(false); }
  }, [id]);

  const loadPayments = useCallback(async () => {
    if (!id) return;
    setPaymentsLoading(true);
    try { setPayments(await paymentService.listForInvoice(id)); }
    catch (c) { toast.error(c instanceof Error ? c.message : "Could not load payment history"); }
    finally { setPaymentsLoading(false); }
  }, [id]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void load();
      void loadPayments();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [load, loadPayments]);

  const recordPayment = async (input: PaymentInput) => {
    if (!invoice) return;
    setRecordingPayment(true);
    try {
      const result = await paymentService.record(invoice.id, input);
      setInvoice(result.invoice);
      setPayments((prev) => [result.payment, ...prev]);
      setPayDialogOpen(false);
      toast.success("Payment recorded");
      router.refresh();
    } catch (c) { toast.error(c instanceof Error ? c.message : "Could not record payment"); }
    finally { setRecordingPayment(false); }
  };

  const updateStatus = async (next: InvoiceStatus) => {
    if (!invoice) return;
    setUpdating(true);
    try {
      const updated = await invoiceService.update(invoice.id, { status: next });
      setInvoice(updated);
      toast.success(`Status updated`);
      router.refresh();
    } catch (c) { toast.error(c instanceof Error ? c.message : "Could not update"); }
    finally { setUpdating(false); }
  };

  if (loading) return <Loading label="Loading invoice..." />;
  if (error || !invoice) {
    return <EmptyState title="Invoice not found" description={error ?? "This invoice may have been deleted."} />;
  }

  const balance = invoiceService.outstandingBalance(invoice);
  const effective = invoiceService.effectiveStatus(invoice);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Invoice ${invoice.number}`}
        description={`For ${invoice.customer.name}${invoice.customer.company ? ` · ${invoice.customer.company}` : ""}`}
        breadcrumbs={[
          { label: "Admin", href: "/sentinel/dashboard" },
          { label: "Invoices", href: "/sentinel/invoices" },
          { label: invoice.number },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Print
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Download className="h-4 w-4" /> Export PDF
            </Button>
            <Button nativeButton={false} render={<Link href={`/sentinel/invoices/${invoice.id}/edit`} />}>
              <Pencil className="h-4 w-4" /> Edit
            </Button>
            <Button
              disabled={invoice.status === "draft" || invoice.status === "cancelled" || invoice.status === "paid"}
              onClick={() => setPayDialogOpen(true)}
            >
              <CreditCard className="h-4 w-4" /> Record payment
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base">Status · Outstanding {formatKES(balance)}</CardTitle>
            <div className="mt-2"><InvoiceStatusBadge status={effective} /></div>
          </div>
          <div className="w-full max-w-xs space-y-2">
            <Label>Change status</Label>
            <Select value={invoice.status} disabled={updating}
              onValueChange={(v) => typeof v === "string" && void updateStatus(v as InvoiceStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {INVOICE_STATUSES.map((o) => (
                  <SelectItem key={o} value={o}><span className="capitalize">{o.replace(/_/g, " ")}</span></SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      <DocumentPreview
        documentType="Invoice"
        documentNumber={invoice.number}
        issueDate={invoice.issueDate}
        dueDate={invoice.dueDate}
        status={effective}
        customer={invoice.customer}
        items={invoice.items}
        notes={invoice.notes}
        terms={invoice.terms}
        footer={
          <div className="text-sm">
            <p className="text-muted-foreground">
              Amount paid: <span className="font-medium text-foreground">{formatKES(invoice.amountPaid)}</span>
            </p>
            <p className="text-muted-foreground">
              Balance due: <span className="font-medium text-foreground">{formatKES(balance)}</span>
            </p>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment history</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentHistoryList payments={payments} loading={paymentsLoading} />
        </CardContent>
      </Card>

      <RecordPaymentDialog
        open={payDialogOpen}
        onOpenChange={setPayDialogOpen}
        balance={balance}
        saving={recordingPayment}
        onSubmit={recordPayment}
      />
    </div>
  );
}
