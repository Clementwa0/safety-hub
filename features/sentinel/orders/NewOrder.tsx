"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import OrderForm from "./components/OrderForm";

export default function NewOrderPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="New order"
        description="Record a new customer order."
      />
      <OrderForm />
    </div>
  );
}
