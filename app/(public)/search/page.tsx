"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";

import { productService } from "@/services/product.service";
import type { Product } from "@/types/product";
import { formatKES } from "@/lib/format";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const [results, setResults] = useState<Product[]>([]);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    void productService.list({ search: query, status: "active" }).then((items) => setResults(items));
  }, [query]);

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 lg:py-16">
      <div className="rounded-3xl border border-border bg-card/70 p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-secondary/10 p-3 text-secondary">
            <FaMagnifyingGlass className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Search results</h1>
            <p className="text-sm text-muted-foreground">
              {query ? `Showing products matching “${query}”.` : "Enter a search term to explore PPE products."}
            </p>
          </div>
        </div>

        {query && results.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No products matched your search. Try another term.
          </div>
        ) : null}

        {results.length > 0 ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {results.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="rounded-2xl border border-border bg-background p-4 transition hover:border-secondary/40 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-foreground">{product.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{product.category}</p>
                  </div>
                  <span className="text-sm font-semibold text-secondary">{formatKES(product.price)}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
