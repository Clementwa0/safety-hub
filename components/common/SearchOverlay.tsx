"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaMagnifyingGlass, FaArrowRight, FaClock } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { SafeImage } from "@/components/shared/SafeImage";
import { useSearch } from "@/hooks/useSearch";
import { formatKES } from "@/lib/format";

interface SearchOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Recent searches (in a real app, this would be stored in localStorage or a database)
const recentSearches = [
  "Helmet",
  "Safety gloves",
  "Protective boots",
  "Safety vest"
];

export default function SearchOverlay({ open, onOpenChange }: SearchOverlayProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { results, loading } = useSearch(query);
  const trimmedQuery = query.trim();

  // Start with a clean box every time the overlay is opened.
  useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  const goToProduct = (id: string) => {
    onOpenChange(false);
    router.push(`/products/${id}`);
  };

  const goToFullResults = () => {
    onOpenChange(false);
    router.push(trimmedQuery ? `/search?q=${encodeURIComponent(trimmedQuery)}` : "/search");
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && trimmedQuery) {
      event.preventDefault();
      goToFullResults();
    }
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search products"
      description="Search the product catalog by name, brand, or SKU"
      showCloseButton
      className="max-w-2xl"
    >
      <div className="relative">
        {/* Decorative gradient background */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-50"></div>
        
        <Command shouldFilter={false} className="relative">
          {/* Search Input with enhanced styling */}
          <div className="relative border-b border-border/50">
            <CommandInput
              placeholder="Search for helmets, gloves, boots..."
              value={query}
              onValueChange={setQuery}
              onKeyDown={handleKeyDown}
              className="h-14 text-base placeholder:text-muted-foreground/60"
              autoFocus
            />
            {trimmedQuery && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Clear search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>

          <CommandList className="max-h-[400px]">
            <AnimatePresence mode="wait">
              {!trimmedQuery ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Recent Searches */}
                  <CommandGroup heading="Recent Searches" className="border-b border-border/50 pb-2">
                    {recentSearches.map((search) => (
                      <CommandItem
                        key={search}
                        value={search}
                        onSelect={() => setQuery(search)}
                        className="group cursor-pointer gap-3 py-2.5 hover:bg-primary/5"
                      >
                        <FaClock className="h-4 w-4 text-muted-foreground/60 group-hover:text-primary" />
                        <span className="text-sm">{search}</span>
                        <div className="ml-auto opacity-0 transition-opacity group-hover:opacity-100">
                          <FaArrowRight className="h-3 w-3 text-muted-foreground/40" />
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>

                  {/* Popular Categories 
                  <CommandGroup heading="Popular Categories">
                    {["Helmets", "Gloves", "Boots", "Safety Vests", "Eye Protection"].map((category) => (
                      <CommandItem
                        key={category}
                        value={category}
                        onSelect={() => {
                          onOpenChange(false);
                          router.push(`/categories/${category.toLowerCase()}`);
                        }}
                        className="group cursor-pointer gap-3 py-2.5 hover:bg-primary/5"
                      >
                        <span className="text-sm">{category}</span>
                        <span className="ml-auto text-xs text-muted-foreground/60">Browse</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  */}
                  <div className="border-t border-border/50 p-4 text-center">
                    <p className="text-xs text-muted-foreground/60">
                      ⌘K or Ctrl+K to search anytime
                    </p>
                  </div>
                </motion.div>
              ) : loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-16"
                >
                  <div className="relative h-12 w-12">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin"></div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">Searching products...</p>
                </motion.div>
              ) : results.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <div className="mb-4 rounded-full bg-muted p-4">
                    <FaMagnifyingGlass className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-medium text-foreground">No products found</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    We couldn't find anything matching &ldquo;{trimmedQuery}&rdquo;
                  </p>
                  <button
                    onClick={goToFullResults}
                    className="mt-4 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                  >
                    View all results
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <CommandGroup heading={`${results.length} Results for "${trimmedQuery}"`}>
                    {results.map((product) => (
                      <CommandItem
                        key={product.id}
                        value={product.id}
                        onSelect={() => goToProduct(product.id)}
                        className="group cursor-pointer gap-3 py-3 hover:bg-primary/5"
                      >
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gradient-to-br from-gray-50 to-white shadow-sm transition-transform group-hover:scale-105">
                          <SafeImage
                            src={product.image}
                            alt=""
                            fill
                            className="object-contain p-2"
                            sizes="56px"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                            {product.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="truncate text-xs text-muted-foreground">{product.category}</span>
                            <span className="h-1 w-1 rounded-full bg-muted-foreground/30"></span>
                            <span className="text-xs text-primary/80 font-medium">
                              {formatKES(product.price)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground/60">View</span>
                          <FaArrowRight className="h-3 w-3 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </CommandItem>
                    ))}
                    <CommandItem
                      value="__view-all-results"
                      onSelect={goToFullResults}
                      className="mt-2 cursor-pointer justify-center gap-2 rounded-lg border border-dashed border-primary/30 bg-primary/5 py-3 text-sm font-medium text-primary transition-all hover:bg-primary/10 hover:border-primary/50"
                    >
                      <FaMagnifyingGlass className="h-3.5 w-3.5" />
                      View all {results.length} results for &ldquo;{trimmedQuery}&rdquo;
                      <FaArrowRight className="h-3 w-3" />
                    </CommandItem>
                  </CommandGroup>
                </motion.div>
              )}
            </AnimatePresence>
          </CommandList>

          {/* Keyboard shortcuts hint */}
          <div className="absolute bottom-4 right-4 hidden items-center gap-2 text-xs text-muted-foreground/40 sm:flex">
            <kbd className="rounded border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
            <span>or</span>
            <kbd className="rounded border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-[10px]">CtrlK</kbd>
            <span className="mx-1">•</span>
            <kbd className="rounded border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-[10px]">ESC</kbd>
            <span>to close</span>
          </div>
        </Command>
      </div>
    </CommandDialog>
  );
}