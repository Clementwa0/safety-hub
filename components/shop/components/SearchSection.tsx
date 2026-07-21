"use client";

import { useEffect, useState } from "react";
import { FaMagnifyingGlass, FaXmark } from "react-icons/fa6";
import { useDebouncedCallback } from "use-debounce";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function SearchSection({
  searchQuery,
  onSearchChange,
  placeholder = "Search products...",
  autoFocus = false,
}: SearchSectionProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const debouncedSearch = useDebouncedCallback(
    (value: string) => {
      onSearchChange(value);
    },
    300
  );

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;

    setLocalSearch(value);
    debouncedSearch(value);
  };

  const handleClear = () => {
    debouncedSearch.cancel();

    setLocalSearch("");
    onSearchChange("");
  };

  return (
    <div className="relative">
      <FaMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

      <Input
        type="search"
        value={localSearch}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="pl-10 pr-10"
        aria-label="Search products"
        onChange={handleChange}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            handleClear();
          }
        }}
      />

      {localSearch && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full"
          aria-label="Clear search"
        >
          <FaXmark className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}