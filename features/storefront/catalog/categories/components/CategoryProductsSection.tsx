"use client";

import { useEffect, useMemo, useState } from "react";
import { FaBox } from "react-icons/fa6";

import type { Product } from "@/types/product";
import type { SortKey } from "@/types/storefront/shop";
import { cn } from "@/lib/utils";
import ProductCard from "../../products/components/ProductCard";

const PAGE_SIZE = 12;

// Same five options as the shop page's sort control, kept in this shape
// here too so the two never drift apart.
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Relevance" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "az", label: "Name: A-Z" },
];

type Availability = "all" | "in-stock" | "out-of-stock";

interface CategoryProductsSectionProps {
  /** Already scoped to this category and to active status by the server. */
  products: Product[];
  category: string;
}

export default function CategoryProductsSection({
  products,
  category,
}: CategoryProductsSectionProps) {
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [availability, setAvailability] = useState<Availability>("all");
  const [sort, setSort] = useState<SortKey>("featured");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const brands = useMemo(() => {
    const unique = new Set(products.map((p) => p.brand).filter(Boolean));
    return Array.from(unique).sort() as string[];
  }, [products]);

  // Start back at the first page whenever a filter or the sort changes.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedBrands, availability, sort]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setSelectedBrands([]);
    setAvailability("all");
  };

  const filtered = useMemo(() => {
    let result = [...products];

    if (selectedBrands.length > 0) {
      result = result.filter((p) => p.brand && selectedBrands.includes(p.brand));
    }

    if (availability === "in-stock") {
      result = result.filter((p) => p.stock > 0);
    } else if (availability === "out-of-stock") {
      result = result.filter((p) => p.stock <= 0);
    }

    switch (sort) {
      case "newest":
        result.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
        break;
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "az":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // "Relevance" — featured items first, then newest.
        result.sort((a, b) => {
          if (Boolean(b.featured) !== Boolean(a.featured)) {
            return Number(b.featured) - Number(a.featured);
          }
          return (b.createdAt ?? 0) - (a.createdAt ?? 0);
        });
        break;
    }

    return result;
  }, [products, selectedBrands, availability, sort]);

  const visibleProducts = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleProducts.length;
  const hasActiveFilters = selectedBrands.length > 0 || availability !== "all";

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "product" : "products"}
          </p>

          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Sort by</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Availability
          </span>
          {(["all", "in-stock", "out-of-stock"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setAvailability(option)}
              aria-pressed={availability === option}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition",
                availability === option
                  ? "border-secondary bg-secondary text-white"
                  : "border-gray-200 bg-white text-muted-foreground hover:border-secondary/40"
              )}
            >
              {option === "all" ? "All" : option === "in-stock" ? "In Stock" : "Out of Stock"}
            </button>
          ))}

          {brands.length > 0 && (
            <>
              <span className="ml-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Brand
              </span>
              {brands.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => toggleBrand(brand)}
                  aria-pressed={selectedBrands.includes(brand)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition",
                    selectedBrands.includes(brand)
                      ? "border-secondary bg-secondary text-white"
                      : "border-gray-200 bg-white text-muted-foreground hover:border-secondary/40"
                  )}
                >
                  {brand}
                </button>
              ))}
            </>
          )}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="ml-1 text-xs font-medium text-secondary underline-offset-2 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {visibleProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center sm:p-16">
          <span className="rounded-full bg-slate-100 p-4">
            <FaBox className="h-10 w-10 text-muted-foreground/60" aria-hidden="true" />
          </span>
          <p className="mt-5 text-lg font-semibold text-primary">No products match these filters</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Try clearing a filter to see more {category.toLowerCase()} products.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-secondary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} featured={product.featured} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                className="rounded-xl border border-secondary px-6 py-2 text-sm font-semibold text-secondary transition hover:bg-secondary hover:text-white"
              >
                Load More Products
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
