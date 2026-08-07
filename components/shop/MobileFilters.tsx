"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import { ShopSidebar, type ShopSidebarProps } from "./ShopSidebar";

export interface MobileFiltersProps extends ShopSidebarProps {
  /** Number of results the current filters produce, shown on Apply. */
  resultCount: number;
  activeFilterCount: number;
}

/**
 * Thin mobile wrapper: a floating trigger plus a full-height bottom sheet
 * that renders the *same* `ShopSidebar`. No duplicated filtering logic —
 * filters apply live, and "Apply" simply dismisses the sheet.
 */
export function MobileFilters({
  resultCount,
  activeFilterCount,
  className,
  ...sidebarProps
}: MobileFiltersProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            size="lg"
            className={cn(
              "fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-full px-6 shadow-lg lg:hidden",
              className,
            )}
          />
        }
      >
        <SlidersHorizontal className="size-4" aria-hidden="true" />
        Filters
        {activeFilterCount > 0 && (
          <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-foreground px-1.5 text-[11px] font-semibold text-primary">
            {activeFilterCount}
          </span>
        )}
      </SheetTrigger>

      <SheetContent
        side="bottom"
        className="flex h-[92dvh] flex-col rounded-t-3xl p-0 sm:max-w-none"
      >
        <SheetHeader className="border-b border-border/70 px-4 py-4">
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Results update as you choose.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <ShopSidebar {...sidebarProps} />
        </div>

        <SheetFooter className="flex-row gap-2 border-t border-border/70 bg-card/80 px-4 py-3 backdrop-blur-sm">
          <Button
            variant="outline"
            className="flex-1"
            onClick={sidebarProps.clearFilters}
            disabled={!sidebarProps.hasActiveFilters}
          >
            Clear
          </Button>
          <Button className="flex-[2]" onClick={() => setOpen(false)}>
            Show {resultCount.toLocaleString()} result
            {resultCount === 1 ? "" : "s"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
