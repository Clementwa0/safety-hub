"use client";

import { motion } from "framer-motion";
import { FaArrowsUpDown, FaFilter } from "react-icons/fa6";

interface MobileFilterBarProps {
  onFilterOpen: () => void;
  onSortOpen: () => void;
  activeFilterCount?: number;
  totalProducts?: number;
}

export default function MobileFilterBar({
  onFilterOpen,
  onSortOpen,
  activeFilterCount = 0,
  totalProducts = 0,
}: MobileFilterBarProps) {
  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 320,
        damping: 28,
      }}
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] left-1/2 z-50 -translate-x-1/2 lg:hidden"
    >
      <div className="overflow-hidden rounded-full border border-border/60 bg-background/90 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center">

          {/* Sort */}
          <button
            type="button"
            onClick={onSortOpen}
            aria-label="Sort products"
            className="flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors hover:bg-muted active:scale-95"
          >
            <FaArrowsUpDown className="h-3.5 w-3.5 text-secondary" />
            <span>Sort</span>
          </button>

          <div className="h-8 w-px bg-border" />

          {/* Filter */}
          <button
            type="button"
            onClick={onFilterOpen}
            aria-label="Open filters"
            className="relative flex items-center gap-2 bg-secondary px-5 py-3 text-sm font-semibold text-secondary-foreground transition-all hover:bg-secondary/90 active:scale-95"
          >
            <FaFilter className="h-3.5 w-3.5" />

            <span>Filters</span>

            {activeFilterCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 18,
                }}
                className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white shadow"
              >
                {activeFilterCount}
              </motion.span>
            )}
          </button>
        </div>

        {totalProducts > 0 && (
          <div className="border-t border-border/50 bg-muted/40 px-4 py-1 text-center text-[10px] font-medium text-muted-foreground">
            {totalProducts.toLocaleString()} Products
          </div>
        )}
      </div>
    </motion.div>
  );
}