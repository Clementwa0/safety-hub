"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CreditCard, Download, Loader2, Pencil, Printer } from "lucide-react";
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
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { invoiceService } from "@/services/sentinel/invoice.service";
import { paymentService } from "@/services/sentinel/payment.service";
import { INVOICE_STATUSES, type Invoice, type InvoiceStatus } from "@/types/sentinel/invoice";
import type { Payment, PaymentInput } from "@/types/sentinel/payment";
import { formatKES } from "@/lib/format";

// "paid" and "partially_paid" are derived exclusively from the payment
// ledger (record/void a payment) and can no longer be set from this
// dropdown - see the matching STAFF_SETTABLE_STATUSES note in
// app/api/invoices/[id]/route.ts, which now rejects them anyway.
// "overdue" was never a real stored value, only a computed display
// state (lib/sales.ts#effectiveInvoiceStatus).
const STAFF_SETTABLE_STATUSES: InvoiceStatus[] = ["draft", "unpaid", "cancelled"];

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
  const [pdfBusy, setPdfBusy] = useState<"print" | "download" | null>(null);
  const [pendingVoid, setPendingVoid] = useState<Payment | null>(null);
  const [voidingPaymentId, setVoidingPaymentId] = useState<string | null>(null);

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

  const voidPayment = async () => {
    if (!invoice || !pendingVoid) return;
    setVoidingPaymentId(pendingVoid.id);
    try {
      const result = await paymentService.void(invoice.id, pendingVoid.id);
      setInvoice(result.invoice);
      setPayments((prev) => prev.map((p) => (p.id === result.payment.id ? result.payment : p)));
      toast.success("Payment voided");
      setPendingVoid(null);
      router.refresh();
    } catch (c) { toast.error(c instanceof Error ? c.message : "Could not void payment"); }
    finally { setVoidingPaymentId(null); }
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

  // Not using invoiceService/apiRequest here: apiRequest always parses the
  // response as JSON, but this endpoint returns a raw application/pdf
  // stream, so we fetch it directly and hand the blob to the browser.
  const fetchInvoicePdf = async (): Promise<Blob> => {
    const response = await fetch(`/api/invoices/${id}/pdf`, { credentials: "include" });
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.message || "Could not generate PDF");
    }
    return response.blob();
  };

  const handlePrint = () => {
    if (!invoice) return;
    // Open a blank tab synchronously, inside this click handler's user
    // gesture — some browsers only allow window.open to bypass the popup
    // blocker when called synchronously from the gesture, so opening it
    // after the `await fetchInvoicePdf()` below (as before) could get
    // silently blocked. We point this tab at the PDF once it's ready.
    // (No "noopener" here: that flag makes window.open return null,
    // which we need in order to set its location afterward — safe in
    // this case since the tab only ever shows our own blob: URL.)
    const printTab = window.open("", "_blank", "noreferrer");
    void (async () => {
      setPdfBusy("print");
      try {
        if (!printTab) {
          throw new Error("Your browser blocked the new tab — allow pop-ups for this site and try again.");
        }
        const blob = await fetchInvoicePdf();
        const url = URL.createObjectURL(blob);
        printTab.location.href = url;
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      } catch (c) {
        printTab?.close();
        toast.error(c instanceof Error ? c.message : "Could not open invoice for printing");
      } finally {
        setPdfBusy(null);
      }
    })();
  };

  const handleExportPdf = async () => {
    if (!invoice) return;
    setPdfBusy("download");
    try {
      const blob = await fetchInvoicePdf();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${invoice.number}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (c) { toast.error(c instanceof Error ? c.message : "Could not export PDF"); }
    finally { setPdfBusy(null); }
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
            <Button variant="outline" disabled={pdfBusy !== null} onClick={handlePrint}>
              {pdfBusy === "print" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Printer className="h-4 w-4" />
              )}
              Print
            </Button>
            <Button variant="outline" disabled={pdfBusy !== null} onClick={() => void handleExportPdf()}>
              {pdfBusy === "download" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export PDF
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
                  <SelectItem key={o} value={o} disabled={!STAFF_SETTABLE_STATUSES.includes(o)}>
                    <span className="capitalize">{o.replace(/_/g, " ")}</span>
                  </SelectItem>
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
          <PaymentHistoryList
            payments={payments}
            loading={paymentsLoading}
            onVoid={(payment) => setPendingVoid(payment)}
            voidingPaymentId={voidingPaymentId}
          />
        </CardContent>
      </Card>

      <RecordPaymentDialog
        open={payDialogOpen}
        onOpenChange={setPayDialogOpen}
        balance={balance}
        saving={recordingPayment}
        onSubmit={recordPayment}
      />

      <ConfirmDialog
        open={pendingVoid !== null}
        onOpenChange={(open) => !open && setPendingVoid(null)}
        title="Void this payment?"
        description={
          pendingVoid
            ? `This keeps ${formatKES(pendingVoid.amount)} in the ledger for the record but removes it from the invoice's paid amount. This can't be undone.`
            : undefined
        }
        confirmLabel="Void payment"
        loading={voidingPaymentId !== null}
        onConfirm={() => void voidPayment()}
      />
    </div>
  );
}
