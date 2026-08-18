"use client";

import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

interface ProductComboboxProps {
  itemId: string;
  productId?: string;
  products: Product[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (productId: string) => void;
}

export function ProductCombobox({
  itemId,
  productId,
  products,
  open,
  onOpenChange,
  onSelect,
}: ProductComboboxProps) {
  const selectedProduct = products.find(
    (product) => product.id === productId,
  );

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-8 w-full justify-between"
          />
        }
      >
        <span className="truncate">
          {selectedProduct?.name ?? "Search product…"}
        </span>

        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>

      <PopoverContent className="min-w-[280px] max-w-[90vw] p-0 sm:w-[300px]">
        <Command>
          <CommandInput placeholder="Search products…" />

          <CommandEmpty>
            No product found.
          </CommandEmpty>

          <CommandGroup>
            <CommandItem
              value="custom"
              onSelect={() => onSelect("custom")}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  !productId
                    ? "opacity-100"
                    : "opacity-0",
                )}
              />

              Custom item (manual entry)
            </CommandItem>

            {products.map((product) => (
              <CommandItem
                key={product.id}
                value={product.name}
                onSelect={() => onSelect(product.id)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    productId === product.id
                      ? "opacity-100"
                      : "opacity-0",
                  )}
                />

                {product.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}