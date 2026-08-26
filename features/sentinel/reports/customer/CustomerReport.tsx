"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Users, UserPlus, Mail, Building2, CalendarDays } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import StatsCard from "@/components/sentinel/shared/StatsCard";
import { formatDate } from "@/lib/format";
import { customerService } from "@/services/sentinel/customer.service";
import type { Customer } from "@/types/sentinel/customer";

const SAMPLE_PAGE_LIMIT = 50;
const MAX_SAMPLE_PAGES = 10;

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
      const first = await customerService.list({
        page: 1,
        limit: SAMPLE_PAGE_LIMIT,
        sort: "-createdAt",
      });

      const all = [...first.items];
      const pagesToFetch = Math.min(
        first.pagination.pages,
        MAX_SAMPLE_PAGES,
      );

      for (let page = 2; page <= pagesToFetch; page += 1) {
        const next = await customerService.list({
          page,
          limit: SAMPLE_PAGE_LIMIT,
          sort: "-createdAt",
        });

        all.push(...next.items);
      }

      setTotal(first.pagination.total);
      setSample(all);
      setSampleTruncated(first.pagination.pages > MAX_SAMPLE_PAGES);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not load the customer report",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const [reportCutoff] = useState<number>(
    () => Date.now() - 30 * 24 * 60 * 60 * 1000,
  );

  const newInLast30Days = useMemo(
    () =>
      sample.filter(
        (customer) =>
          new Date(customer.createdAt).getTime() >= reportCutoff,
      ).length,
    [sample, reportCutoff],
  );

  const recent = sample.slice(0, 10);

  if (error) {
    return (
      <EmptyState
        title="Couldn't load the customer report"
        description={error}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Overview */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Customer overview
          </h2>
          <p className="text-xs text-muted-foreground">
            Customer growth and your most recently registered customers.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
          <StatsCard
            title="Total customers"
            value={String(total)}
            icon={Users}
            loading={loading}
          />

          <StatsCard
            title="New customers"
            value={String(newInLast30Days)}
            icon={UserPlus}
            loading={loading}
            hint="Registered in the last 30 days"
          />
        </div>
      </section>

      {/* Recent customers */}
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardHeader className="border-b border-border/60 bg-muted/20 px-4 py-3 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-semibold">
                Recent customers
              </CardTitle>

              <p className="mt-0.5 text-xs text-muted-foreground">
                Latest customer registrations
              </p>
            </div>

            {!loading && recent.length > 0 && (
              <Badge variant="secondary" className="shrink-0">
                {recent.length} recent
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-4 sm:p-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-12 animate-pulse rounded-lg bg-muted"
                />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="px-4 py-12">
              <EmptyState
                title="No customers yet"
                description="Customers will appear here once they register."
                className="border-none bg-transparent p-0 shadow-none"
              />
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/20 hover:bg-muted/20">
                      <TableHead className="h-10 px-5 text-xs font-medium">
                        Customer
                      </TableHead>

                      <TableHead className="h-10 text-xs font-medium">
                        Contact
                      </TableHead>

                      <TableHead className="h-10 text-xs font-medium">
                        Company
                      </TableHead>

                      <TableHead className="h-10 pr-5 text-right text-xs font-medium">
                        Joined
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {recent.map((customer) => (
                      <TableRow
                        key={customer.id}
                        className="hover:bg-muted/30"
                      >
                        <TableCell className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                              {customer.name?.charAt(0)?.toUpperCase() || "?"}
                            </div>

                            <span className="font-medium text-foreground">
                              {customer.name}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="py-3">
                          {customer.email ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="size-3.5 shrink-0" />
                              <span className="max-w-[220px] truncate">
                                {customer.email}
                              </span>
                            </div>
                          ) : customer.phone ? (
                            <span className="text-sm text-muted-foreground">
                              {customer.phone}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        <TableCell className="py-3">
                          {customer.company ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Building2 className="size-3.5 shrink-0" />
                              <span>{customer.company}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        <TableCell className="pr-5 text-right py-3">
                          <div className="flex items-center justify-end gap-1.5 text-sm text-muted-foreground">
                            <CalendarDays className="size-3.5" />
                            <span className="tabular-nums">
                              {formatDate(new Date(customer.createdAt))}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-border/60 md:hidden">
                {recent.map((customer) => (
                  <div
                    key={customer.id}
                    className="flex items-start gap-3 p-4"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {customer.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-medium text-foreground">
                          {customer.name}
                        </p>

                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {formatDate(new Date(customer.createdAt))}
                        </span>
                      </div>

                      {customer.email && (
                        <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                          <Mail className="size-3 shrink-0" />
                          <span className="truncate">{customer.email}</span>
                        </div>
                      )}

                      {customer.company && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Building2 className="size-3 shrink-0" />
                          <span className="truncate">{customer.company}</span>
                        </div>
                      )}

                      {!customer.email && customer.phone && (
                        <p className="text-xs text-muted-foreground">
                          {customer.phone}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Data limitation */}
      <Card className="border-dashed border-border/70 bg-muted/20 shadow-none">
        <CardContent className="flex gap-3 p-4">
          <div className="mt-0.5 shrink-0">
            <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
              <Users className="size-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      {sampleTruncated && (
        <p className="text-right text-[11px] text-muted-foreground">
          Customer activity is based on the {sample.length} most recent
          records.
        </p>
      )}
    </div>
  );
}