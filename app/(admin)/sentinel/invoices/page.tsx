"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

import InvoiceTable from "@/components/sentinel/invoices/InvoiceTable";
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
import { invoiceService } from "@/services/invoice.service";
import { INVOICE_STATUSES, type Invoice } from "@/types/invoice";
import { usePagination } from "@/hooks/usePagination";

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Invoice | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setInvoices(await invoiceService.list()); }
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
    return invoices.filter((inv) => {
      const matchesSearch = !term ||
        inv.number.toLowerCase().includes(term) ||
        inv.customer.name.toLowerCase().includes(term) ||
        (inv.customer.company?.toLowerCase().includes(term) ?? false);
      const effective = invoiceService.effectiveStatus(inv);
      const matchesStatus = status === "all" || effective === status;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, status]);

  const pagination = usePagination(filtered, { pageSize: 10 });

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await invoiceService.remove(pendingDelete.id);
      toast.success(`Invoice ${pendingDelete.number} deleted`);
      setPendingDelete(null);
      await load();
    } catch (c) { toast.error(c instanceof Error ? c.message : "Could not delete"); }
    finally { setDeleting(false); }
  };

  const hasFilters = Boolean(search) || status !== "all";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Bill customers and track payments."
        breadcrumbs={[
          { label: "Admin", href: "/sentinel/dashboard" },
          { label: "Invoices" },
        ]}
        actions={
          <Button nativeButton={false} render={<Link href="/sentinel/invoices/new" />}>
            <Plus className="h-4 w-4" /> New invoice
          </Button>
        }
      />

      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoices..." className="pl-9" aria-label="Search invoices" />
          </div>
          <Select value={status} onValueChange={(v) => typeof v === "string" && setStatus(v)}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue><span className="capitalize">{status === "all" ? "All statuses" : status.replace(/_/g, " ")}</span></SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {INVOICE_STATUSES.map((o) => (
                <SelectItem key={o} value={o}><span className="capitalize">{o.replace(/_/g, " ")}</span></SelectItem>
              ))}
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
               title={hasFilters ? "No matching invoices" : "No invoices yet"}
               description={hasFilters ? "Try a different search or clear filters." : "Create your first invoice."}
               action={hasFilters ? (
                 <Button variant="outline" onClick={() => { setSearch(""); setStatus("all"); }}>Clear filters</Button>
               ) : (
                 <Button nativeButton={false} render={<Link href="/sentinel/invoices/new" />}>New invoice</Button>
               )} /></div>
           ) : (
             <>
               <InvoiceTable invoices={pagination.pageItems} onDelete={setPendingDelete} />
               <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total}
                 onPrev={pagination.goPrev} onNext={pagination.goNext} hasPrev={pagination.hasPrev} hasNext={pagination.hasNext} />
             </>
           )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => { if (!open) setPendingDelete(null); }}
        title="Delete invoice?"
        description={pendingDelete ? `Invoice ${pendingDelete.number} will be permanently removed.` : undefined}
        confirmLabel="Delete" loading={deleting} onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
