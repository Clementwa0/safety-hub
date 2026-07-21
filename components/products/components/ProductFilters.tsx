"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FaChevronLeft, FaChevronRight, FaTableCellsLarge, FaXmark } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";

export type FilterOption = {
  label: string;
  value: string;
  count?: number;
};

type ProductFiltersProps = {
  options: FilterOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  label?: string;
  variant?: "default" | "categories" | "tags" | "sizes" | "colors";
  showCounts?: boolean;
  className?: string;
};

export default function ProductFilters({
  options,
  selectedValue,
  onSelect,
  label = "Filter",
  variant = "default",
  showCounts = false,
  className = "",
}: ProductFiltersProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 20);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = scrollContainerRef.current.scrollLeft + 
        (direction === "left" ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  const getVariantStyles = (isSelected: boolean) => {
    switch (variant) {
      case "categories":
        return {
          base: "rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200",
          selected: "bg-secondary text-white hover:bg-secondary/90",
          unselected: "bg-gray-100 text-gray-700 hover:bg-gray-200",
        };
      case "tags":
        return {
          base: "rounded-lg px-3 py-1 text-xs font-medium transition-all duration-200",
          selected: "bg-primary text-white hover:bg-primary/90",
          unselected: "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100",
        };
      case "sizes":
        return {
          base: "rounded-md px-3 py-1 text-xs font-medium transition-all duration-200 min-w-[2.5rem] text-center",
          selected: "bg-secondary text-white hover:bg-secondary/90",
          unselected: "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100",
        };
      case "colors":
        return {
          base: "rounded-full w-8 h-8 transition-all duration-200 flex items-center justify-center",
          selected: "ring-2 ring-offset-2 ring-secondary scale-110",
          unselected: "hover:scale-105",
        };
      default:
        return {
          base: "rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200",
          selected: "bg-primary text-white hover:bg-primary/90",
          unselected: "bg-gray-100 text-gray-700 hover:bg-gray-200",
        };
    }
  };

  const renderOption = (option: FilterOption) => {
    const isSelected = selectedValue === option.value;
    const styles = getVariantStyles(isSelected);

    if (variant === "colors") {
      return (
        <button
          key={option.value}
          onClick={() => onSelect(option.value)}
          className={`${styles.base} ${isSelected ? styles.selected : styles.unselected}`}
          style={{ backgroundColor: option.value }}
          title={option.label}
        >
          {isSelected && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="h-1.5 w-1.5 rounded-full bg-white shadow-sm" />
            </span>
          )}
        </button>
      );
    }

    return (
      <Button
        key={option.value}
        variant={isSelected ? "default" : "outline"}
        size="sm"
        onClick={() => onSelect(option.value)}
        className={`${styles.base} ${isSelected ? styles.selected : styles.unselected}`}
      >
        {option.label}
        {showCounts && option.count !== undefined && (
          <span className="ml-1 text-[10px] opacity-70">({option.count})</span>
        )}
      </Button>
    );
  };

  // Mobile dropdown
  if (isMobile) {
    const selectedOption = options.find(opt => opt.value === selectedValue);
    
    return (
      <div className={`relative w-full ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-primary shadow-sm hover:bg-gray-50 transition"
        >
          <span className="flex items-center gap-2">
            <FaTableCellsLarge className="h-4 w-4 text-secondary" />
            {selectedOption?.label || label}
          </span>
          <FaChevronRight
            className={`h-4 w-4 transition-transform duration-200 ${
              isOpen ? "rotate-90" : ""
            }`}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[300px] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg"
            >
              <div className="p-2">
                {options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onSelect(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full rounded-lg px-4 py-2.5 text-left text-sm transition ${
                      selectedValue === option.value
                        ? "bg-secondary text-white"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {option.label}
                    {showCounts && option.count !== undefined && (
                      <span className="ml-2 text-xs opacity-70">({option.count})</span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Desktop scrollable
  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      <AnimatePresence>
        {showLeftArrow && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => scroll("left")}
            className="absolute -left-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-50 transition"
          >
            <FaChevronLeft className="h-4 w-4 text-gray-600" />
          </motion.button>
        )}
      </AnimatePresence>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {options.map(renderOption)}
      </div>

      <AnimatePresence>
        {showRightArrow && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => scroll("right")}
            className="absolute -right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-50 transition"
          >
            <FaChevronRight className="h-4 w-4 text-gray-600" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}