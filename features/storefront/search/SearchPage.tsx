"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { AlertTriangle } from "lucide-react";

import { productService } from "@/services/shared/product.service";
import type { Product } from "@/types/product";
import { Breadcrumb } from "@/components/shared/ui-bits";
import ProductGrid from "@/features/storefront/catalog/products/components/ProductGrid";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";

  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    productService
      .list({ search: query, status: "active" })
      .then((items) => {
        if (!cancelled) setResults(items);
      })
      .catch(() => {
        if (!cancelled) setError("We couldn't load search results right now. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:pb-14 lg:pt-10">
      <Breadcrumb
        className="mb-4 rounded-xl bg-primary px-4 py-2.5"
        items={[{ label: "Home", href: "/" }, { label: "Search" }]}
      />

      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-full bg-secondary/10 p-3 text-secondary">
          <FaMagnifyingGlass className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Search results</h1>
          <p className="text-sm text-muted-foreground">
            {query ? (
              <>
                {loading ? "Searching" : `${results.length} result${results.length === 1 ? "" : "s"}`}{" "}
                for &ldquo;{query}&rdquo;
              </>
            ) : (
              "Enter a search term to explore PPE products."
            )}
          </p>
        </div>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      ) : !query ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center text-sm text-muted-foreground">
          Try searching for a product name, brand, or category — or{" "}
          <Link href="/shop" className="font-medium text-secondary hover:underline">
            browse the full shop
          </Link>
          .
        </div>
      ) : (
        <ProductGrid products={results} loading={loading} />
      )}
    </main>
  );
}

export default function SearchPage() {
  // useSearchParams needs a Suspense boundary so this route can still be
  // statically rendered instead of forcing the whole app to opt out.
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 pb-24 pt-24 sm:px-6" />}>
      <SearchResults />
    </Suspense>
  );
}
