"use client";

import QuotationForm from "@/components/sentinel/quotations/QuotationForm";
import { PageHeader } from "@/components/shared/PageHeader";

export default function NewQuotationPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="New quotation" description="Draft a quotation for a customer."
        breadcrumbs={[
          { label: "Admin", href: "/sentinel/dashboard" },
          { label: "Quotations", href: "/sentinel/quotations" },
          { label: "New" },
        ]} />
      <QuotationForm />
    </div>
  );
}
