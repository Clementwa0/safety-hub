"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { TableSkeleton } from "@/components/shared/Loading";
import { Pagination } from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    setLoading(true); setError(null);
    try { setQuotations(await quotationService.list()); }
    catch (c) { setError(c instanceof Error ? c.message : "Could not load"); }
    finally { setLoading(false); }
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
      const matchesSearch = !term ||
        q.number.toLowerCase().includes(term) ||
        customerName.toLowerCase().includes(term) ||
        customerCompany.toLowerCase().includes(term);
      const matchesStatus = status === "all" || q.status === status;
      const matchesAvailability =
        availability === "all" || q.items.some((item) => item.fulfillmentPlan === availability);
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
    } catch (c) { toast.error(c instanceof Error ? c.message : "Could not delete"); }
    finally { setDeleting(false); }
  };

  const duplicate = async (q: Quotation) => {
    try {
      const created = await quotationService.duplicate(q.id);
      toast.success(`Duplicated as ${created.number}`);
      await load();
    } catch (c) { toast.error(c instanceof Error ? c.message : "Could not duplicate"); }
  };

  const hasFilters = Boolean(search) || status !== "all" || availability !== "all";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quotations"
        description="Draft, send and track quotations for your customers."
        breadcrumbs={[
          { label: "Admin", href: "/sentinel/dashboard" },
          { label: "Quotations" },
        ]}
        actions={
          <Button nativeButton={false} render={<Link href="/sentinel/quotations/new" />}>
            <Plus className="h-4 w-4" /> New quotation
          </Button>
        }
      />

      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search quotations..." className="pl-9" aria-label="Search quotations" />
          </div>
          <Select value={status} onValueChange={(v) => typeof v === "string" && setStatus(v)}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue><span className="capitalize">{status === "all" ? "All statuses" : status}</span></SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {QUOTATION_STATUSES.map((o) => (
                <SelectItem key={o} value={o}><span className="capitalize">{o}</span></SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={availability} onValueChange={(v) => typeof v === "string" && setAvailability(v)}>
            <SelectTrigger className="w-full md:w-52">
              <SelectValue>
                <span className="capitalize">
                  {availability === "all" ? "All availability" : availability}
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All availability</SelectItem>
              <SelectItem value="available">Available now</SelectItem>
              <SelectItem value="partial">Partial stock</SelectItem>
              <SelectItem value="procurement">Procurement required</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="px-0">
          {loading ? <TableSkeleton rows={6} columns={6} /> :
           error ? (
             <div className="p-4"><EmptyState title="Something went wrong" description={error}
               action={<Button variant="outline" onClick={() => void load()}>Try again</Button>} /></div>
           ) :
           filtered.length === 0 ? (
             <div className="p-4"><EmptyState
               title={hasFilters ? "No matching quotations" : "No quotations yet"}
               description={hasFilters ? "Try a different search or clear filters." : "Create your first quotation."}
               action={hasFilters ? (
                 <Button variant="outline" onClick={() => { setSearch(""); setStatus("all"); setAvailability("all"); }}>Clear filters</Button>
               ) : (
                 <Button nativeButton={false} render={<Link href="/sentinel/quotations/new" />}>New quotation</Button>
               )} /></div>
           ) : (
             <>
               <QuotationTable quotations={pagination.pageItems} onDelete={setPendingDelete} onDuplicate={(q) => void duplicate(q)} />
               <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total}
                 onPrev={pagination.goPrev} onNext={pagination.goNext} hasPrev={pagination.hasPrev} hasNext={pagination.hasNext} />
             </>
           )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => { if (!open) setPendingDelete(null); }}
        title="Delete quotation?"
        description={pendingDelete ? `Quotation ${pendingDelete.number} will be permanently removed.` : undefined}
        confirmLabel="Delete" loading={deleting} onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
