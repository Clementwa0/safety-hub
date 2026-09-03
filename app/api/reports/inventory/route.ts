import type { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { buildInventoryReport } from "@/modules/analytics/reports";
import { REPORT_RANGES, type ReportRange } from "@/types/sentinel/reports";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { searchParams } = new URL(request.url);
    const rangeParam = searchParams.get("range") ?? "30d";
    const range: ReportRange = (REPORT_RANGES as readonly string[]).includes(rangeParam)
      ? (rangeParam as ReportRange)
      : "30d";

    const startParam = searchParams.get("start");
    const endParam = searchParams.get("end");
    const start = startParam ? Number(startParam) : undefined;
    const end = endParam ? Number(endParam) : undefined;

    if (range === "custom" && (!Number.isFinite(start) || !Number.isFinite(end))) {
      return apiError("Custom range requires valid start and end timestamps", [], 400);
    }

    const report = await buildInventoryReport({ range, start, end });

    return apiSuccess(report, "Inventory report loaded");
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to load inventory report",
      [],
      500,
    );
  }
}
