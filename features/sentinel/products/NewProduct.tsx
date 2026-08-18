import { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import ProductForm from "./components/ProductForm";

export const metadata: Metadata = {
  title: "Add Product | Admin",
  description: "Create a new product for your catalogue.",
};

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Add product"
        description="Create a new catalogue item."
      />

      <ProductForm />
    </div>
  );
}