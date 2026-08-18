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
import { toDateInputValue, fromDateInputValue } from "@/lib/format";

const EMPTY_CUSTOMER: Customer = { name: "", email: "", phone: "", company: "", address: "" };

export default function InvoiceForm({ invoice }: { invoice?: Invoice }) {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer>(invoice?.customer ?? EMPTY_CUSTOMER);
  const [items, setItems] = useState<LineItem[]>(invoice?.items ?? []);
  const [issueDate, setIssueDate] = useState(toDateInputValue(invoice?.issueDate));
  const [dueDate, setDueDate] = useState(toDateInputValue(invoice?.dueDate));
  const [status, setStatus] = useState<InvoiceStatus>(invoice?.status ?? "draft");
  const [amountPaid, setAmountPaid] = useState(String(invoice?.amountPaid ?? 0));
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
        amountPaid: Number(amountPaid) || 0,
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
                  <SelectItem key={o} value={o}><span className="capitalize">{o.replace(/_/g, " ")}</span></SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Amount paid</Label>
            <Input type="number" min="0" step="0.01" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} />
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
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : invoice ? "Save changes" : "Create invoice"}</Button>
      </div>
    </form>
  );
}
