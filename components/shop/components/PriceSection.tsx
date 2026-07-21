"use client";

import { useEffect, useState } from "react";

import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const MIN_PRICE = 0;
const MAX_PRICE = 100000;
const STEP = 100;
const MIN_DISTANCE = 100;

const PRICE_PRESETS = [
  {
    label: "Under KSh 5K",
    min: 0,
    max: 5000,
  },
  {
    label: "KSh 5K–10K",
    min: 5000,
    max: 10000,
  },
  {
    label: "KSh 10K–20K",
    min: 10000,
    max: 20000,
  },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);

interface PriceSectionProps {
  minPrice: number;
  maxPrice: number;
  onPriceChange?: (min: number, max: number) => void;
}

export default function PriceSection({
  minPrice,
  maxPrice,
  onPriceChange,
}: PriceSectionProps) {
  const [range, setRange] = useState<[number, number]>([minPrice, maxPrice]);

  useEffect(() => {
    setRange([minPrice, maxPrice]);
  }, [minPrice, maxPrice]);

  const [min, max] = range;
  type SliderValue = number | readonly number[];

  const isRange = (value: SliderValue): value is readonly [number, number] => {
    return Array.isArray(value) && value.length === 2;
  };
  const updateRange = (newMin: number, newMax: number) => {
    const nextMin = Math.max(
      MIN_PRICE,
      Math.min(newMin, newMax - MIN_DISTANCE),
    );

    const nextMax = Math.min(
      MAX_PRICE,
      Math.max(newMax, nextMin + MIN_DISTANCE),
    );

    setRange([nextMin, nextMax]);
  };

  const applyRange = (newMin: number, newMax: number) => {
    updateRange(newMin, newMax);
    onPriceChange?.(newMin, newMax);
  };

  return (
    <div className="space-y-5">
      {/* Slider */}
      <Slider
        min={MIN_PRICE}
        max={MAX_PRICE}
        step={STEP}
        value={range}
        onValueChange={(value) => {
          if (!isRange(value)) return;
          updateRange(value[0], value[1]);
        }}
        onValueCommitted={(value) => {
          if (!isRange(value)) return;
          onPriceChange?.(value[0], value[1]);
        }}
      />

      {/* Quick Price Presets */}
      <div className="flex flex-wrap gap-2">
        {PRICE_PRESETS.map((preset) => {
          const active = min === preset.min && max === preset.max;

          return (
            <Button
              key={preset.label}
              size="sm"
              variant={active ? "default" : "outline"}
              className="rounded-full text-xs"
              onClick={() => applyRange(preset.min, preset.max)}
            >
              {preset.label}
            </Button>
          );
        })}
      </div>

      {/* Inputs */}
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Min Price
          </label>

          <Input
            type="number"
            value={min}
            min={MIN_PRICE}
            max={max - MIN_DISTANCE}
            step={STEP}
            className="text-right"
            onChange={(e) => updateRange(Number(e.target.value), max)}
            onBlur={() => onPriceChange?.(min, max)}
          />
        </div>

        <span className="pb-2 text-muted-foreground">—</span>

        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Max Price
          </label>

          <Input
            type="number"
            value={max}
            min={min + MIN_DISTANCE}
            max={MAX_PRICE}
            step={STEP}
            className="text-right"
            onChange={(e) => updateRange(min, Number(e.target.value))}
            onBlur={() => onPriceChange?.(min, max)}
          />
        </div>
      </div>

      {/* Selected Range */}
      <div className="rounded-lg border bg-muted/30 px-3 py-2">
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>{formatCurrency(min)}</span>
          <span>{formatCurrency(max)}</span>
        </div>
      </div>

      {/* Reset */}
      {(min !== MIN_PRICE || max !== MAX_PRICE) && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => applyRange(MIN_PRICE, MAX_PRICE)}
        >
          Reset Price Range
        </Button>
      )}
    </div>
  );
}
