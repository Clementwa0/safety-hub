"use client";

import { useEffect, useRef, useState } from "react";

import { productService } from "@/services/product.service";
import type { Product } from "@/types/product";

const DEBOUNCE_MS = 300;
const MAX_RESULTS = 6;

/**
 * Debounced live-search against the product catalog. Used by the navbar's
 * search overlay for autocomplete-style results as the person types.
 *
 * Requests are tagged with an incrementing id so a slow, stale response
 * (e.g. from a query the user already changed) can never overwrite a
 * newer one that resolved first.
 */
export function useSearch(query: string) {
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      requestId.current += 1;
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    const currentRequest = ++requestId.current;
    setLoading(true);
    setError(null);

    const timeout = setTimeout(() => {
      void productService
        .list({ search: trimmed, status: "active" })
        .then((items) => {
          if (requestId.current !== currentRequest) return;
          setResults(items.slice(0, MAX_RESULTS));
        })
        .catch(() => {
          if (requestId.current !== currentRequest) return;
          setError("Couldn't load search results.");
          setResults([]);
        })
        .finally(() => {
          if (requestId.current !== currentRequest) return;
          setLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [query]);

  return { results, loading, error };
}
