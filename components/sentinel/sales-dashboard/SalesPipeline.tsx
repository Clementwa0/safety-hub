import { ChevronRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatKES } from "@/lib/format";
import type { PipelineStage } from "@/types/sentinel/sales-dashboard";

export interface SalesPipelineProps {
  stages: PipelineStage[];
  loading?: boolean;
}

export default function SalesPipeline({ stages, loading = false }: SalesPipelineProps) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>B2B sales pipeline</CardTitle>
        <CardDescription>
          Quotation → accepted → sales order → invoice → payment → delivery → revenue. Value only
          moves right when the underlying event has actually happened — an accepted quotation is
          not revenue, and an issued invoice is not cash.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-0 overflow-x-auto pb-2 lg:flex-row lg:items-stretch lg:gap-0">
          {stages.map((stage, index) => (
            <div key={stage.key} className="flex flex-1 items-stretch lg:min-w-[150px]">
              <div className="flex-1 rounded-lg border border-border/70 bg-card p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {stage.label}
                </p>
                {loading ? (
                  <>
                    <div className="mt-2 h-6 w-12 animate-pulse rounded bg-muted" />
                    <div className="mt-1 h-4 w-20 animate-pulse rounded bg-muted" />
                  </>
                ) : (
                  <>
                    <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">
                      {stage.count}
                    </p>
                    <p className="truncate text-xs font-medium text-muted-foreground">
                      {formatKES(stage.value)}
                    </p>
                    {stage.conversionRate !== undefined ? (
                      <p className="mt-1 text-[11px] text-primary">
                        {stage.conversionRate}% of prior stage
                      </p>
                    ) : (
                      <p className="mt-1 text-[11px] text-transparent select-none">—</p>
                    )}
                  </>
                )}
              </div>

              {index < stages.length - 1 ? (
                <div className="flex w-6 shrink-0 items-center justify-center text-muted-foreground lg:w-8">
                  <ChevronRight className="h-4 w-4" />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
