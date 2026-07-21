"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import ShopSidebar from "./ShopSidebar";
import type { FilterState } from "@/hooks/useShopFilters";

interface MobileShopSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  filters: FilterState;
  activeFilterCount: number;

  toggleArrayFilter: (
    key: "category" | "brand" | "colors" | "sizes" | "availability",
    value: string
  ) => void;

  clearArrayFilter: (
    key: "category" | "brand" | "colors" | "sizes" | "availability"
  ) => void;

  updateFilter: <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => void;

  clearFilters: () => void;

  onPriceChange: (min: number, max: number) => void;
}

export default function MobileShopSidebar({
  open,
  onOpenChange,
  ...sidebarProps
}: MobileShopSidebarProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-full max-w-[340px] p-0 sm:max-w-sm"
      >
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle>Filter Products</SheetTitle>
        </SheetHeader>

        <div className="h-[calc(100vh-70px)] overflow-y-auto">
          <ShopSidebar {...sidebarProps} />
        </div>
      </SheetContent>
    </Sheet>
  );
}