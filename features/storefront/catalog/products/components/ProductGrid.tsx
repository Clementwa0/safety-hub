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
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse overflow-hidden rounded-lg sm:rounded-xl border bg-white shadow-sm"
          >
            <div className="aspect-square bg-gradient-to-b from-gray-200 to-gray-100" />
            <div className="space-y-1.5 p-2 sm:space-y-2 sm:p-2.5">
              <div className="h-2.5 w-2/3 rounded bg-gray-200" />
              <div className="h-2 w-1/2 rounded bg-gray-200" />
              <div className="flex items-center justify-between">
                <div className="h-3 w-16 rounded bg-gray-200" />
                <div className="h-6 w-6 rounded bg-gray-200" />
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
        className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white p-6 text-center"
      >
        <div className="mb-3 rounded-full bg-secondary/10 p-3 sm:p-4">
          <FaBoxOpen className="h-6 w-6 sm:h-8 sm:w-8 text-secondary" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-primary">
          No Products Found
        </h3>
        <p className="mt-1 max-w-md text-xs sm:text-sm text-muted-foreground">
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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: Math.min(index * 0.02, 0.5),
            duration: 0.25,
            ease: "easeOut",
          }}
        >
          <ProductCard 
            product={{ ...product, hasVariants: hasVariants(product) }}
            compact
          />
        </motion.div>
      ))}
    </motion.div>
  );
}