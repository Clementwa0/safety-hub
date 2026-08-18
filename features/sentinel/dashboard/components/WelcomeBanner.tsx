"use client";

import { CalendarDays } from "lucide-react";
import { format } from "date-fns";

import { buildWeekWindows } from "../computeDashboardData";

interface WelcomeBannerProps {
  name: string;
}

export default function WelcomeBanner({ name }: WelcomeBannerProps) {
  const { weekStart, weekEnd } = buildWeekWindows(new Date());

  const rangeLabel =
    weekStart.getMonth() === weekEnd.getMonth()
      ? `${format(weekStart, "MMM d")} - ${format(weekEnd, "d, yyyy")}`
      : `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;

  return (
    <div className="flex flex-col gap-4 border-b border-border/50 pb-6 sm:flex-row sm:items-center sm:justify-between sm:pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Welcome back, {name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here's what's happening with your store today.
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2 rounded-lg bg-muted/30 px-4 py-2 text-sm font-medium text-muted-foreground ring-1 ring-inset ring-border/50">
        <CalendarDays className="h-4 w-4" />
        {rangeLabel}
      </div>
    </div>
  );
}