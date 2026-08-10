"use client";

import { apiRequest } from "@/lib/http";
import type {
  DashboardRange,
  SalesDashboardResponse,
} from "@/types/sentinel/sales-dashboard";

export interface SalesDashboardQuery {
  range: DashboardRange;
  start?: number;
  end?: number;
}

export const salesDashboardService = {
  async get(query: SalesDashboardQuery): Promise<SalesDashboardResponse> {
    const params = new URLSearchParams({ range: query.range });
    if (query.range === "custom") {
      if (query.start) params.set("start", String(query.start));
      if (query.end) params.set("end", String(query.end));
    }
    return apiRequest<SalesDashboardResponse>(`/api/sales-dashboard?${params.toString()}`);
  },
};
