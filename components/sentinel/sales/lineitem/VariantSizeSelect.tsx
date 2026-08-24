"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductVariant } from "@/types/product";

interface VariantSizeSelectProps {
  variants: ProductVariant[];
  value?: string | undefined;
  onSelect: (variantSku: string) => void;
}

/** Per-variant size picker shown under a line item once a variant-enabled
 *  product is selected. Surfaces live stock per size right in the option
 *  list so staff can see (e.g.) "M — 2 left" without leaving the row. */
export function VariantSizeSelect({
  variants,
  value,
  onSelect,
}: VariantSizeSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue) onSelect(nextValue);
      }}
    >
      <SelectTrigger
        size="sm"
        className="h-8 w-full border-0 bg-muted/50 text-sm shadow-none focus:ring-1 data-placeholder:text-muted-foreground"
      >
        <SelectValue placeholder="Select size…" />
      </SelectTrigger>

      <SelectContent>
        {variants.map((variant) => {
          const available = Math.max(0, variant.stock - variant.reserved);

          return (
            <SelectItem key={variant.sku} value={variant.sku}>
              <span className="flex w-full items-center justify-between gap-4">
                <span>{variant.size}</span>
                <span
                  className={
                    available > 0
                      ? "text-xs text-muted-foreground"
                      : "text-xs text-destructive"
                  }
                >
                  {available > 0 ? `${available} in stock` : "Out of stock"}
                </span>
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
