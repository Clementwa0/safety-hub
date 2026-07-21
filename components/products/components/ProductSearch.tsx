"use client";

import { useState, useEffect, useRef } from "react";
import { FaMagnifyingGlass, FaXmark, FaArrowRight, FaBox } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

import type { Product } from "@/data/products";
import { formatKES } from "@/data/products";

interface ProductSearchProps {
  products: Product[];
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  onSelect?: (product: Product) => void;
  autoFocus?: boolean;
}

export default function ProductSearch({
  products,
  placeholder = "Search products...",
  className = "",
  onSearch,
  onSelect,
  autoFocus = false,
}: ProductSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const saved = window.localStorage.getItem("recentSearches");
    if (!saved) {
      return [];
    }

    try {
      return JSON.parse(saved) as string[];
    } catch (error) {
      console.error("Failed to parse recent searches", error);
      return [];
    }
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Save recent searches to localStorage
  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  // Filter products based on query
  const filteredProducts = query.trim()
    ? products.filter((product) => {
        const q = query.toLowerCase();
        return (
          product.name.toLowerCase().includes(q) ||
          product.category.toLowerCase().includes(q) ||
          product.subcategory.toLowerCase().includes(q) ||
          product.description.toLowerCase().includes(q)
        );
      })
    : [];

  // Handle search submit
  const handleSearch = () => {
    if (query.trim()) {
      saveRecentSearch(query.trim());
      onSearch?.(query.trim());
      setIsOpen(false);
      // Navigate to search results page
      router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
    }
  };

  // Handle product selection
  const handleProductSelect = (product: Product) => {
    saveRecentSearch(product.name);
    onSelect?.(product);
    setIsOpen(false);
    router.push(`/products/${product.id}`);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredProducts.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < filteredProducts.length) {
        handleProductSelect(filteredProducts[selectedIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Clear search
  const clearSearch = () => {
    setQuery("");
    setSelectedIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const showResults = isOpen && (query.trim() || recentSearches.length > 0);
  const hasResults = filteredProducts.length > 0;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <FaMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
            if (!e.target.value.trim()) {
              onSearch?.("");
            }
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition"
          >
            <FaXmark className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[400px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
          >
            <div className="max-h-[400px] overflow-y-auto p-2">
              {/* Recent Searches */}
              {!query.trim() && recentSearches.length > 0 && (
                <div className="mb-2">
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Recent Searches
                    </span>
                    <button
                      onClick={() => {
                        setRecentSearches([]);
                        localStorage.removeItem("recentSearches");
                      }}
                      className="text-xs text-muted-foreground hover:text-red-500 transition"
                    >
                      Clear
                    </button>
                  </div>
                  {recentSearches.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setQuery(term);
                        setIsOpen(false);
                        onSearch?.(term);
                        router.push(`/shop?q=${encodeURIComponent(term)}`);
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-gray-50 transition"
                    >
                      <FaMagnifyingGlass className="h-4 w-4 text-muted-foreground" />
                      <span>{term}</span>
                    </button>
                  ))}
                  <hr className="my-2 border-gray-100" />
                </div>
              )}

              {/* Search Results */}
              {query.trim() && (
                <>
                  {hasResults ? (
                    <>
                      <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
                        {filteredProducts.length} results found
                      </div>
                      {filteredProducts.map((product, index) => (
                        <motion.button
                          key={product.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.03 }}
                          onClick={() => handleProductSelect(product)}
                          className={`flex w-full items-center gap-3 rounded-lg p-2.5 transition ${
                            selectedIndex === index
                              ? "bg-secondary/10"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-contain p-1"
                            />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="text-sm font-medium text-primary">
                              {product.name}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {product.category}
                              </span>
                              <span className="text-xs font-semibold text-secondary">
                                {formatKES(product.price)}
                              </span>
                            </div>
                          </div>
                          <FaArrowRight className="h-4 w-4 text-muted-foreground" />
                        </motion.button>
                      ))}
                      
                      {/* View All Results */}
                      <button
                        onClick={handleSearch}
                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-secondary/5 px-4 py-2.5 text-sm font-medium text-secondary hover:bg-secondary/10 transition"
                      >
                        <FaBox className="h-4 w-4" />
                        View all {filteredProducts.length} results
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <FaMagnifyingGlass className="h-10 w-10 text-muted-foreground/30" />
                      <p className="mt-2 text-sm font-medium text-muted-foreground">
                        No products found
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Try adjusting your search terms
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}