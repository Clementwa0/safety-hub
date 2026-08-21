"use client";

import { useEffect, useMemo, useState } from "react";
import { Lock, PackageCheck, PackageX, Wallet } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import StatsCard from "@/components/sentinel/shared/StatsCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Pagination from "@/components/shared/Pagination";
import { formatCurrency } from "@/lib/format";
import { categoryService } from "@/services/shared/category.service";
import { productService } from "@/services/shared/product.service";
import type { CategoryWithCount } from "@/types/category";

import InventoryFilters, {
  EMPTY_INVENTORY_FILTERS,
  hasActiveInventoryFilters,
  type InventoryFiltersValue,
} from "./components/InventoryFilters";
import InventoryTable from "./components/InventoryTable";
import StockHealth from "./components/StockHealth";
import StockMovements, { type StockMovementRow } from "./components/StockMovements";
import { getStockBucket } from "./stockStatus";
import { computeInventorySummary, computeStockHealthSlices } from "./summary";
import { useInventoryRows } from "./useInventoryRows";
import { inventoryValue } from "./types";
import { movementService, type Movement } from "@/services/sentinel/movement.service";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const DEFAULT_PAGE_SIZE = 25;

const MOVEMENT_REASON: Record<Movement["type"], string> = {
  manual_adjustment: "Manual adjustment",
  order_shipped: "Order shipped",
  store_order_shipped: "Store order shipped",
};

function toMovementRow(movement: Movement): StockMovementRow {
  return {
    id: movement.id,
    productName: movement.product?.name ?? "Deleted product",
    quantity: movement.delta,
    reason: movement.reference
      ? `${MOVEMENT_REASON[movement.type]} · ${movement.reference}`
      : MOVEMENT_REASON[movement.type],
    occurredAt: movement.createdAt,
  };
}

export default function InventoryPage() {
  const { rows, setRows, loading: rowsLoading, error: rowsError, reload: load } = useInventoryRows();
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [filters, setFilters] = useState<InventoryFiltersValue>(EMPTY_INVENTORY_FILTERS);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const [movements, setMovements] = useState<StockMovementRow[] | null>(null);
  const [movementsLoading, setMovementsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const loading = rowsLoading;
  const error = rowsError ?? categoriesError;

  // Recent Movements is supplementary to the main inventory table, so a
  // failure here shouldn't block the rest of the page — it just leaves
  // the panel in its "no data" empty state.
  useEffect(() => {
    let cancelled = false;
    setMovementsLoading(true);
    movementService
      .listRecent(20)
      .then((items) => {
        if (!cancelled) setMovements(items.map(toMovementRow));
      })
      .catch(() => {
        if (!cancelled) setMovements(null);
      })
      .finally(() => {
        if (!cancelled) setMovementsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);


  // Categories are only needed for the filter dropdown, so they're loaded
  // alongside — not inside — the shared inventory-rows hook.
  useEffect(() => {
    let cancelled = false;
    categoryService
      .list()
      .then((next) => {
        if (!cancelled) setCategories(next);
      })
      .catch((caught) => {
        if (!cancelled) {
          setCategoriesError(caught instanceof Error ? caught.message : "Could not load categories");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Summary cards are computed over the full, unfiltered catalogue (minus
  // archived items) so they always reflect the whole store, not just
  // what's currently visible under the active filters. `computeInventorySummary`
  // is the single source of truth shared with the Stock Health breakdown
  // below, so the two never disagree with each other.
  const summary = useMemo(() => computeInventorySummary(rows), [rows]);
  const stockHealthSlices = useMemo(() => computeStockHealthSlices(summary), [summary]);

  const filtered = useMemo(() => {
    const term = filters.search.trim().toLowerCase();

    const result = rows.filter((row) => {
      const matchesSearch =
        !term || row.name.toLowerCase().includes(term) || (row.sku ?? "").toLowerCase().includes(term);

      const matchesCategory = filters.category === "all" || String(row.category) === filters.category;
      const matchesStock = filters.stockLevel === "all" || getStockBucket(row.available) === filters.stockLevel;
      const matchesReserved = !filters.reservedOnly || row.reserved > 0;

      return matchesSearch && matchesCategory && matchesStock && matchesReserved;
    });

    const sorted = [...result];
    switch (filters.sort) {
      case "available-asc":
        sorted.sort((a, b) => a.available - b.available);
        break;
      case "available-desc":
        sorted.sort((a, b) => b.available - a.available);
        break;
      case "reserved-desc":
        sorted.sort((a, b) => b.reserved - a.reserved);
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "value-desc":
        sorted.sort((a, b) => inventoryValue(b) - inventoryValue(a));
        break;
    }

    return sorted;
  }, [rows, filters]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const totalPages = Math.ceil(filtered.length / pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, pageSize]);

  const handleStockUpdate = async (id: string, nextStock: number): Promise<boolean> => {
    setSavingId(id);
    try {
      const updated = await productService.update(id, { stock: nextStock });
      setRows((prev) =>
        prev.map((row) =>
          row.id === id
            ? {
                ...row,
                ...updated,
                reserved: row.reserved,
                available: Math.max(0, updated.stock - row.reserved),
              }
            : row,
        ),
      );
      toast.success(`Stock updated to ${nextStock}`);
      return true;
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not update stock");
      return false;
    } finally {
      setSavingId(null);
    }
  };

  const activeFilters = hasActiveInventoryFilters(filters);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="On-hand stock, what's reserved for pending sales orders, and what's actually left to sell."
      />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-3 xl:grid-cols-4 xl:gap-4">
        <StatsCard
          title="Available to Sell"
          value={String(summary.totalAvailable)}
          icon={PackageCheck}
          hint="Units, across the catalogue"
          loading={loading}
        />
        <StatsCard
          title="Reserved"
          value={String(summary.totalReserved)}
          icon={Lock}
          hint="Held for pending sales orders"
          loading={loading}
        />
        <StatsCard
          title="Out of Stock"
          value={String(summary.outOfStockCount)}
          icon={PackageX}
          loading={loading}
        />
        <StatsCard
          title="Inventory Value"
          value={formatCurrency(summary.totalValue)}
          icon={Wallet}
          hint="On-hand stock × price"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
        <StockHealth slices={stockHealthSlices} loading={loading} />
        <StockMovements data={movements} loading={movementsLoading} />
      </div>

      <InventoryFilters value={filters} onChange={setFilters} categories={categories.map((item) => item.name)} />

      <Card>
        <CardContent className="px-0">
          {error ? (
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
          ) : !loading && filtered.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title={activeFilters ? "No matching products" : "No products yet"}
                description={
                  activeFilters
                    ? "Try a different search term or clear the filters."
                    : "Add products to your catalogue to start tracking inventory."
                }
                action={
                  activeFilters ? (
                    <Button variant="outline" onClick={() => setFilters(EMPTY_INVENTORY_FILTERS)}>
                      Clear filters
                    </Button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <>
              <InventoryTable
                rows={paginatedRows}
                loading={loading}
                savingId={savingId}
                onStockUpdate={handleStockUpdate}
              />

              {!loading && (
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  total={filtered.length}
                  onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  hasPrev={currentPage > 1}
                  hasNext={currentPage < totalPages}
                  onPageChange={setCurrentPage}
                  pageSize={pageSize}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                  pageSizeOptions={PAGE_SIZE_OPTIONS}
                  showPageSize
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
