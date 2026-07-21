"use client";

import { FaMinus, FaPlus } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function QuantitySelector({ 
  value, 
  onChange, 
  min = 1, 
  max = 999,
  disabled = false,
  className,
  size = "md"
}: QuantitySelectorProps) {
  const increment = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const decrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const sizeClasses = {
    sm: "h-9 w-8 text-xs",
    md: "h-12 w-11 text-sm",
    lg: "h-14 w-12 text-base"
  };

  const containerSize = {
    sm: "h-9",
    md: "h-12",
    lg: "h-14"
  };

  return (
    <div className={cn(
      "inline-flex items-center rounded-xl border border-gray-200 bg-white",
      containerSize[size],
      disabled && "opacity-50 cursor-not-allowed",
      className
    )}>
      <button
        onClick={decrement}
        className={cn(
          "flex h-full items-center justify-center hover:bg-gray-50 rounded-l-xl transition disabled:opacity-50 disabled:cursor-not-allowed",
          sizeClasses[size]
        )}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
      >
        <FaMinus className={cn(
          "h-4 w-4",
          size === "sm" && "h-3 w-3"
        )} />
      </button>
      <span className={cn(
        "w-12 text-center font-semibold",
        size === "sm" && "w-8 text-sm",
        size === "lg" && "w-14 text-lg"
      )}>
        {value}
      </span>
      <button
        onClick={increment}
        className={cn(
          "flex h-full items-center justify-center hover:bg-gray-50 rounded-r-xl transition disabled:opacity-50 disabled:cursor-not-allowed",
          sizeClasses[size]
        )}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
      >
        <FaPlus className={cn(
          "h-4 w-4",
          size === "sm" && "h-3 w-3"
        )} />
      </button>
    </div>
  );
}