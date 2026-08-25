'use client'

import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

import { cn } from '@/lib/utils'

import {
  ShopSidebar,
  type ShopSidebarProps,
} from './ShopSidebar'

export interface MobileFiltersProps extends ShopSidebarProps {
  resultCount: number
  activeFilterCount: number
}

export function MobileFilters({
  resultCount,
  activeFilterCount,
  className,
  ...sidebarProps
}: MobileFiltersProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* Mobile trigger */}
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

      {/* Mobile filter sheet */}
      <SheetContent
        side="bottom"
        className={cn(
          'flex h-[90dvh] max-h-[90dvh] flex-col',
          'rounded-t-2xl p-0',
          'sm:h-[85dvh] sm:max-h-[85dvh]',
          'sm:max-w-none'
        )}
      >
        {/* Header */}
        <SheetHeader
          className={cn(
            'shrink-0 border-b border-border/70',
            'px-5 py-4 text-left'
          )}
        >
          <SheetTitle className="text-base font-semibold">
            Filter Products
          </SheetTitle>

          <SheetDescription className="text-xs leading-relaxed text-muted-foreground">
            Refine the catalog to find the right safety equipment.
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable filters */}
        <div
          className={cn(
            'min-h-0 flex-1 overflow-y-auto',
            'overscroll-contain px-5 py-4',
            '[&::-webkit-scrollbar]:w-1',
            '[&::-webkit-scrollbar-thumb]:rounded-full',
            '[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20'
          )}
        >
          <ShopSidebar {...sidebarProps} />
        </div>

        {/* Footer */}
        <SheetFooter
          className={cn(
            'shrink-0 flex-row gap-2',
            'border-t border-border/70',
            'bg-background px-5 py-3',
            'pb-[calc(0.75rem+env(safe-area-inset-bottom))]'
          )}
        >
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1"
            onClick={sidebarProps.clearFilters}
            disabled={!sidebarProps.hasActiveFilters}
          >
            Clear
          </Button>

          <Button
            type="button"
            className="h-11 flex-[2]"
            onClick={() => setOpen(false)}
          >
            Show {resultCount.toLocaleString()}{' '}
            {resultCount === 1 ? 'result' : 'results'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}