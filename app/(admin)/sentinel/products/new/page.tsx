"use client";

import ProductForm from "@/components/sentinel/product/ProductForm";
import { PageHeader } from "@/components/shared/PageHeader";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Add product"
        description="Create a new catalogue item."
        breadcrumbs={[
          { label: "Admin", href: "/sentinel/dashboard" },
          { label: "Products", href: "/sentinel/products" },
          { label: "Add product" },
        ]}
      />

      <ProductForm />
    </div>
  );
}
