"use client";

import InvoiceForm from "@/components/sentinel/invoices/InvoiceForm";
import { PageHeader } from "@/components/shared/PageHeader";

export default function NewInvoicePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="New invoice" description="Bill a customer for goods or services."
        breadcrumbs={[
          { label: "Admin", href: "/sentinel/dashboard" },
          { label: "Invoices", href: "/sentinel/invoices" },
          { label: "New" },
        ]} />
      <InvoiceForm />
    </div>
  );
}
