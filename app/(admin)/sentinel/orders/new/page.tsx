"use client";

import OrderForm from "@/components/sentinel/orders/OrderForm";
import { PageHeader } from "@/components/shared/PageHeader";

export default function NewOrderPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="New order"
        description="Record a new customer order."
        breadcrumbs={[
          { label: "Admin", href: "/sentinel/dashboard" },
          { label: "Orders", href: "/sentinel/orders" },
          { label: "New" },
        ]}
      />
      <OrderForm />
    </div>
  );
}
