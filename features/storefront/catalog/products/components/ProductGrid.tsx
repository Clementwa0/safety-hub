"use client";

import { FaBoxOpen } from "react-icons/fa6";
import { motion } from "framer-motion";

import { hasVariants, type Product } from "@/types/product";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
}

export default function ProductGrid({
  products,
  loading = false,
}: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 15 }).map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-4 py-8 text-center"
      >
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
          <FaBoxOpen className="h-6 w-6 text-secondary" />
        </div>

        <h3 className="text-sm font-semibold sm:text-base">
          No products found
        </h3>

        <p className="mt-1 max-w-sm text-xs text-muted-foreground sm:text-sm">
          Try changing your search or selected filters.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5"
    >
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: Math.min(index * 0.02, 0.4),
            duration: 0.2,
            ease: "easeOut",
          }}
        >
          <ProductCard
            product={{
              ...product,
              hasVariants: hasVariants(product),
            }}
            compact
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      {/* Image */}
      <div className="aspect-square animate-pulse bg-muted" />

      {/* Content */}
      <div className="space-y-2 p-2.5">
        <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />

        <div className="h-2.5 w-1/2 animate-pulse rounded bg-muted" />

        <div className="flex items-center justify-between pt-0.5">
          <div className="h-3.5 w-16 animate-pulse rounded bg-muted" />
          <div className="h-7 w-7 animate-pulse rounded-md bg-muted" />
        </div>
      </div>
    </div>
  );
}