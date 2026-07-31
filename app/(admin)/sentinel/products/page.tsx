"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PackagePlus } from "lucide-react";
import { toast } from "sonner";

import ProductTable from "@/components/sentinel/ProductTable";
import {
  EMPTY_PRODUCT_FILTERS,
  hasActiveFilters,
  ProductFilters,
  type ProductFiltersValue,
} from "@/components/sentinel/products/ProductFilters";
import { BulkActionsBar } from "@/components/sentinel/products/BulkActionsBar";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { TableSkeleton } from "@/components/shared/Loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { categoryService } from "@/services/category.service";
import { productService, type BulkProductAction } from "@/services/product.service";
import type { Product, ProductStatus } from "@/types/product";
import type { CategoryWithCount } from "@/types/category";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [filters, setFilters] = useState<ProductFiltersValue>(EMPTY_PRODUCT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [nextProducts, nextCategories] = await Promise.all([
        productService.list(),
        categoryService.list(),
      ]);

      setProducts(nextProducts);
      setCategories(nextCategories);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not load products",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await load();
    })();
  }, [load]);

  const brands = useMemo(() => {
    const set = new Set(products.map((product) => product.brand).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [products]);

  const filtered = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    const min = filters.minPrice ? Number(filters.minPrice) : undefined;
    const max = filters.maxPrice ? Number(filters.maxPrice) : undefined;

    return products.filter((product) => {
      const matchesSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        (product.sku ?? "").toLowerCase().includes(term);

      const matchesCategory =
        filters.category === "all" || String(product.category) === filters.category;

      const matchesBrand = filters.brand === "all" || (product.brand ?? "") === filters.brand;

      const matchesStatus =
        filters.status === "all" || (product.status ?? "active") === filters.status;

      const matchesFeatured = !filters.featuredOnly || Boolean(product.featured);
      const matchesNew = !filters.newOnly || Boolean(product.isNewArrival);

      const matchesMin = min === undefined || product.price >= min;
      const matchesMax = max === undefined || product.price <= max;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesBrand &&
        matchesStatus &&
        matchesFeatured &&
        matchesNew &&
        matchesMin &&
        matchesMax
      );
    });
  }, [products, filters]);

  // Selection is scoped to what's currently visible so bulk actions never
  // silently touch a filtered-out product.
  useEffect(() => {
    const visibleIds = new Set(filtered.map((product) => product.id));
    setSelectedIds((prev) => prev.filter((id) => visibleIds.has(id)));
  }, [filtered]);

  const handleDelete = async () => {
    if (!pendingDelete) return;

    setDeleting(true);

    try {
      await productService.remove(pendingDelete.id);
      toast.success(`${pendingDelete.name} deleted`);
      setPendingDelete(null);
      await load();
    } catch (caught) {
      toast.error(
        caught instanceof Error
          ? caught.message
          : "Could not delete the product",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleDuplicate = async (product: Product) => {
    try {
      await productService.duplicate(product.id);
      toast.success(`${product.name} duplicated`);
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not duplicate the product");
    }
  };

  const toggleSelect = (id: string, selected: boolean) => {
    setSelectedIds((prev) => (selected ? [...prev, id] : prev.filter((item) => item !== id)));
  };

  const toggleSelectAll = (selected: boolean) => {
    setSelectedIds(selected ? filtered.map((product) => product.id) : []);
  };

  const runBulkAction = async (action: BulkProductAction, status?: ProductStatus) => {
    if (selectedIds.length === 0) return;

    setBulkBusy(true);
    try {
      await productService.bulkAction(selectedIds, action, status);
      toast.success("Bulk action applied");
      setSelectedIds([]);
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Bulk action failed");
    } finally {
      setBulkBusy(false);
    }
  };

  const handleBulkDelete = async () => {
    setBulkBusy(true);
    try {
      await productService.bulkAction(selectedIds, "delete");
      toast.success(`${selectedIds.length} product(s) deleted`);
      setSelectedIds([]);
      setBulkDeleteOpen(false);
      await load();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Bulk delete failed");
    } finally {
      setBulkBusy(false);
    }
  };

  const handleExport = () => {
    const selected = filtered.filter((product) => selectedIds.includes(product.id));
    if (selected.length === 0) return;
    productService.exportCsv(selected);
  };

  const activeFilters = hasActiveFilters(filters);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Create, update and remove catalogue items."
        breadcrumbs={[
          { label: "Admin", href: "/sentinel/dashboard" },
          { label: "Products" },
        ]}
        actions={
          <Button
            nativeButton={false}
            render={<Link href="/sentinel/products/new" />}
          >
            <PackagePlus className="h-4 w-4" />
            Add product
          </Button>
        }
      />

      <ProductFilters
        value={filters}
        onChange={setFilters}
        categories={categories.map((item) => item.name)}
        brands={brands}
      />

      <BulkActionsBar
        count={selectedIds.length}
        busy={bulkBusy}
        onClear={() => setSelectedIds([])}
        onDelete={() => setBulkDeleteOpen(true)}
        onSetStatus={(status) => void runBulkAction("set-status", status)}
        onAction={(action) => void runBulkAction(action)}
        onExport={handleExport}
      />

      <Card>
        <CardContent className="px-0">
          {loading ? (
            <TableSkeleton rows={6} columns={5} />
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
          ) : filtered.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title={activeFilters ? "No matching products" : "No products yet"}
                description={
                  activeFilters
                    ? "Try a different search term or clear the filters."
                    : "Add your first product to start building the catalogue."
                }
                action={
                  activeFilters ? (
                    <Button variant="outline" onClick={() => setFilters(EMPTY_PRODUCT_FILTERS)}>
                      Clear filters
                    </Button>
                  ) : (
                    <Button
                      nativeButton={false}
                      render={<Link href="/sentinel/products/new" />}
                    >
                      Add product
                    </Button>
                  )
                }
              />
            </div>
          ) : (
            <ProductTable
              products={filtered}
              onDelete={setPendingDelete}
              onDuplicate={(product) => void handleDuplicate(product)}
              selectable
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onToggleSelectAll={toggleSelectAll}
            />
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Delete product?"
        description={
          pendingDelete
            ? `"${pendingDelete.name}" will be permanently removed from the catalogue.`
            : undefined
        }
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={() => void handleDelete()}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title="Delete selected products?"
        description={`${selectedIds.length} product(s) will be permanently removed from the catalogue.`}
        confirmLabel="Delete"
        loading={bulkBusy}
        onConfirm={() => void handleBulkDelete()}
      />
    </div>
  );
}
