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

import {
  ShopSidebar,
  type ShopSidebarProps,
} from "./ShopSidebar";

export interface MobileFiltersProps extends ShopSidebarProps {
  resultCount: number;
  activeFilterCount: number;
}

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
          >
            <SlidersHorizontal
              className="mr-2 h-4 w-4"
              aria-hidden="true"
            />

            Filters

            {activeFilterCount > 0 && (
              <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-white/20 px-1.5 py-0.5 text-xs font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>
        }
      />

      <SheetContent
        side="bottom"
        className="flex h-[92dvh] flex-col rounded-t-3xl p-0 sm:max-w-none"
      >
        <SheetHeader className="border-b border-border/70 px-4 py-4 text-left">
          <SheetTitle>Filter Products</SheetTitle>

          <SheetDescription className="text-xs text-muted-foreground">
            Refine the catalog to find the right safety equipment.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <ShopSidebar {...sidebarProps} />
        </div>

        <SheetFooter className="flex-row gap-2 border-t border-border/70 bg-card/80 px-4 py-3 backdrop-blur-sm">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={sidebarProps.clearFilters}
            disabled={!sidebarProps.hasActiveFilters}
          >
            Clear
          </Button>

          <Button
            type="button"
            className="flex-[2]"
            onClick={() => setOpen(false)}
          >
            Show {resultCount.toLocaleString()}{" "}
            {resultCount === 1 ? "result" : "results"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
