import type { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api";
import { requireStaff } from "@/lib/auth";
import { buildSalesDashboard } from "@/lib/server/sales-dashboard";
import { DASHBOARD_RANGES, type DashboardRange } from "@/types/sentinel/sales-dashboard";

export async function GET(request: NextRequest) {
  try {
    const user = await requireStaff();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { searchParams } = new URL(request.url);
    const rangeParam = searchParams.get("range") ?? "30d";
    const range: DashboardRange = (DASHBOARD_RANGES as readonly string[]).includes(rangeParam)
      ? (rangeParam as DashboardRange)
      : "30d";

    const startParam = searchParams.get("start");
    const endParam = searchParams.get("end");
    const start = startParam ? Number(startParam) : undefined;
    const end = endParam ? Number(endParam) : undefined;

    if (range === "custom" && (!Number.isFinite(start) || !Number.isFinite(end))) {
      return apiError("Custom range requires valid start and end timestamps", [], 400);
    }

    const dashboard = await buildSalesDashboard({ range, start, end });

    return apiSuccess(dashboard, "Sales dashboard loaded");
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to load sales dashboard",
      [],
      500,
    );
  }
}
