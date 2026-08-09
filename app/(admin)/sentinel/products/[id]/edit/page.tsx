"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import ProductForm from "@/components/sentinel/ProductForm";
import { EmptyState } from "@/components/shared/EmptyState";
import { Loading } from "@/components/shared/Loading";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { productService } from "@/services/shared/product.service";
import type { Product } from "@/types/product";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let active = true;

    void (async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await productService.getById(id);
        if (active) setProduct(result);
      } catch (caught) {
        if (active) {
          setError(
            caught instanceof Error ? caught.message : "Could not load the product",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit product"
        description={product?.name ?? "Update catalogue details."}
        breadcrumbs={[
          { label: "Admin", href: "/sentinel/dashboard" },
          { label: "Products", href: "/sentinel/products" },
          { label: "Edit" },
        ]}
      />

      {loading ? (
        <Loading label="Loading product..." />
      ) : error || !product ? (
        <EmptyState
          title="Product not found"
          description={error ?? "This product may have been deleted."}
          action={
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try again
            </Button>
          }
        />
      ) : (
        <ProductForm product={product} />
      )}
    </div>
  );
}
