"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { EmptyState } from "@/components/shared/EmptyState";
import { Loading } from "@/components/shared/Loading";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { invoiceService } from "@/services/sentinel/invoice.service";
import type { Invoice } from "@/types/sentinel/invoice";
import InvoiceForm from "./components/InvoiceForm";

export default function EditInvoicePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    void (async () => {
      setLoading(true); setError(null);
      try { const r = await invoiceService.getById(id); if (active) setInvoice(r); }
      catch (c) { if (active) setError(c instanceof Error ? c.message : "Could not load"); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [id]);

  return (
    <div className="space-y-6">
      <PageHeader title="Edit invoice" description={invoice?.number}
        breadcrumbs={[
          { label: "Admin", href: "/sentinel/dashboard" },
          { label: "Invoices", href: "/sentinel/invoices" },
          { label: "Edit" },
        ]} />
      {loading ? <Loading label="Loading invoice..." /> :
       error || !invoice ? (
         <EmptyState title="Invoice not found" description={error ?? "This invoice may have been deleted."}
           action={<Button variant="outline" onClick={() => window.location.reload()}>Try again</Button>} />
       ) : <InvoiceForm invoice={invoice} />}
    </div>
  );
}
