"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Filter, Package, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { TableSkeleton } from "@/components/shared/Loading";
import { Pagination } from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { quotationService } from "@/services/sentinel/quotation.service";
import { QUOTATION_STATUSES, type Quotation } from "@/types/sentinel/quotation";
import { usePagination } from "@/hooks/usePagination";
import QuotationTable from "./components/QuotationTable";

export default function AdminQuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [availability, setAvailability] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Quotation | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setQuotations(await quotationService.list());
    } catch (c) {
      setError(c instanceof Error ? c.message : "Could not load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return quotations.filter((q) => {
      const customerName = q.customer?.name ?? "";
      const customerCompany = q.customer?.company ?? "";
      const matchesSearch =
        !term ||
        q.number.toLowerCase().includes(term) ||
        customerName.toLowerCase().includes(term) ||
        customerCompany.toLowerCase().includes(term);
      const matchesStatus = status === "all" || q.status === status;
      const matchesAvailability =
        availability === "all" ||
        q.items.some((item) => item.fulfillmentPlan === availability);
      return matchesSearch && matchesStatus && matchesAvailability;
    });
  }, [quotations, search, status, availability]);

  const pagination = usePagination(filtered, { pageSize: 10 });

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await quotationService.remove(pendingDelete.id);
      toast.success(`Quotation ${pendingDelete.number} deleted`);
      setPendingDelete(null);
      await load();
    } catch (c) {
      toast.error(c instanceof Error ? c.message : "Could not delete");
    } finally {
      setDeleting(false);
    }
  };

  const duplicate = async (q: Quotation) => {
    try {
      const created = await quotationService.duplicate(q.id);
      toast.success(`Duplicated as ${created.number}`);
      await load();
    } catch (c) {
      toast.error(c instanceof Error ? c.message : "Could not duplicate");
    }
  };

  const hasFilters = Boolean(search) || status !== "all" || availability !== "all";

  return (
    <div className="space-y-2 sm:space-y-3">
      <PageHeader
        title="Quotations"
        description="Draft, send and track quotations."
        actions={
          <Button
            nativeButton={false}
            render={<Link href="/sentinel/quotations/new" />}
            size="sm"
            className="h-7 gap-1 px-2.5 text-xs sm:h-8 sm:gap-1.5 sm:px-3"
          >
            <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> New
          </Button>
        }
        className="[&>h1]:text-base [&>p]:text-xs sm:[&>h1]:text-lg sm:[&>p]:text-sm"
      />

      {/* Filters */}
      <div className="grid gap-1.5 p-2 sm:gap-2 sm:p-3 md:grid-cols-[1fr_auto_auto] bg-muted/30 rounded-lg">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground sm:h-3.5 sm:w-3.5" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="h-7 pl-6 text-xs sm:h-8 sm:pl-7 sm:text-sm"
            aria-label="Search quotations"
          />
        </div>
        <Select value={status} onValueChange={(v) => typeof v === "string" && setStatus(v)}>
          <SelectTrigger className="h-7 w-full text-xs sm:h-8 sm:text-sm md:w-36">
            <span className="flex items-center gap-1">
              <Filter className="h-3 w-3 text-muted-foreground sm:hidden" />
              <SelectValue>
                <span className="capitalize">{status === "all" ? "Status" : status}</span>
              </SelectValue>
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {QUOTATION_STATUSES.map((o) => (
              <SelectItem key={o} value={o} className="capitalize">
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={availability} onValueChange={(v) => typeof v === "string" && setAvailability(v)}>
          <SelectTrigger className="h-7 w-full text-xs sm:h-8 sm:text-sm md:w-36">
            <span className="flex items-center gap-1">
              <Package className="h-3 w-3 text-muted-foreground sm:hidden" />
              <SelectValue>
                <span className="capitalize">
                  {availability === "all" ? "Availability" : availability}
                </span>
              </SelectValue>
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All availability</SelectItem>
            <SelectItem value="available">Available now</SelectItem>
            <SelectItem value="partial">Partial stock</SelectItem>
            <SelectItem value="procurement">Procurement required</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table / List area */}
      <div className="rounded-lg border border-border/30 bg-background overflow-hidden">
        {loading ? (
          <TableSkeleton rows={5} columns={5} />
        ) : error ? (
          <div className="p-3 sm:p-4">
            <EmptyState
              title="Something went wrong"
              description={error}
              action={
                <Button variant="outline" onClick={() => void load()} size="sm" className="h-7 text-xs sm:h-8 sm:text-sm">
                  Try again
                </Button>
              }
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-3 sm:p-4">
            <EmptyState
              title={hasFilters ? "No matching quotations" : "No quotations yet"}
              description={hasFilters ? "Try different filters." : "Create your first quotation."}
              action={
                hasFilters ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearch("");
                      setStatus("all");
                      setAvailability("all");
                    }}
                    size="sm"
                    className="h-7 text-xs sm:h-8 sm:text-sm"
                  >
                    Clear filters
                  </Button>
                ) : (
                  <Button
                    nativeButton={false}
                    render={<Link href="/sentinel/quotations/new" />}
                    size="sm"
                    className="h-7 text-xs sm:h-8 sm:text-sm"
                  >
                    New quotation
                  </Button>
                )
              }
            />
          </div>
        ) : (
          <>
            <QuotationTable
              quotations={pagination.pageItems}
              onDelete={setPendingDelete}
              onDuplicate={(q) => void duplicate(q)}
            />
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              onPrev={pagination.goPrev}
              onNext={pagination.goNext}
              hasPrev={pagination.hasPrev}
              hasNext={pagination.hasNext}
              className="py-2 px-2 text-xs sm:py-3 sm:px-3 sm:text-sm"
            />
          </>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Delete quotation?"
        description={
          pendingDelete ? `Quotation ${pendingDelete.number} will be permanently removed.` : undefined
        }
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}