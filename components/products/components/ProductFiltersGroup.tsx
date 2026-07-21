"use client";

import { useState } from "react";
import { FaXmark } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import ProductFilters, { FilterOption } from "./ProductFilters";

type FilterGroup = {
  id: string;
  label: string;
  options: FilterOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
};

type ProductFiltersGroupProps = {
  filters: FilterGroup[];
  onClearAll?: () => void;
  className?: string;
};

export default function ProductFiltersGroup({
  filters,
  onClearAll,
  className = "",
}: ProductFiltersGroupProps) {
  const hasActiveFilters = filters.some(f => f.selectedValue !== "All" && f.selectedValue !== "");

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filter Headers */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <div key={filter.id} className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                {filter.label}:
              </span>
              <ProductFilters
                options={filter.options}
                selectedValue={filter.selectedValue}
                onSelect={filter.onSelect}
                variant="tags"
                className="min-w-[120px]"
              />
            </div>
          ))}
        </div>

        {hasActiveFilters && onClearAll && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition"
          >
            <FaXmark className="h-3.5 w-3.5" />
            Clear All
          </button>
        )}
      </div>

      {/* Active Filters Tags */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 overflow-hidden"
          >
            {filters.map((filter) => {
              const selectedOption = filter.options.find(
                opt => opt.value === filter.selectedValue
              );
              if (!selectedOption || filter.selectedValue === "All" || filter.selectedValue === "") {
                return null;
              }
              return (
                <span
                  key={filter.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary"
                >
                  {filter.label}: {selectedOption.label}
                  <button
                    onClick={() => filter.onSelect("All")}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-secondary/20 transition"
                  >
                    <FaXmark className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}