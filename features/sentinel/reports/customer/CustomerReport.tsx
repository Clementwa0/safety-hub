"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Users, UserPlus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/EmptyState";
import StatsCard from "@/components/sentinel/shared/StatsCard";
import { formatDate } from "@/lib/format";
import { customerService } from "@/services/sentinel/customer.service";
import type { Customer } from "@/types/sentinel/customer";

const SAMPLE_PAGE_LIMIT = 50;
const MAX_SAMPLE_PAGES = 10; // bounds requests for very large customer lists

export default function CustomerReport() {
  const [total, setTotal] = useState(0);
  const [sample, setSample] = useState<Customer[]>([]);
  const [sampleTruncated, setSampleTruncated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const first = await customerService.list({ page: 1, limit: SAMPLE_PAGE_LIMIT, sort: "-createdAt" });
      const all = [...first.items];
      const pagesToFetch = Math.min(first.pagination.pages, MAX_SAMPLE_PAGES);

      for (let page = 2; page <= pagesToFetch; page += 1) {
        const next = await customerService.list({ page, limit: SAMPLE_PAGE_LIMIT, sort: "-createdAt" });
        all.push(...next.items);
      }

      setTotal(first.pagination.total);
      setSample(all);
      setSampleTruncated(first.pagination.pages > MAX_SAMPLE_PAGES);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load the customer report");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Captured once at mount so the memo's calculation is pure (no
  // Date.now() side-effect inside useMemo, per react-hooks/purity).
  const [reportCutoff] = useState<number>(() => Date.now() - 30 * 24 * 60 * 60 * 1000);

  const newInLast30Days = useMemo(
    () => sample.filter((c) => new Date(c.createdAt).getTime() >= reportCutoff).length,
    [sample, reportCutoff],
  );

  const recent = sample.slice(0, 10);

  if (error) {
    return <EmptyState title="Couldn't load the customer report" description={error} />;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatsCard title="Total customers" value={String(total)} icon={Users} loading={loading} />
        <StatsCard
          title="New (last 30 days)"
          value={String(newInLast30Days)}
          icon={UserPlus}
          loading={loading}
          hint={sampleTruncated ? `Based on the ${sample.length} most recent` : undefined}
        />
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardHeader className="pb-1.5">
          <CardTitle className="text-sm font-semibold">Recent customers</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="h-[220px] animate-pulse rounded bg-muted" />
          ) : recent.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">No customers yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead className="text-right">Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell className="text-muted-foreground">{customer.email || customer.phone || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{customer.company || "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatDate(new Date(customer.createdAt))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <EmptyState
        title="Revenue per customer isn't shown here"
        description="Orders carry a customer's name/email, but not a formal link to a Customer record, and this app's sales figures are deliberately only computed by the server (see the Sales report) rather than re-derived from raw order documents on the client. Lifetime value and top-spenders would need a proper customerId on orders plus a server-side aggregate — flagging as a gap rather than approximating it here."
        className="border-none bg-transparent p-0 text-left shadow-none [&>h3]:text-sm [&>p]:mt-1"
      />
    </div>
  );
}
