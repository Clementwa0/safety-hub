"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToggleOption {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}

interface ToggleFiltersSectionProps {
  options: ToggleOption[];
}

/** Shared checkbox row used for the featured / new-arrival / on-sale /
 * availability toggles, so every "does this product match X" filter in
 * the sidebar looks and behaves the same. */
export default function ToggleFiltersSection({ options }: ToggleFiltersSectionProps) {
  return (
    <div className="space-y-1">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={option.onChange}
          aria-pressed={option.checked}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-all",
            "hover:bg-muted",
            option.checked && "bg-primary/10 text-primary"
          )}
        >
          <div
            className={cn(
              "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
              option.checked ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"
            )}
          >
            {option.checked && <Check className="h-3 w-3" />}
          </div>
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}
