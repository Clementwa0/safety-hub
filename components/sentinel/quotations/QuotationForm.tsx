"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import CustomerFields from "@/components/sentinel/sales/CustomerFields";
import LineItemsEditor from "@/components/sentinel/sales/LineItemsEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <form onSubmit={submit} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
        <CardContent><CustomerFields value={customer} onChange={setCustomer} /></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Issue date</Label>
            <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Valid until</Label>
            <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => typeof v === "string" && setStatus(v as QuotationStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {QUOTATION_STATUSES.map((o) => (
                  <SelectItem key={o} value={o}><span className="capitalize">{o}</span></SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Line items</CardTitle></CardHeader>
        <CardContent><LineItemsEditor items={items} onChange={setItems} /></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Notes & terms</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
          </div>
          <div className="space-y-2">
            <Label>Terms</Label>
            <Textarea value={terms} onChange={(e) => setTerms(e.target.value)} rows={4} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : quotation ? "Save changes" : "Create quotation"}</Button>
      </div>
    </form>
  );
}
