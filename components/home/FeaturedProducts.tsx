"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";

import { productService } from "@/services/product.service";
import type { Product } from "@/types/product";
import ProductCard from "../products/components/Product-Card";

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      try {
        const items = await productService.list({
          status: "active",
        });

        if (mounted) {
          setProducts(
            items
              .filter((product) => product.featured)
              .slice(0, 4)
          );
        }
      } catch (error) {
        console.error("Failed to load featured products:", error);
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

  return (
    <section className="bg-slate-50 py-8 sm:py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-primary sm:text-2xl">
              Featured Products
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Popular safety products selected for you.
            </p>
          </div>

          <Link
            href="/shop?featured=true"
            className="group inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-secondary"
          >
            See All
            <FaArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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

        {/* Products */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No featured products available right now.
            </p>

            <Link
              href="/shop"
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary"
            >
              Browse Shop
              <FaArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
