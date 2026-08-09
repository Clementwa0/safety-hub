"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Download, FileCheck2, Pencil, Printer, Send } from "lucide-react";
import { toast } from "sonner";

import DocumentPreview from "@/components/sentinel/sales/DocumentPreview";
import { QuotationStatusBadge } from "@/components/sentinel/sales/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Loading } from "@/components/shared/Loading";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { quotationService } from "@/services/sentinel/quotation.service";
import { QUOTATION_STATUSES, type Quotation, type QuotationStatus } from "@/types/sentinel/quotation";

export default function QuotationViewPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [converting, setConverting] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true); setError(null);
    try { setQuotation(await quotationService.getById(id)); }
    catch (c) { setError(c instanceof Error ? c.message : "Could not load"); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [load]);

  const updateStatus = async (next: QuotationStatus) => {
    if (!quotation) return;
    setUpdating(true);
    try {
      const updated = await quotationService.update(quotation.id, { status: next });
      setQuotation(updated);
      toast.success(`Status updated to ${next}`);
      router.refresh();
    } catch (c) { toast.error(c instanceof Error ? c.message : "Could not update"); }
    finally { setUpdating(false); }
  };

  const convert = async () => {
    if (!quotation) return;
    setConverting(true);
    try {
      const invoice = await quotationService.convertToInvoice(quotation.id);
      toast.success(`Invoice ${invoice.number} created`);
      router.push(`/sentinel/invoices/${invoice.id}`);
    } catch (c) { toast.error(c instanceof Error ? c.message : "Could not convert"); }
    finally { setConverting(false); }
  };

  const sendToCustomer = () => {
    toast.success("Quotation queued to send (placeholder).");
  };

  if (loading) return <Loading label="Loading quotation..." />;
  if (error || !quotation) {
    return <EmptyState title="Quotation not found" description={error ?? "This quotation may have been deleted."} />;
  }

  const canConvert = quotation.status === "accepted";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Quotation ${quotation.number}`}
        description={`For ${quotation.customer.name}${quotation.customer.company ? ` · ${quotation.customer.company}` : ""}`}
        breadcrumbs={[
          { label: "Admin", href: "/sentinel/dashboard" },
          { label: "Quotations", href: "/sentinel/quotations" },
          { label: quotation.number },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={sendToCustomer}>
              <Send className="h-4 w-4" /> Send
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Print
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Download className="h-4 w-4" /> Export PDF
            </Button>
            <Button nativeButton={false} render={<Link href={`/sentinel/quotations/${quotation.id}/edit`} />}>
              <Pencil className="h-4 w-4" /> Edit
            </Button>
            {canConvert ? (
              <Button onClick={() => void convert()} disabled={converting}>
                <FileCheck2 className="h-4 w-4" /> Convert to invoice
              </Button>
            ) : null}
          </div>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base">Status</CardTitle>
            <div className="mt-2"><QuotationStatusBadge status={quotation.status} /></div>
          </div>
          <div className="w-full max-w-xs space-y-2">
            <Label>Change status</Label>
            <Select value={quotation.status} disabled={updating}
              onValueChange={(v) => typeof v === "string" && void updateStatus(v as QuotationStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {QUOTATION_STATUSES.map((o) => (
                  <SelectItem key={o} value={o}><span className="capitalize">{o}</span></SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      <DocumentPreview
        documentType="Quotation"
        documentNumber={quotation.number}
        issueDate={quotation.issueDate}
        validUntil={quotation.validUntil}
        status={quotation.status}
        customer={quotation.customer}
        items={quotation.items}
        notes={quotation.notes}
        terms={quotation.terms}
      />
    </div>
  );
}
