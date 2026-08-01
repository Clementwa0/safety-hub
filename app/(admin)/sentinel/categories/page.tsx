"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import CategoryForm from "@/components/sentinel/CategoryForm";
import CategoryTable from "@/components/sentinel/CategoryTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { TableSkeleton } from "@/components/shared/Loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { categoryService } from "@/services/category.service";
import type { AdminCategory, CategoryWithCount } from "@/types/category";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CategoryWithCount | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setCategories(await categoryService.list());
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not load categories",
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

  const handleDelete = async () => {
    if (!pendingDelete) return;

    setDeleting(true);

    try {
      await categoryService.remove(pendingDelete.id);
      toast.success(`${pendingDelete.name} deleted`);
      setPendingDelete(null);
      await load();
    } catch (caught) {
      toast.error(
        caught instanceof Error ? caught.message : "Could not delete the category",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Manage product categories and taxonomy."
        breadcrumbs={[
          { label: "Admin", href: "/sentinel/dashboard" },
          { label: "Categories" },
        ]}
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add category
          </Button>
        }
      />

      <Card>
        <CardContent className="px-0">
          {loading ? (
            <TableSkeleton rows={5} columns={4} />
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
          ) : categories.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="No categories yet"
                description="Create a category to organise your products."
                action={
                  <Button
                    onClick={() => {
                      setEditing(null);
                      setFormOpen(true);
                    }}
                  >
                    Add category
                  </Button>
                }
              />
            </div>
          ) : (
            <CategoryTable
              categories={categories}
              onEdit={(category) => {
                setEditing(category);
                setFormOpen(true);
              }}
              onDelete={setPendingDelete}
            />
          )}
        </CardContent>
      </Card>

      <CategoryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editing}
        onSaved={() => void load()}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Delete category?"
        description={
          pendingDelete
            ? `"${pendingDelete.name}" has ${pendingDelete.productCount} product(s). Deleting it will not remove those products.`
            : undefined
        }
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
