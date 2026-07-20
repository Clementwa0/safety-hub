"use client";

import { useState, useEffect } from "react";
import { getProductById, getRelatedProducts } from "@/data/products";
import type { Product } from "@/data/products";

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

        // Simulate async loading
        await new Promise((resolve) => setTimeout(resolve, 300));

        const found = getProductById(slug);

        if (found) {
          setProduct(found);
          const related = getRelatedProducts(found.id);
          setRelatedProducts(related);
        } else {
          setError("Product not found");
        }
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
