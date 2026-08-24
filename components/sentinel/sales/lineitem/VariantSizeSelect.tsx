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

export function VariantSizeSelect({
  variants,
  value,
  onSelect,
}: VariantSizeSelectProps) {
 
  const selectedValue = value ?? "";

  return (
    <Select
      value={selectedValue}
      onValueChange={(nextValue) => {
        if (!nextValue) {
          return;
        }

        const selectedVariant = variants.find(
          (variant) => variant.sku === nextValue,
        );
        if (!selectedVariant) {
          return;
        }

        const available = Math.max(
          0,
          selectedVariant.stock - selectedVariant.reserved,
        );

        if (available <= 0) {
          return;
        }

        onSelect(nextValue);
      }}
    >
      <SelectTrigger
        size="sm"
        className="h-8 w-full border-0 bg-muted/50 text-sm shadow-none focus:ring-1 data-placeholder:text-muted-foreground"
      >
        <SelectValue placeholder="Select size…" />
      </SelectTrigger>

      <SelectContent>
        {variants.length > 0 ? (
          variants.map((variant) => {
            const available = Math.max(
              0,
              variant.stock - variant.reserved,
            );

            const isOutOfStock = available <= 0;

            return (
              <SelectItem
                key={variant.sku}
                value={variant.sku}
                disabled={isOutOfStock}
              >
                <span className="flex w-full items-center justify-between gap-4">
                  <span>{variant.size}</span>

                  <span
                    className={
                      isOutOfStock
                        ? "text-xs text-destructive"
                        : "text-xs text-muted-foreground"
                    }
                  >
                    {isOutOfStock
                      ? "Out of stock"
                      : `${available} in stock`}
                  </span>
                </span>
              </SelectItem>
            );
          })
        ) : (
          <SelectItem value="__no_variants__" disabled>
            No sizes available
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}