import { Card, CardContent } from "@/components/ui/card";
import { type ReactNode } from "react";

interface AccountSummaryCardProps {
  icon: ReactNode;
  label: string;
  value: number;
  description: string;
}

export function AccountSummaryCard({ icon, label, value, description }: AccountSummaryCardProps) {
  return (
    <Card className="group h-full rounded-2xl border border-border bg-white p-0 shadow-[var(--shadow-soft)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]">
      <CardContent className="flex h-full flex-col gap-4 p-6">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-105">
          {icon}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-semibold tracking-tight text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
