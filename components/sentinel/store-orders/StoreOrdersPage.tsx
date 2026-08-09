"use client";

import { useCallback, useEffect, useState } from "react";
import { Boxes, Clock3, PackageCheck, Search, Truck, Wallet, XCircle } from "lucide-react";

import StoreOrderTable from "@/components/sentinel/store-orders/StoreOrderTable";
import StatsCard from "@/components/sentinel/StatsCard";
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
import { useDebounce } from "@/hooks/useDebounce";
import { formatKES } from "@/lib/format";
import { adminStoreOrderService } from "@/services/sentinel/admin-store-order.service";
import {
  STORE_ORDER_STATUSES,
  STORE_PAYMENT_STATUSES,
  type StoreOrder,
  type StoreOrderStats,
  type StoreOrderStatus,
  type StorePaymentStatus,
} from "@/types/storefront/store-order";

const PAGE_SIZE = 10;

export default function AdminStoreOrdersPage() {
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, pages: 1 });
  const [stats, setStats] = useState<StoreOrderStats | null>(null);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);
  const [status, setStatus] = useState<StoreOrderStatus | "all">("all");
  const [paymentStatus, setPaymentStatus] = useState<StorePaymentStatus | "all">("all");
  const [sort, setSort] = useState("-createdAt");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminStoreOrderService.list({
        page,
        limit: PAGE_SIZE,
        sort,
        q: debouncedSearch || undefined,
        status,
        paymentStatus,
      });
      setOrders(result.items);
      setPagination(result.pagination);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load orders");
    } finally {
      setLoading(false);
    }
  }, [page, sort, debouncedSearch, status, paymentStatus]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, paymentStatus]);

  useEffect(() => {
    adminStoreOrderService
      .stats()
      .then(setStats)
      .catch(() => {
        // Stats are supplementary; a failure here shouldn't block the order list.
      });
  }, []);

  const hasFilters = Boolean(search) || status !== "all" || paymentStatus !== "all";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Store Orders"
        description="Orders placed by customers through the storefront checkout."
        breadcrumbs={[
          { label: "Admin", href: "/sentinel/dashboard" },
          { label: "Store Orders" },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Orders"
          value={stats ? String(stats.totalOrders) : "—"}
          icon={Boxes}
          loading={!stats}
        />
        <StatsCard
          title="Pending"
          value={stats ? String(stats.pending) : "—"}
          icon={Clock3}
          loading={!stats}
        />
        <StatsCard
          title="Shipped"
          value={stats ? String(stats.shipped) : "—"}
          icon={Truck}
          loading={!stats}
        />
        <StatsCard
          title="Delivered"
          value={stats ? String(stats.delivered) : "—"}
          icon={PackageCheck}
          loading={!stats}
        />
        <StatsCard
          title="Cancelled"
          value={stats ? String(stats.cancelled) : "—"}
          icon={XCircle}
          loading={!stats}
        />
        <StatsCard
          title="Revenue (paid)"
          value={stats ? formatKES(stats.totalRevenue) : "—"}
          icon={Wallet}
          loading={!stats}
          className="sm:col-span-2"
        />
      </div>

      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order number, name or email..."
              className="pl-9"
              aria-label="Search store orders"
            />
          </div>

          <Select
            value={status}
            onValueChange={(value) => {
              if (typeof value === "string") setStatus(value as StoreOrderStatus | "all");
            }}
          >
            <SelectTrigger className="w-full md:w-44">
              <SelectValue>
                <span className="capitalize">{status === "all" ? "All statuses" : status}</span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STORE_ORDER_STATUSES.map((option) => (
                <SelectItem key={option} value={option}>
                  <span className="capitalize">{option}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={paymentStatus}
            onValueChange={(value) => {
              if (typeof value === "string") setPaymentStatus(value as StorePaymentStatus | "all");
            }}
          >
            <SelectTrigger className="w-full md:w-44">
              <SelectValue>
                <span className="capitalize">{paymentStatus === "all" ? "All payments" : paymentStatus}</span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All payments</SelectItem>
              {STORE_PAYMENT_STATUSES.map((option) => (
                <SelectItem key={option} value={option}>
                  <span className="capitalize">{option}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(value) => typeof value === "string" && setSort(value)}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue>{sort === "-createdAt" ? "Newest" : "Oldest"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-createdAt">Newest</SelectItem>
              <SelectItem value="createdAt">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="px-0">
          {loading ? (
            <TableSkeleton rows={6} columns={6} />
          ) : error ? (
            <div className="p-4">
              <EmptyState
                title="Something went wrong"
                description={error}
                action={
                  <Button variant="outline" onClick={() => void load()}>
                    Try again
                  </Button>
                }
              />
            </div>
          ) : orders.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title={hasFilters ? "No matching orders" : "No orders yet"}
                description={
                  hasFilters
                    ? "Try a different search term or clear the filters."
                    : "Orders placed through the storefront will show up here."
                }
                action={
                  hasFilters ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearch("");
                        setStatus("all");
                        setPaymentStatus("all");
                      }}
                    >
                      Clear filters
                    </Button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <>
              <StoreOrderTable orders={orders} />
              <Pagination
                page={pagination.page}
                totalPages={pagination.pages}
                total={pagination.total}
                onPrev={() => setPage((current) => Math.max(1, current - 1))}
                onNext={() => setPage((current) => Math.min(pagination.pages, current + 1))}
                hasPrev={pagination.page > 1}
                hasNext={pagination.page < pagination.pages}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
