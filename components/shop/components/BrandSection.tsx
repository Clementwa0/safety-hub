"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandSectionProps {
  brands: string[];
  selectedBrands: string[];
  onToggleBrand: (brand: string) => void;
}

export default function BrandSection({ brands, selectedBrands, onToggleBrand }: BrandSectionProps) {
  if (!brands.length) {
    return <p className="px-1 text-sm text-muted-foreground">No brands available yet.</p>;
  }

  return (
    <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
      {brands.map((brand) => {
        const selected = selectedBrands.includes(brand);

        return (
          <button
            key={brand}
            type="button"
            onClick={() => onToggleBrand(brand)}
            aria-pressed={selected}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-all",
              "hover:bg-muted",
              selected && "bg-primary/10 text-primary"
            )}
          >
            <div
              className={cn(
                "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                selected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"
              )}
            >
              {selected && <Check className="h-3 w-3" />}
            </div>
            <span className="truncate">{brand}</span>
          </button>
        );
      })}
    </div>
  );
}
