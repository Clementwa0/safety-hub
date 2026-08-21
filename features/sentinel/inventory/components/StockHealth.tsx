"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { StockHealthSlice } from "../summary";

// ─── Constants ──────────────────────────────────────────────

const SLICE_LABELS: Record<StockHealthSlice["level"], string> = {
  "in-stock": "In stock",
  low: "Low stock",
  out: "Out of stock",
};

const SLICE_COLORS: Record<StockHealthSlice["level"], string> = {
  "in-stock": "#22c55e",
  low: "#f59e0b",
  out: "#f43f5e",
};

const SLICE_ORDER: StockHealthSlice["level"][] = [
  "in-stock",
  "low",
  "out",
];

// ─── Main Component ─────────────────────────────────────────

export default function StockHealth({
  slices,
  loading = false,
}: {
  slices: StockHealthSlice[];
  loading?: boolean;
}) {
  const [hoveredLevel, setHoveredLevel] = useState<
    StockHealthSlice["level"] | null
  >(null);

  const [mounted, setMounted] = useState(false);

  // Always calculate the total from the actual counts.
  const total = slices.reduce((sum, slice) => sum + slice.count, 0);

  const hasData = slices.length > 0 && total > 0;

  // Most critical category.
  const outOfStock = slices.find((slice) => slice.level === "out");
  const lowStock = slices.find((slice) => slice.level === "low");

  const criticalLevel =
    (outOfStock?.count ?? 0) > 0
      ? "out"
      : (lowStock?.count ?? 0) > 0
        ? "low"
        : null;

  // Animate donut after data becomes available.
  useEffect(() => {
    if (!hasData) {
      setMounted(false);
      return;
    }

    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [hasData]);

  // ─── Loading State ────────────────────────────────────────

  if (loading) {
    return (
      <Card className="border-border/70 shadow-sm">
        <CardHeader className="pb-1">
          <CardTitle className="text-sm font-medium text-foreground">
            Stock Health
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
            {/* Donut skeleton */}
            <div className="w-40 shrink-0 sm:w-44">
              <div className="aspect-square w-full animate-pulse rounded-full bg-muted" />
            </div>

            {/* Legend skeleton */}
            <div className="flex-1 space-y-3 self-center sm:self-start">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-muted" />
                    <span className="h-4 w-20 animate-pulse rounded bg-muted" />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="h-4 w-8 animate-pulse rounded bg-muted" />
                    <span className="h-4 w-10 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ─── Empty State ──────────────────────────────────────────

  if (!hasData) {
    return (
      <Card className="border-border/70 shadow-sm">
        <CardHeader className="pb-1">
          <CardTitle className="text-sm font-medium text-foreground">
            Stock Health
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="py-8 text-center">
            <p className="text-sm font-medium text-foreground">
              No stock data available
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Add products with inventory to see stock health.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ─── Normalize Slice Order ────────────────────────────────

  const orderedSlices = SLICE_ORDER
    .map((level) => slices.find((slice) => slice.level === level))
    .filter((slice): slice is StockHealthSlice => slice !== undefined);

  // ─── Donut Configuration ─────────────────────────────────

  const radius = 36;
  const strokeWidth = 10;
  const center = 48;
  const circumference = 2 * Math.PI * radius;

  /*
   * We use one SVG circle per segment.
   *
   * Each segment has:
   *
   *   dash length = its percentage of the circumference
   *   dash gap    = the remaining circumference
   *
   * The dash offset is cumulative so each segment starts
   * where the previous segment ended.
   */
  let cumulativePercent = 0;

  return (
    <Card className="border-border/70 shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-medium text-foreground">
          Stock Health
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
          {/* ─── Donut ─────────────────────────────────────── */}

          <div className="relative w-40 shrink-0 sm:w-44">
            <svg
              viewBox="0 0 96 96"
              className="h-full w-full -rotate-90 transform"
              role="img"
              aria-label={`Stock health distribution: ${total} products`}
            >
              <title>
                Stock health distribution: {total} products
              </title>

              {/* Background ring */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                className="stroke-muted"
                strokeWidth={strokeWidth}
              />

              {orderedSlices.map((slice) => {
                const isHovered = hoveredLevel === slice.level;

                const isDimmed =
                  hoveredLevel !== null &&
                  hoveredLevel !== slice.level;

                const segmentLength =
                  (slice.percent / 100) * circumference;

                const dashOffset =
                  circumference -
                  (cumulativePercent / 100) * circumference;

                const currentOffset = mounted
                  ? dashOffset
                  : circumference;

                const opacity = isDimmed ? 0.3 : 1;

                // Save the current position before moving to the
                // next segment.
                cumulativePercent += slice.percent;

                return (
                  <circle
                    key={slice.level}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={SLICE_COLORS[slice.level]}
                    strokeWidth={isHovered ? strokeWidth + 2 : strokeWidth}
                    strokeLinecap="butt"
                    strokeDasharray={`${segmentLength} ${circumference}`}
                    strokeDashoffset={currentOffset}
                    className="cursor-pointer transition-all duration-700 ease-out"
                    style={{
                      opacity,
                    }}
                    onMouseEnter={() =>
                      setHoveredLevel(slice.level)
                    }
                    onMouseLeave={() =>
                      setHoveredLevel(null)
                    }
                    onFocus={() =>
                      setHoveredLevel(slice.level)
                    }
                    onBlur={() =>
                      setHoveredLevel(null)
                    }
                    tabIndex={0}
                    role="img"
                    aria-label={`${SLICE_LABELS[slice.level]}: ${slice.percent}% (${slice.count})`}
                  />
                );
              })}

              {/* Donut hole */}
              <circle
                cx={center}
                cy={center}
                r={radius - strokeWidth / 2}
                className="fill-background"
              />
            </svg>

            {/* ─── Center Information ──────────────────────── */}

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold leading-none tabular-nums text-foreground">
                {total}
              </span>

              <span className="mt-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Products
              </span>

              {criticalLevel && (
                <span
                  className={cn(
                    "mt-1 text-[10px] font-medium",
                    criticalLevel === "out"
                      ? "text-destructive"
                      : "text-amber-600",
                  )}
                >
                  {slices.find(
                    (slice) => slice.level === criticalLevel,
                  )?.count ?? 0}{" "}
                  critical
                </span>
              )}
            </div>
          </div>

          {/* ─── Legend ────────────────────────────────────── */}

          <ul className="w-full flex-1 self-center space-y-2 sm:self-start">
            {orderedSlices.map((slice) => {
              const isHovered = hoveredLevel === slice.level;

              const isDimmed =
                hoveredLevel !== null &&
                hoveredLevel !== slice.level;

              return (
                <li
                  key={slice.level}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 transition-all",
                    isHovered && "bg-muted/50",
                    isDimmed && "opacity-40",
                    !hoveredLevel && "hover:bg-muted/30",
                  )}
                  onMouseEnter={() =>
                    setHoveredLevel(slice.level)
                  }
                  onMouseLeave={() =>
                    setHoveredLevel(null)
                  }
                  onFocus={() =>
                    setHoveredLevel(slice.level)
                  }
                  onBlur={() =>
                    setHoveredLevel(null)
                  }
                  tabIndex={0}
                  role="button"
                  aria-label={`View ${SLICE_LABELS[slice.level]}`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="block h-3 w-3 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          SLICE_COLORS[slice.level],
                      }}
                    />

                    <span className="text-sm font-medium text-foreground">
                      {SLICE_LABELS[slice.level]}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold tabular-nums text-foreground">
                      {slice.percent}%
                    </span>

                    <span className="text-muted-foreground">
                      ({slice.count})
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}