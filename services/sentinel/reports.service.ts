"use client";

import { apiRequest } from "@/lib/http";
import type {
  CustomerInsightsReport,
  InventoryReportResponse,
  ProductPerformanceReport,
  ReportQuery,
  SalesOverviewReport,
} from "@/types/sentinel/reports";

function buildParams(query: ReportQuery): URLSearchParams {
  const params = new URLSearchParams({ range: query.range });
  if (query.range === "custom") {
    if (query.start) params.set("start", String(query.start));
    if (query.end) params.set("end", String(query.end));
  }
  return params;
}

export const reportsService = {
  async salesOverview(query: ReportQuery): Promise<SalesOverviewReport> {
    return apiRequest<SalesOverviewReport>(`/api/reports/sales-overview?${buildParams(query).toString()}`);
  },
  async inventory(query: ReportQuery): Promise<InventoryReportResponse> {
    return apiRequest<InventoryReportResponse>(`/api/reports/inventory?${buildParams(query).toString()}`);
  },
  async productPerformance(query: ReportQuery): Promise<ProductPerformanceReport> {
    return apiRequest<ProductPerformanceReport>(`/api/reports/product-performance?${buildParams(query).toString()}`);
  },
  async customerInsights(query: ReportQuery): Promise<CustomerInsightsReport> {
    return apiRequest<CustomerInsightsReport>(`/api/reports/customer-insights?${buildParams(query).toString()}`);
  },
};
