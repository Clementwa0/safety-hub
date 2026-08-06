"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";

import { productService } from "@/services/product.service";
import type { Product } from "@/types/product";
import ProductCard from "../products/components/Product-Card";

export default function NewArrivals() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      try {
        const items = await productService.list({
          status: "active",
          isNewArrival: true,
        });

        if (mounted) {
          setProducts(items.slice(0, 4));
        }
      } catch (error) {
        console.error("Failed to load new arrivals:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

if (!loading && products.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-8 sm:py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-primary sm:text-2xl">
              New Arrivals
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              The latest safety gear just added to the shop.
            </p>
          </div>

          <Link
            href="/shop?sort=newest"
            className="group inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-secondary"
          >
            See All
            <FaArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white"
              >
                <div className="aspect-square bg-slate-200" />

                <div className="space-y-3 p-3">
                  <div className="h-4 rounded bg-slate-200" />
                  <div className="h-3 w-2/3 rounded bg-slate-200" />

                  <div className="flex justify-between">
                    <div className="h-4 w-16 rounded bg-slate-200" />
                    <div className="h-8 w-8 rounded bg-slate-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      {!loading && products.length > 0 && (
          <div
            className="gap-4 grid grid-cols-2 sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:px-0
                       lg:grid-cols-4 lg:gap-5"
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="w-[45vw] shrink-0 snap-start sm:w-auto"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
