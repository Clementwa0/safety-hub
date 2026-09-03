"use client";

import { CalendarDays } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REPORT_RANGES, type ReportRange } from "@/types/sentinel/reports";

const RANGE_LABELS: Record<Exclude<ReportRange, "custom">, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  "12m": "Last 12 months",
};

export default function ReportRangePicker({
  value,
  onChange,
}: {
  value: ReportRange;
  onChange: (range: ReportRange) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as ReportRange)}>
      <SelectTrigger className="h-9 w-full gap-2 rounded-xl border-border/60 bg-background px-3 text-xs font-medium shadow-sm sm:w-[170px] sm:text-sm">
        <CalendarDays className="size-3.5 shrink-0 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {REPORT_RANGES.filter((r) => r !== "custom").map((r) => (
          <SelectItem key={r} value={r}>
            {RANGE_LABELS[r as Exclude<ReportRange, "custom">]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
