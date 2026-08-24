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
import { invoiceService } from "@/services/sentinel/invoice.service";
import { INVOICE_STATUSES, type Invoice, type InvoiceStatus } from "@/types/sentinel/invoice";
import type { Customer, LineItem } from "@/types/sentinel/sales";
import { toDateInputValue, fromDateInputValue, formatKES } from "@/lib/format";

const EMPTY_CUSTOMER: Customer = { name: "", email: "", phone: "", company: "", address: "" };

// "paid"/"partially_paid" are derived from the payment ledger only (see
// app/api/invoices/[id]/route.ts) - this form can issue an invoice
// (draft -> unpaid) or cancel one, nothing more. "overdue" was never a
// real stored value. Kept as the full INVOICE_STATUSES list (with the
// non-editable ones disabled) rather than filtered out entirely, so an
// invoice that's currently "paid"/"partially_paid" still displays its
// real status correctly instead of rendering blank.
const EDITABLE_STATUSES: InvoiceStatus[] = ["draft", "unpaid", "cancelled"];

export default function InvoiceForm({ invoice }: { invoice?: Invoice }) {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer>(invoice?.customer ?? EMPTY_CUSTOMER);
  const [items, setItems] = useState<LineItem[]>(invoice?.items ?? []);
  const [issueDate, setIssueDate] = useState(toDateInputValue(invoice?.issueDate));
  const [dueDate, setDueDate] = useState(toDateInputValue(invoice?.dueDate));
  const [status, setStatus] = useState<InvoiceStatus>(invoice?.status ?? "draft");
  const [notes, setNotes] = useState(invoice?.notes ?? "");
  const [terms, setTerms] = useState(invoice?.terms ?? "");
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
        dueDate: fromDateInputValue(dueDate),
      };
      if (invoice) {
        await invoiceService.update(invoice.id, payload);
        toast.success("Invoice updated");
      } else {
        await invoiceService.create(payload);
        toast.success("Invoice created");
      }
      router.push("/sentinel/invoices");
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
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label>Issue date</Label>
            <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Due date</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => typeof v === "string" && setStatus(v as InvoiceStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {INVOICE_STATUSES.map((o) => (
                  <SelectItem key={o} value={o} disabled={!EDITABLE_STATUSES.includes(o)}>
                    <span className="capitalize">{o.replace(/_/g, " ")}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {invoice ? (
            <div className="space-y-2">
              <Label>Amount paid</Label>
              {/* Read-only: amountPaid is derived from the payment ledger
                  (record/void a payment on the invoice detail page) and
                  can no longer be edited directly from this form - see
                  app/api/invoices/[id]/route.ts. */}
              <Input type="text" value={formatKES(invoice.amountPaid)} disabled readOnly />
            </div>
          ) : null}
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
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : invoice ? "Save changes" : "Create invoice"}</Button>
      </div>
    </form>
  );
}
