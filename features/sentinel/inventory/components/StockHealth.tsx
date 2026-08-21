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
  "in-stock": "#22c55e", // Green
  low: "#f59e0b", // Amber
  out: "#f43f5e", // Rose
};

const SLICE_ORDER: StockHealthSlice["level"][] = [
  "in-stock",
  "low",
  "out",
];

// ─── Component ──────────────────────────────────────────────

export default function StockHealth({
  slices = [],
  loading = false,
}: {
  slices?: StockHealthSlice[];
  loading?: boolean;
}) {
  const [hoveredLevel, setHoveredLevel] = useState<
    StockHealthSlice["level"] | null
  >(null);

  const [mounted, setMounted] = useState(false);

  // ─── Totals ───────────────────────────────────────────────

  const total = slices.reduce((sum, slice) => sum + slice.count, 0);

  const hasData = slices.length > 0 && total > 0;

  // ─── Critical Stock ──────────────────────────────────────

  const outOfStockCount =
    slices.find((slice) => slice.level === "out")?.count ?? 0;

  const lowStockCount =
    slices.find((slice) => slice.level === "low")?.count ?? 0;

  const criticalLevel =
    outOfStockCount > 0
      ? "out"
      : lowStockCount > 0
        ? "low"
        : null;

  const criticalCount =
    criticalLevel === "out"
      ? outOfStockCount
      : criticalLevel === "low"
        ? lowStockCount
        : 0;

  // ─── Health Score ─────────────────────────────────────────

  const healthScore =
    total > 0
      ? Math.round(((total - outOfStockCount) / total) * 100)
      : 0;

  const healthStatus =
    healthScore >= 80
      ? "Healthy"
      : healthScore >= 50
        ? "Warning"
        : "Critical";

  // ─── Animation ───────────────────────────────────────────

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
          <CardTitle className="text-sm font-medium">
            Stock Health
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
            <div className="w-40 shrink-0 sm:w-44">
              <div className="aspect-square w-full animate-pulse rounded-full bg-muted" />
            </div>

            <div className="w-full flex-1 space-y-3 self-center sm:self-start">
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
          <CardTitle className="text-sm font-medium">
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

  // ─── Normalize Data ───────────────────────────────────────

  const visibleSlices = SLICE_ORDER
    .map((level) =>
      slices.find(
        (slice) =>
          slice.level === level && slice.count > 0,
      ),
    )
    .filter(
      (slice): slice is StockHealthSlice =>
        slice !== undefined,
    );

  // ─── Donut Configuration ─────────────────────────────────

  const radius = 36;
  const strokeWidth = 10;
  const center = 48;

  const circumference = 2 * Math.PI * radius;

  // ─── Render ───────────────────────────────────────────────

  return (
    <Card className="border-border/70 shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="pb-1">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm font-medium text-foreground">
            Stock Health
          </CardTitle>

          {/* Health Badge */}
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-medium",
              healthScore >= 80 &&
                "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
              healthScore >= 50 &&
                healthScore < 80 &&
                "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
              healthScore < 50 &&
                "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
            )}
          >
            {healthScore}% {healthStatus}
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">

          {/* ─────────────────────────────────────────────── */}
          {/* DONUT */}
          {/* ─────────────────────────────────────────────── */}

          <div className="relative w-40 shrink-0 sm:w-44">
            <svg
              viewBox="0 0 96 96"
              className="h-full w-full -rotate-90"
              role="img"
              aria-label={`Stock health distribution: ${total} products`}
            >
              <title>
                Stock health distribution: {total} products
              </title>

              {/* Background Ring */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                className="stroke-muted"
                strokeWidth={strokeWidth}
              />

              {/* ───────────────────────────────────────── */}
              {/* ACTUAL DONUT SEGMENTS */}
              {/* ───────────────────────────────────────── */}

              {(() => {
                let cumulativePercent = 0;

                return visibleSlices.map((slice) => {
                  const isHovered =
                    hoveredLevel === slice.level;

                  const isDimmed =
                    hoveredLevel !== null &&
                    hoveredLevel !== slice.level;

                  const segmentLength =
                    (slice.percent / 100) *
                    circumference;

                  /*
                   * IMPORTANT:
                   *
                   * Each segment starts where the previous
                   * segment ended.
                   */
                  const segmentOffset =
                    -(cumulativePercent / 100) *
                    circumference;

                  const animatedOffset = mounted
                    ? segmentOffset
                    : circumference;

                  const gap = Math.max(
                    circumference - segmentLength,
                    0,
                  );

                  // Move cumulative position forward.
                  cumulativePercent += slice.percent;

                  return (
                    <circle
                      key={slice.level}
                      cx={center}
                      cy={center}
                      r={radius}
                      fill="none"
                      stroke={SLICE_COLORS[slice.level]}
                      strokeWidth={
                        isHovered
                          ? strokeWidth + 3
                          : strokeWidth
                      }
                      strokeLinecap="butt"
                      strokeDasharray={`${segmentLength} ${gap}`}
                      strokeDashoffset={animatedOffset}
                      className="cursor-pointer transition-all duration-500 ease-out"
                      style={{
                        opacity: isDimmed ? 0.25 : 1,
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
                      aria-label={`${SLICE_LABELS[slice.level]}: ${slice.percent}% (${slice.count} products)`}
                    />
                  );
                });
              })()}

              {/* ───────────────────────────────────────── */}
              {/* PERCENTAGE LABELS */}
              {/* ───────────────────────────────────────── */}

              {mounted &&
                (() => {
                  let cumulativePercent = 0;

                  return visibleSlices.map((slice) => {
                    const startPercent =
                      cumulativePercent;

                    const middlePercent =
                      startPercent +
                      slice.percent / 2;

                    cumulativePercent += slice.percent;

                    // Don't place labels on tiny slices.
                    if (slice.percent < 10) {
                      return null;
                    }

                    const angle =
                      (middlePercent / 100) *
                      Math.PI *
                      2;

                    const labelRadius = radius * 0.68;

                    const x =
                      center +
                      labelRadius *
                        Math.sin(angle);

                    const y =
                      center -
                      labelRadius *
                        Math.cos(angle);

                    const isDimmed =
                      hoveredLevel !== null &&
                      hoveredLevel !== slice.level;

                    return (
                      <text
                        key={`label-${slice.level}`}
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="white"
                        fontSize="9"
                        fontWeight="700"
                        className="pointer-events-none"
                        style={{
                          opacity: isDimmed ? 0.3 : 1,
                        }}
                      >
                        {slice.percent}%
                      </text>
                    );
                  });
                })()}

              {/* Donut Hole */}
              <circle
                cx={center}
                cy={center}
                r={radius - strokeWidth / 2}
                className="fill-background"
              />
            </svg>

            {/* ─────────────────────────────────────────── */}
            {/* CENTER CONTENT */}
            {/* ─────────────────────────────────────────── */}

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
                      ? "text-rose-500"
                      : "text-amber-500",
                  )}
                >
                  {criticalCount} critical
                </span>
              )}
            </div>
          </div>

          {/* ─────────────────────────────────────────────── */}
          {/* LEGEND */}
          {/* ─────────────────────────────────────────────── */}

          <ul className="w-full flex-1 self-center space-y-2 sm:self-start">
            {visibleSlices.map((slice) => {
              const isHovered =
                hoveredLevel === slice.level;

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
                    !hoveredLevel &&
                      "hover:bg-muted/30",
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
                    {/* Color Indicator */}
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
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