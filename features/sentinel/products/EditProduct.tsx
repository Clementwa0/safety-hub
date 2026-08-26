"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { EmptyState } from "@/components/shared/EmptyState";
import { Loading } from "@/components/shared/Loading";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { productService } from "@/services/shared/product.service";
import type { Product } from "@/types/product";

import ProductForm from "./components/ProductForm";

export default function EditProduct() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    if (!id) {
      setError("Product ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await productService.getById(id);

      setProduct(result);
    } catch (caught) {
      setProduct(null);

      setError(
        caught instanceof Error
          ? caught.message
          : "Could not load the product",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!id) {
        if (active) {
          setError("Product ID is missing.");
          setLoading(false);
        }

        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await productService.getById(id);

        if (active) {
          setProduct(result);
        }
      } catch (caught) {
        if (active) {
          setProduct(null);

          setError(
            caught instanceof Error
              ? caught.message
              : "Could not load the product",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [id]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit product"
        description={
          product?.name ?? "Update product information and catalogue details."
        }
      />

      {loading ? (
        <div className="py-8">
          <Loading label="Loading product..." />
        </div>
      ) : error || !product ? (
        <div className="py-8">
          <EmptyState
            title="Product not found"
            description={
              error ?? "This product may have been deleted or no longer exists."
            }
            action={
              <Button
                variant="outline"
                onClick={() => void loadProduct()}
              >
                Try again
              </Button>
            }
          />
        </div>
      ) : (
        <ProductForm product={product} />
      )}
    </div>
  );
}