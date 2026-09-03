"use client";

import { useCallback, useEffect, useState } from "react";

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

import StatsCard from "@/components/sentinel/shared/StatsCard";
import StoreOrderTable from "./components/StoreOrderTable";
import { PAGE_SIZE, STATS_CONFIG } from "@/lib/constants";

export default function AdminStoreOrdersPage() {
  const [orders, setOrders] = useState<StoreOrder[]>([]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    pages: 1,
  });

  const [stats, setStats] = useState<StoreOrderStats | null>(null);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);

  const [status, setStatus] = useState<StoreOrderStatus | "all">("all");

  const [paymentStatus, setPaymentStatus] = useState<
    StorePaymentStatus | "all"
  >("all");

  const [sort, setSort] = useState("-createdAt");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /*
   * ==========================================================
   * LOAD ORDERS
   * ==========================================================
   */

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
      setError(
        caught instanceof Error ? caught.message : "Could not load orders",
      );
    } finally {
      setLoading(false);
    }
  }, [page, sort, debouncedSearch, status, paymentStatus]);

  useEffect(() => {
    void load();
  }, [load]);

  /*
   * ==========================================================
   * RESET PAGE WHEN FILTERS CHANGE
   * ==========================================================
   */

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, paymentStatus]);

  /*
   * ==========================================================
   * LOAD STATS
   *
   * The service requires an AbortSignal.
   * ==========================================================
   */

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    adminStoreOrderService
      .stats({
        signal: controller.signal,
      })
      .then((result) => {
        if (!mounted) return;

        setStats(result);
      })
      .catch((caught) => {
        if (!mounted || caught?.name === "AbortError") {
          return;
        }

        // Stats are supplementary.
        // A stats failure should not block the order list.
        setStats(null);
      });

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  /*
   * ==========================================================
   * FILTER STATE
   * ==========================================================
   */

  const hasFilters =
    Boolean(search.trim()) || status !== "all" || paymentStatus !== "all";

  /*
   * ==========================================================
   * STATS VALUE
   * ==========================================================
   */

  const getStatValue = (key: (typeof STATS_CONFIG)[number]["key"]): string => {
    if (!stats) {
      return "-";
    }

    if (key === "revenue") {
      return formatKES(stats.totalRevenue);
    }

    return String(stats[key as keyof StoreOrderStats] ?? "-");
  };

  /*
   * ==========================================================
   * CLEAR FILTERS
   * ==========================================================
   */

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setPaymentStatus("all");
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Store orders"
        description="Orders placed through the storefront."
      />
      <div className="grid  grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {STATS_CONFIG.map(({ key, label, classes }) => (
          <StatsCard
            key={key}
            title={label}
            value={getStatValue(key)}
            loading={!stats}
            className={`
              rounded-xl
              border
              p-3
              text-sm
              shadow-none
              transition-colors
              ${classes}
            `}
          />
        ))}
      </div>
      <div
        className="
          flex
          flex-col
          gap-2
          rounded-lg
          border
          p-3
          md:flex-row
          md:items-center
          md:gap-3
        "
      >
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search orders…"
          aria-label="Search store orders"
          className="md:flex-1"
        />

        {/* Select filters */}

        <div
          className="
            grid
            grid-cols-2
            gap-2
            md:flex
            md:flex-wrap
            md:items-center
            md:gap-3
          "
        >
          {/* Order status */}

          <Select
            value={status}
            onValueChange={(value) => {
              if (typeof value === "string") {
                setStatus(value as StoreOrderStatus | "all");
              }
            }}
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue>
                <span className="capitalize">
                  {status === "all" ? "Status" : status}
                </span>
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

          {/* Payment status */}

          <Select
            value={paymentStatus}
            onValueChange={(value) => {
              if (typeof value === "string") {
                setPaymentStatus(value as StorePaymentStatus | "all");
              }
            }}
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue>
                <span className="capitalize">
                  {paymentStatus === "all" ? "Payment" : paymentStatus}
                </span>
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

          {/* Sort */}

          <Select
            value={sort}
            onValueChange={(value) => {
              if (typeof value === "string") {
                setSort(value);
              }
            }}
          >
            <SelectTrigger
              className="
                col-span-2
                w-full
                md:col-span-1
                md:w-32
              "
            >
              <SelectValue>
                {sort === "-createdAt" ? "Newest" : "Oldest"}
              </SelectValue>
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="-createdAt">Newest</SelectItem>

              <SelectItem value="createdAt">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ======================================================
          ORDERS TABLE
      ======================================================= */}

      <div className="p-1">
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
                  <Button variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <>
            <StoreOrderTable orders={orders} />

            <div className="flex justify-center px-4 py-3 md:justify-end">
              <Pagination
                page={pagination.page}
                totalPages={pagination.pages}
                total={pagination.total}
                onPrev={() => setPage((current) => Math.max(1, current - 1))}
                onNext={() =>
                  setPage((current) => Math.min(pagination.pages, current + 1))
                }
                hasPrev={pagination.page > 1}
                hasNext={pagination.page < pagination.pages}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
