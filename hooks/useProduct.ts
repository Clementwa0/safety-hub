"use client";

import { useState, useEffect } from "react";
import { productService } from "@/services/product.service";
import type { Product } from "@/types/product";

interface UseProductReturn {
  product: Product | null;
  relatedProducts: Product[];
  loading: boolean;
  error: string | null;
}

export function useProduct(slug: string): UseProductReturn {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!slug) {
          setError("Product ID is required");
          return;
        }

        const found = await productService.getById(slug);
        setProduct(found);

        const related = (await productService.list({ category: found.category })).filter((item) => item.id !== found.id).slice(0, 4);
        setRelatedProducts(related);
      } catch (err) {
        setError("Failed to load product");
        console.error("Error loading product:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [slug]);

  return { product, relatedProducts, loading, error };
}
