"use client";

import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { FilterOption } from "@/types/shop";

export interface FilterOptionListProps {
  /** Accessible group label (visually hidden). */
  label: string;
  options: FilterOption[];
  /** Selected values. Single-select modes read index 0. */
  value: string[];
  onChange: (next: string[]) => void;
  /** `multiple` = checkbox semantics, `single` = radio semantics. */
  selectionMode?: "multiple" | "single";
  /** Renders a search box above the list once there are enough options. */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Minimum option count before the search box appears. */
  searchThreshold?: number;
  /** Max list height in px before it scrolls. */
  maxHeight?: number;
  emptyMessage?: string;
  className?: string;
}

/**
 * One list primitive for every option-style filter: categories, brands,
 * availability, offers — multi or single select, optionally searchable.
 *
 * Rows are real `<input type="checkbox|radio">` elements inside a
 * `role="group"`, so keyboard navigation, screen readers and form semantics
 * come from the platform instead of hand-rolled ARIA.
 */
export function FilterOptionList({
  label,
  options,
  value,
  onChange,
  selectionMode = "multiple",
  searchable = false,
  searchPlaceholder = "Search…",
  searchThreshold = 8,
  maxHeight = 260,
  emptyMessage = "No matches",
  className,
}: FilterOptionListProps) {
  const [query, setQuery] = useState("");
  const showSearch = searchable && options.length >= searchThreshold;

  const visibleOptions = useMemo(() => {
    if (!showSearch || !query.trim()) return options;
    const q = query.trim().toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(q));
  }, [options, query, showSearch]);

  const selected = useMemo(() => new Set(value), [value]);

  const handleSelect = (optionValue: string) => {
    if (selectionMode === "single") {
      onChange(selected.has(optionValue) ? [] : [optionValue]);
      return;
    }
    onChange(
      selected.has(optionValue)
        ? value.filter((entry) => entry !== optionValue)
        : [...value, optionValue],
    );
  };

  const list = (
    <ul className="space-y-0.5" role="none">
      {visibleOptions.map((option) => {
        const isSelected = selected.has(option.value);
        return (
          <li key={option.value}>
            <label
              className={cn(
                "group flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-colors duration-200 hover:bg-muted/70 motion-reduce:transition-none",
                isSelected && "bg-muted/60 font-medium",
                option.disabled && "pointer-events-none opacity-50",
              )}
            >
              <input
                type={selectionMode === "single" ? "radio" : "checkbox"}
                name={selectionMode === "single" ? label : undefined}
                className="peer sr-only"
                checked={isSelected}
                disabled={option.disabled}
                onChange={() => handleSelect(option.value)}
              />
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center border border-input transition-colors duration-200 peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50",
                  selectionMode === "single" ? "rounded-full" : "rounded-[5px]",
                  isSelected && "border-primary bg-primary text-primary-foreground",
                )}
              >
                {isSelected && <Check className="size-3" strokeWidth={3} />}
              </span>
              <span className="min-w-0 flex-1 truncate">{option.label}</span>
              {typeof option.count === "number" && (
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {option.count}
                </span>
              )}
            </label>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className={cn("space-y-2", className)} role="group" aria-label={label}>
      {showSearch && (
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={`Search ${label}`}
            className="h-8 rounded-xl pl-8 text-sm"
          />
        </div>
      )}

      {visibleOptions.length === 0 ? (
        <p className="px-2.5 py-6 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : visibleOptions.length > 8 ? (
        // Only mount the scroll container for long lists; short lists stay in
        // normal flow so the accordion animation height stays honest.
        <ScrollArea style={{ maxHeight }} className="-mx-1 px-1">
          {list}
        </ScrollArea>
      ) : (
        list
      )}
    </div>
  );
}
