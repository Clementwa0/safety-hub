"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaMagnifyingGlass } from "react-icons/fa6";

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

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search products"
      description="Search the product catalog by name, brand, or SKU"
      showCloseButton
    >
      {/* Results come from the API (useSearch), so cmdk shouldn't also
          filter client-side against its own idea of a match. */}
      <Command shouldFilter={false}>
        <CommandInput
          placeholder="Search for helmets, gloves, boots..."
          value={query}
          onValueChange={setQuery}
          onKeyDown={(event) => {
            if (event.key === "Enter" && trimmedQuery) {
              event.preventDefault();
              goToFullResults();
            }
          }}
        />
        <CommandList>
          {!trimmedQuery ? (
            <CommandEmpty>Start typing to search products.</CommandEmpty>
          ) : loading ? (
            <CommandEmpty>Searching…</CommandEmpty>
          ) : results.length === 0 ? (
            <CommandEmpty>No products matched &ldquo;{trimmedQuery}&rdquo;.</CommandEmpty>
          ) : (
            <CommandGroup heading="Products">
              {results.map((product) => (
                <CommandItem
                  key={product.id}
                  value={product.id}
                  onSelect={() => goToProduct(product.id)}
                  className="items-center gap-3"
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-gray-100 bg-gray-50">
                    <SafeImage
                      src={product.image}
                      alt=""
                      fill
                      className="object-contain p-1"
                      sizes="40px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{product.category}</p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-secondary">
                    {formatKES(product.price)}
                  </span>
                </CommandItem>
              ))}
              <CommandItem
                value="__view-all-results"
                onSelect={goToFullResults}
                className="justify-center gap-2 text-secondary"
              >
                <FaMagnifyingGlass className="h-3.5 w-3.5" />
                View all results for &ldquo;{trimmedQuery}&rdquo;
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
