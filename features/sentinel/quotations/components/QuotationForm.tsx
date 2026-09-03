"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import CustomerFields from "@/components/sentinel/sales/CustomerFields";
import LineItemsEditor from "@/components/sentinel/sales/LineItemsEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { quotationService } from "@/services/sentinel/quotation.service";
import { QUOTATION_STATUSES, type Quotation, type QuotationStatus } from "@/types/sentinel/quotation";
import type { Customer, LineItem } from "@/types/sentinel/sales";
import { toDateInputValue, fromDateInputValue } from "@/lib/format";

const EMPTY_CUSTOMER: Customer = { name: "", email: "", phone: "", company: "", address: "" };

export default function QuotationForm({ quotation }: { quotation?: Quotation }) {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer>(quotation?.customer ?? EMPTY_CUSTOMER);
  const [items, setItems] = useState<LineItem[]>(quotation?.items ?? []);
  const [issueDate, setIssueDate] = useState(toDateInputValue(quotation?.issueDate));
  const [validUntil, setValidUntil] = useState(toDateInputValue(quotation?.validUntil));
  const [status, setStatus] = useState<QuotationStatus>(quotation?.status ?? "draft");
  const [notes, setNotes] = useState(quotation?.notes ?? "");
  const [terms, setTerms] = useState(quotation?.terms ?? "");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.name.trim()) { toast.error("Customer name is required"); return; }
    if (items.length === 0) { toast.error("Add at least one line item"); return; }
    setSaving(true);
    try {
      const payload = {
        customer, items, status, notes, terms,
        issueDate: fromDateInputValue(issueDate) ?? new Date().toISOString(),
        validUntil: fromDateInputValue(validUntil),
      };
      if (quotation) {
        await quotationService.update(quotation.id, payload);
        toast.success("Quotation updated");
      } else {
        await quotationService.create(payload);
        toast.success("Quotation created");
      }
      router.push("/sentinel/quotations");
    } catch (c) { toast.error(c instanceof Error ? c.message : "Could not save"); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-1.5 px-1 sm:space-y-2">
      {/* Customer */}
      <div className="rounded-lg border border-border/30 bg-background p-1.5 sm:p-3">
        <h3 className="text-xs font-medium text-muted-foreground sm:text-sm">Customer</h3>
        <div className="mt-1">
          <CustomerFields value={customer} onChange={setCustomer} />
        </div>
      </div>

      {/* Details */}
      <div className="rounded-lg border border-border/30 bg-background p-1.5 sm:p-3">
        <h3 className="text-xs font-medium text-muted-foreground sm:text-sm">Details</h3>
        <div className="mt-1 grid grid-cols-2 gap-1 sm:grid-cols-3 sm:gap-2">
          <div>
            <Label className="text-[10px] sm:text-xs">Issue</Label>
            <Input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="h-7 text-xs sm:h-8 sm:text-sm"
            />
          </div>
          <div>
            <Label className="text-[10px] sm:text-xs">Valid until</Label>
            <Input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="h-7 text-xs sm:h-8 sm:text-sm"
            />
          </div>
          <div>
            <Label className="text-[10px] sm:text-xs">Status</Label>
            <Select value={status} onValueChange={(v) => typeof v === "string" && setStatus(v as QuotationStatus)}>
              <SelectTrigger className="h-7 text-xs sm:h-8 sm:text-sm">
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
        </div>
      </div>

      {/* Line Items */}
      <div className="rounded-lg border border-border/30 bg-background p-1.5 sm:p-3">
        <h3 className="text-xs font-medium text-muted-foreground sm:text-sm">Line items</h3>
        <div className="mt-1">
          <LineItemsEditor items={items} onChange={setItems} stockAware />
        </div>
      </div>

      {/* Notes & Terms */}
      <div className="rounded-lg border border-border/30 bg-background p-1.5 sm:p-3">
        <h3 className="text-xs font-medium text-muted-foreground sm:text-sm">Notes &amp; terms</h3>
        <div className="mt-1 grid grid-cols-1 gap-1 sm:grid-cols-2 sm:gap-2">
          <div>
            <Label className="text-[10px] sm:text-xs">Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="min-h-[50px] resize-none text-xs sm:min-h-[60px] sm:text-sm"
            />
          </div>
          <div>
            <Label className="text-[10px] sm:text-xs">Terms</Label>
            <Textarea
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              rows={2}
              className="min-h-[50px] resize-none text-xs sm:min-h-[60px] sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap justify-end gap-1 px-1 pb-2 sm:gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          size="sm"
          className="h-7 text-xs sm:h-8 sm:text-sm"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={saving}
          size="sm"
          className="h-7 text-xs sm:h-8 sm:text-sm"
        >
          {saving ? "Saving…" : quotation ? "Save changes" : "Create quotation"}
        </Button>
      </div>
    </form>
  );
}