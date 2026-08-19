"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { TableSkeleton } from "@/components/shared/Loading";
import { Pagination } from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { useDebounce } from "@/hooks/useDebounce";
import { customerService } from "@/services/sentinel/customer.service";
import type { Customer } from "@/types/sentinel/customer";
import CustomerTable from "./components/CustomerTable";
import CustomerForm from "./components/CustomerForm";

const PAGE_SIZE = 25;

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, pages: 1 });

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);

  const [pendingDelete, setPendingDelete] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await customerService.list({
        page,
        limit: PAGE_SIZE,
        sort: "-createdAt",
        q: debouncedSearch || undefined,
      });
      setCustomers(result.items);
      setPagination(result.pagination);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load customers");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const hasFilters = Boolean(search);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setEditing(customer);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await customerService.remove(pendingDelete.id);
      toast.success(`${pendingDelete.name} deleted`);
      setPendingDelete(null);
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not delete the customer");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Manage customer records used across quotations, orders and invoices."
        breadcrumbs={[{ label: "Admin", href: "/sentinel/dashboard" }, { label: "Customers" }]}
        actions={
          <Button onClick={openCreate} size="sm" className="sm:size-default">
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Add customer</span>
            <span className="sm:hidden">Add</span>
          </Button>
        }
      />

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email or company..."
              className="pl-9"
              aria-label="Search customers"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="px-0">
          {loading ? (
            <TableSkeleton rows={6} columns={4} />
          ) : error ? (
            <div className="p-4">
              <EmptyState
                title="Something went wrong"
                description={error}
                action={
                  <Button variant="outline" onClick={() => void load()}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try again
                  </Button>
                }
              />
            </div>
          ) : customers.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title={hasFilters ? "No matching customers" : "No customers yet"}
                description={
                  hasFilters
                    ? "Try a different search term."
                    : "Add your first customer to start building quotations and orders for them."
                }
                action={
                  hasFilters ? (
                    <Button variant="outline" onClick={() => setSearch("")}>
                      Clear search
                    </Button>
                  ) : (
                    <Button onClick={openCreate}>
                      <Plus className="h-4 w-4" />
                      Add customer
                    </Button>
                  )
                }
              />
            </div>
          ) : (
            <div className="px-4">
              <CustomerTable customers={customers} onEdit={openEdit} onDelete={setPendingDelete} />
            </div>
          )}
        </CardContent>
      </Card>

      {!loading && !error && customers.length > 0 ? (
        <Pagination
          page={pagination.page}
          totalPages={pagination.pages}
          total={pagination.total}
          hasPrev={pagination.page > 1}
          hasNext={pagination.page < pagination.pages}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(pagination.pages, p + 1))}
          onPageChange={setPage}
        />
      ) : null}

      <CustomerForm open={formOpen} onOpenChange={setFormOpen} customer={editing} onSaved={() => void load()} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !deleting && !open && setPendingDelete(null)}
        title="Delete customer?"
        description={
          pendingDelete
            ? `${pendingDelete.name} will be permanently removed. This does not affect their existing quotations, orders or invoices.`
            : undefined
        }
        confirmLabel="Delete customer"
        destructive
        loading={deleting}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
