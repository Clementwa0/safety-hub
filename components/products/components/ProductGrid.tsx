"use client";

import { FaBoxOpen } from "react-icons/fa6";
import { motion } from "framer-motion";

import type { Product } from "@/data/products";
import ProductCard from "./Product-Card";

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
      <div className="grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
        {[...Array(21)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse overflow-hidden rounded-xl border bg-white shadow-sm"
          >
            <div className="aspect-square bg-gray-200" />

            <div className="space-y-2 p-2">
              <div className="h-3 rounded bg-gray-200" />
              <div className="h-2 w-2/3 rounded bg-gray-200" />

              <div className="flex items-center justify-between">
                <div className="h-3 w-12 rounded bg-gray-200" />
                <div className="h-7 w-7 rounded bg-gray-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white p-8 text-center"
      >
        <div className="mb-4 rounded-full bg-secondary/10 p-4">
          <FaBoxOpen className="h-8 w-8 text-secondary" />
        </div>

        <h3 className="text-lg font-semibold text-primary">
          No Products Found
        </h3>

        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Try changing your search or selected filters.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Products */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6"
      >
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: index * 0.02,
              duration: 0.25,
            }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>

      {/* Pagination */}
      {products.length > 21 && (
        <div className="flex justify-center">
          <button className="rounded-xl border border-secondary px-6 py-2 text-sm font-semibold text-secondary transition hover:bg-secondary hover:text-white">
            Load More Products
          </button>
        </div>
      )}
    </div>
  );
}