"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FileCheck2, Pencil } from "lucide-react";
import { toast } from "sonner";

import DocumentPreview from "@/components/sentinel/sales/DocumentPreview";
import { ShareDocumentMenu } from "@/components/sentinel/sales/ShareDocumentMenu";
import { StockAvailabilityPanel } from "@/components/sentinel/sales/StockAvailabilityPanel";
import { QuotationStatusBadge } from "@/components/sentinel/sales/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Loading } from "@/components/shared/Loading";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      const order = await quotationService.convertToOrder(quotation.id);
      toast.success(`Sales order ${order.number} created`);
      router.push(`/sentinel/orders/${order.id}`);
    } catch (c) { toast.error(c instanceof Error ? c.message : "Could not convert"); }
    finally { setConverting(false); }
  };

  if (loading) return <Loading label="Loading quotation..." />;
  if (error || !quotation) {
    return <EmptyState title="Quotation not found" description={error ?? "This quotation may have been deleted."} />;
  }

  const canConvert = quotation.status === "accepted";
  const customerName = quotation.customer?.name ?? "Deleted customer";
  const customerCompany = quotation.customer?.company;

  return (
    <div className="space-y-2 sm:space-y-3">
      <PageHeader
        title={`Quotation ${quotation.number}`}
        description={`For ${customerName}${customerCompany ? ` · ${customerCompany}` : ""}`}

        actions={
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <ShareDocumentMenu
              type="quotation"
              id={quotation.id}
              documentLabel="Quotation"
              documentNumber={quotation.number}
              customerName={quotation.customer?.name}
              customerEmail={quotation.customer?.email || undefined}
              triggerSize="sm"
              triggerClassName="h-7 gap-1 px-2 text-xs sm:h-8 sm:px-3 sm:text-sm"
            />
            <Button
              nativeButton={false}
              render={<Link href={`/sentinel/quotations/${quotation.id}/edit`} />}
              size="sm"
              className="h-7 gap-1 px-2 text-xs sm:h-8 sm:px-3 sm:text-sm"
            >
              <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Edit</span>
            </Button>
            {canConvert && (
              <Button
                onClick={() => void convert()}
                disabled={converting}
                size="sm"
                className="h-7 gap-1 px-2 text-xs sm:h-8 sm:px-3 sm:text-sm"
              >
                <FileCheck2 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Convert</span>
              </Button>
            )}
          </div>
        }
        className="[&>h1]:text-base [&>p]:text-xs sm:[&>h1]:text-lg sm:[&>p]:text-sm"
      />

      <Card className="border-border/40 shadow-sm">
        <CardContent className="flex flex-col gap-2 p-2 sm:p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground sm:text-sm">Status</span>
            <QuotationStatusBadge status={quotation.status}  />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground sm:text-sm">Change</Label>
            <Select
              value={quotation.status}
              disabled={updating}
              onValueChange={(v) => typeof v === "string" && void updateStatus(v as QuotationStatus)}
            >
              <SelectTrigger className="h-7 w-32 text-xs sm:h-8 sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUOTATION_STATUSES.map((o) => (
                  <SelectItem key={o} value={o} className="capitalize text-xs sm:text-sm">
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <StockAvailabilityPanel items={quotation.items}  />

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
        className="border-border/40 shadow-sm"
      />
    </div>
  );
}