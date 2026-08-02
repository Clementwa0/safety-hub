"use client";

import { FaStar } from "react-icons/fa6";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  totalReviews?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  className?: string;
}

export function RatingStars({ 
  rating, 
  totalReviews, 
  size = "md",
  showCount = true,
  className 
}: RatingStarsProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={cn(
              sizeClasses[size],
              i < fullStars
                ? "fill-yellow-400 text-yellow-400"
                : i === fullStars && hasHalfStar
                ? "fill-yellow-400 text-yellow-400 opacity-50"
                : "text-gray-300"
            )}
          />
        ))}
      </div>
      {showCount && totalReviews !== undefined && (
        <span className={cn(
          "text-muted-foreground",
          size === "sm" && "text-xs",
          size === "md" && "text-sm",
          size === "lg" && "text-base"
        )}>
          ({totalReviews})
        </span>
      )}
    </div>
  );
}