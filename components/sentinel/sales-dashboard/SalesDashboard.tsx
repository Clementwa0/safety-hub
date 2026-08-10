"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Banknote, ClipboardCheck, TrendingUp, Wallet2 } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import KpiCard from "./KpiCard";
import SalesPipeline from "./SalesPipeline";
import RevenueTrendChart from "./RevenueTrendChart";
import { OrdersBySourceCard, OrdersByStatusChart } from "./OrdersBreakdownCharts";
import {
  OutstandingAgingChart,
  PaymentMethodsCard,
  TopProductsCard,
} from "./SecondaryBreakdownCards";
import { salesDashboardService } from "@/services/sentinel/sales-dashboard.service";
import type { DashboardRange, SalesDashboardResponse } from "@/types/sentinel/sales-dashboard";

export default function SalesDashboard() {
  const [range, setRange] = useState<DashboardRange>("30d");
  const [data, setData] = useState<SalesDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (nextRange: DashboardRange) => {
    setLoading(true);
    setError(null);
    try {
      const result = await salesDashboardService.get({ range: nextRange });
      setData(result);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load the sales dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void load(range);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [load, range]);

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Sales & Revenue"
          description="Pipeline, invoicing and cash collection across storefront and B2B sales."
          breadcrumbs={[
            { label: "Admin", href: "/sentinel/dashboard" },
            { label: "Sales & Revenue" },
          ]}
        />
        <EmptyState
          title="Something went wrong"
          description={error}
          action={
            <Button variant="outline" onClick={() => void load(range)}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  const kpis = data?.kpis;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales & Revenue"
        description="Pipeline, invoicing and cash collection across storefront and B2B sales. Figures reflect what has actually happened — not what has merely been quoted or invoiced."
        breadcrumbs={[
          { label: "Admin", href: "/sentinel/dashboard" },
          { label: "Sales & Revenue" },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          title="Confirmed sales"
          value={kpis?.confirmedSales.value ?? 0}
          count={kpis?.confirmedSales.count ?? 0}
          countLabel="orders"
          icon={ClipboardCheck}
          tone="default"
          loading={loading}
          explanation="The value of storefront and B2B orders the business has committed to fulfil (confirmed or further along) in this period. A sales figure, not a cash figure."
        />
        <KpiCard
          title="Invoiced"
          value={kpis?.invoiced.value ?? 0}
          count={kpis?.invoiced.count ?? 0}
          countLabel="invoices issued"
          icon={Banknote}
          tone="info"
          loading={loading}
          explanation="The value of invoices actually issued to customers in this period (excludes drafts and cancelled invoices). Issuing an invoice does not mean the cash has arrived."
        />
        <KpiCard
          title="Cash collected"
          value={kpis?.cashCollected.value ?? 0}
          count={kpis?.cashCollected.count ?? 0}
          countLabel="payments"
          icon={Wallet2}
          tone="success"
          loading={loading}
          explanation="Money that has actually been received: recorded invoice payments plus storefront orders marked paid. Uses actual amounts paid, not invoice status."
        />
        <KpiCard
          title="Outstanding"
          value={kpis?.outstanding.value ?? 0}
          count={kpis?.outstanding.count ?? 0}
          countLabel="unpaid balances"
          icon={AlertTriangle}
          tone="warning"
          loading={loading}
          explanation="What customers still owe: unpaid invoice balances plus storefront cash-on-delivery orders awaiting payment."
        />
        <KpiCard
          title="Revenue recognized"
          value={kpis?.revenueRecognized.value ?? 0}
          count={kpis?.revenueRecognized.count ?? 0}
          countLabel="fulfilled & paid"
          icon={TrendingUp}
          tone="success"
          loading={loading}
          explanation="Sales that are both delivered and fully paid — the most conservative figure on this page. An accepted quotation, a sent invoice, or even a paid-but-undelivered order is deliberately not counted here."
        />
      </div>

      <SalesPipeline stages={data?.pipeline ?? PLACEHOLDER_STAGES} loading={loading} />

      <RevenueTrendChart
        series={data?.series ?? []}
        range={range}
        onRangeChange={setRange}
        granularity={data?.granularity ?? "day"}
        loading={loading}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <OrdersBySourceCard data={data?.ordersBySource ?? []} loading={loading} />
        <OrdersByStatusChart data={data?.ordersByStatus ?? []} loading={loading} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <OutstandingAgingChart data={data?.outstandingAging ?? []} loading={loading} />
        <PaymentMethodsCard
          data={data?.paymentMethods ?? []}
          caveat={
            data?.paymentMethodsCaveat ??
            "B2B invoice payments don't yet record a payment method — this chart reflects storefront payments only."
          }
          loading={loading}
        />
        <TopProductsCard data={data?.topProducts ?? []} loading={loading} />
      </div>
    </div>
  );
}

const PLACEHOLDER_STAGES: SalesDashboardResponse["pipeline"] = [
  { key: "quotations", label: "Quotations", count: 0, value: 0 },
  { key: "accepted", label: "Accepted", count: 0, value: 0 },
  { key: "orders", label: "Sales Orders", count: 0, value: 0 },
  { key: "invoiced", label: "Invoiced", count: 0, value: 0 },
  { key: "paid", label: "Paid", count: 0, value: 0 },
  { key: "delivered", label: "Delivered", count: 0, value: 0 },
  { key: "revenueRecognized", label: "Revenue Recognized", count: 0, value: 0 },
];
