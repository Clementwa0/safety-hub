"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

import OrderTable from "@/components/sentinel/orders/OrderTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { TableSkeleton } from "@/components/shared/Loading";
import { Pagination } from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { orderService } from "@/services/order.service";
import { ORDER_STATUSES, type Order } from "@/types/order";
import { usePagination } from "@/hooks/usePagination";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOrders(await orderService.list());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load orders");
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
    return orders.filter((order) => {
      const matchesSearch =
        !term ||
        order.number.toLowerCase().includes(term) ||
        order.customer.name.toLowerCase().includes(term) ||
        (order.customer.company?.toLowerCase().includes(term) ?? false);
      const matchesStatus = status === "all" || order.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, status]);

  const pagination = usePagination(filtered, { pageSize: 10 });

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await orderService.remove(pendingDelete.id);
      toast.success(`Order ${pendingDelete.number} deleted`);
      setPendingDelete(null);
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not delete");
    } finally {
      setDeleting(false);
    }
  };

  const hasFilters = Boolean(search) || status !== "all";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Manage customer orders and fulfilment status."
        breadcrumbs={[
          { label: "Admin", href: "/sentinel/dashboard" },
          { label: "Orders" },
        ]}
        actions={
          <Button nativeButton={false} render={<Link href="/sentinel/orders/new" />}>
            <Plus className="h-4 w-4" />
            New order
          </Button>
        }
      />

      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by number, customer or company..."
              className="pl-9"
              aria-label="Search orders"
            />
          </div>
          <Select
            value={status}
            onValueChange={(value) => {
              if (typeof value === "string") setStatus(value);
            }}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue>
                <span className="capitalize">
                  {status === "all" ? "All statuses" : status}
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {ORDER_STATUSES.map((option) => (
                <SelectItem key={option} value={option}>
                  <span className="capitalize">{option}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="px-0">
          {loading ? (
            <TableSkeleton rows={6} columns={5} />
          ) : error ? (
            <div className="p-4">
              <EmptyState
                title="Something went wrong"
                description={error}
                action={<Button variant="outline" onClick={() => void load()}>Try again</Button>}
              />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title={hasFilters ? "No matching orders" : "No orders yet"}
                description={
                  hasFilters
                    ? "Try a different search term or clear the filters."
                    : "Create your first order to get started."
                }
                action={
                  hasFilters ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearch("");
                        setStatus("all");
                      }}
                    >
                      Clear filters
                    </Button>
                  ) : (
                    <Button
                      nativeButton={false}
                      render={<Link href="/sentinel/orders/new" />}
                    >
                      New order
                    </Button>
                  )
                }
              />
            </div>
          ) : (
            <>
              <OrderTable orders={pagination.pageItems} onDelete={setPendingDelete} />
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                onPrev={pagination.goPrev}
                onNext={pagination.goNext}
                hasPrev={pagination.hasPrev}
                hasNext={pagination.hasNext}
              />
            </>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Delete order?"
        description={
          pendingDelete ? `Order ${pendingDelete.number} will be permanently removed.` : undefined
        }
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
