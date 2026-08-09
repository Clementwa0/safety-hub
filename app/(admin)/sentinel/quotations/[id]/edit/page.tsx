"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import QuotationForm from "@/components/sentinel/quotations/QuotationForm";
import { EmptyState } from "@/components/shared/EmptyState";
import { Loading } from "@/components/shared/Loading";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { quotationService } from "@/services/sentinel/quotation.service";
import type { Quotation } from "@/types/sentinel/quotation";

export default function EditQuotationPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    void (async () => {
      setLoading(true); setError(null);
      try { const r = await quotationService.getById(id); if (active) setQuotation(r); }
      catch (c) { if (active) setError(c instanceof Error ? c.message : "Could not load"); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [id]);

  return (
    <div className="space-y-6">
      <PageHeader title="Edit quotation" description={quotation?.number}
        breadcrumbs={[
          { label: "Admin", href: "/sentinel/dashboard" },
          { label: "Quotations", href: "/sentinel/quotations" },
          { label: "Edit" },
        ]} />
      {loading ? <Loading label="Loading quotation..." /> :
       error || !quotation ? (
         <EmptyState title="Quotation not found" description={error ?? "This quotation may have been deleted."}
           action={<Button variant="outline" onClick={() => window.location.reload()}>Try again</Button>} />
       ) : <QuotationForm quotation={quotation} />}
    </div>
  );
}
