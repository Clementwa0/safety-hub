"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  PRICE_BOUNDS,
  PRICE_PRESETS,
  clampPrice,
  formatCurrency,
  formatPriceRange,
} from "@/lib/shopFilters";
import { cn } from "@/lib/utils";
import type { PriceRange } from "@/types/shop";

export interface PriceFilterProps {
  value: PriceRange;
  onChange: (range: PriceRange) => void;
  /** Slider granularity. */
  step?: number;
  className?: string;
}

function normalise(range: PriceRange): PriceRange {
  const min = clampPrice(range.min);
  const max = clampPrice(range.max);
  return min <= max ? { min, max } : { min: max, max: min };
}

/**
 * Dual range slider + numeric inputs + quick presets.
 * Committed on slider release / input blur so we never spam the URL or the
 * filtering pipeline while the user is still dragging or typing.
 */
export function PriceFilter({ value, onChange, step = 100, className }: PriceFilterProps) {
  const [draft, setDraft] = useState<PriceRange>(value);
  const [syncedValue, setSyncedValue] = useState<PriceRange>(value);

  // Adjust the local draft during render (React's recommended alternative to
  // a syncing effect) when the range changes elsewhere: preset, chip removal,
  // "Clear all", or back/forward navigation.
  if (syncedValue.min !== value.min || syncedValue.max !== value.max) {
    setSyncedValue(value);
    setDraft(value);
  }

  const commit = (range: PriceRange) => {
    const next = normalise(range);
    setDraft(next);
    onChange(next);
  };

  const handleInput = (key: keyof PriceRange, raw: string) => {
    const parsed = Number(raw.replace(/[^\d]/g, ""));
    setDraft((prev) => ({ ...prev, [key]: Number.isFinite(parsed) ? parsed : 0 }));
  };

  return (
    <div className={cn("space-y-4", className)}>
      <p className="text-sm font-medium" aria-live="polite">
        {formatPriceRange(draft)}
      </p>

      <Slider
        value={[draft.min, draft.max]}
        min={PRICE_BOUNDS.min}
        max={PRICE_BOUNDS.max}
        step={step}
        aria-label="Price range"
        onValueChange={(next) => {
          const [min, max] = next as number[];
          setDraft({ min, max });
        }}
        onValueCommitted={(next) => {
          const [min, max] = next as number[];
          commit({ min, max });
        }}
      />

      <div className="flex items-center gap-2">
        <label className="flex-1 space-y-1">
          <span className="text-xs text-muted-foreground">Min</span>
          <Input
            inputMode="numeric"
            className="h-9 rounded-xl"
            value={draft.min === 0 ? "" : String(draft.min)}
            placeholder={formatCurrency(PRICE_BOUNDS.min)}
            aria-label="Minimum price"
            onChange={(event) => handleInput("min", event.target.value)}
            onBlur={() => commit(draft)}
            onKeyDown={(event) => {
              if (event.key === "Enter") commit(draft);
            }}
          />
        </label>
        <span aria-hidden="true" className="mt-5 text-muted-foreground">
          –
        </span>
        <label className="flex-1 space-y-1">
          <span className="text-xs text-muted-foreground">Max</span>
          <Input
            inputMode="numeric"
            className="h-9 rounded-xl"
            value={draft.max >= PRICE_BOUNDS.max ? "" : String(draft.max)}
            placeholder={formatCurrency(PRICE_BOUNDS.max)}
            aria-label="Maximum price"
            onChange={(event) => handleInput("max", event.target.value)}
            onBlur={() => commit(draft)}
            onKeyDown={(event) => {
              if (event.key === "Enter") commit(draft);
            }}
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {PRICE_PRESETS.map((preset) => {
          const active =
            value.min === preset.range.min && value.max === preset.range.max;
          return (
            <button
              key={preset.label}
              type="button"
              aria-pressed={active}
              onClick={() => commit(preset.range)}
              className={cn(
                "rounded-full border border-border/70 px-3 py-1 text-xs font-medium transition-colors duration-200 hover:border-foreground/30 hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none",
                active && "border-primary bg-primary text-primary-foreground hover:bg-primary",
              )}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
