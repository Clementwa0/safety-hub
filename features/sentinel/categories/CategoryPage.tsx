"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import type {
  AdminCategory,
  CategoryWithCount,
} from "@/types/category";

import { categoryService } from "@/services/shared/category.service";
import CategoriesContent from "./components/CategoriesContent";
import CategoryDialogs from "./components/CategoryDialogs";


export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);

  const [pendingDelete, setPendingDelete] =
    useState<CategoryWithCount | null>(null);

  const [deleting, setDeleting] = useState(false);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await categoryService.list();
      setCategories(data);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not load categories",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (category: AdminCategory) => {
    setEditing(category);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;

    setDeleting(true);

    try {
      await categoryService.remove(pendingDelete.id);

      toast.success(`${pendingDelete.name} deleted`);

      setPendingDelete(null);

      await loadCategories();
    } catch (caught) {
      toast.error(
        caught instanceof Error
          ? caught.message
          : "Could not delete the category",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <CategoriesContent
        categories={categories}
        loading={loading}
        error={error}
        onRetry={() => void loadCategories()}
        onCreate={openCreate}
        onEdit={openEdit}
        onDelete={setPendingDelete}
      />

      <CategoryDialogs
        formOpen={formOpen}
        editing={editing}
        onFormOpenChange={setFormOpen}
        onSaved={() => void loadCategories()}
        pendingDelete={pendingDelete}
        deleting={deleting}
        onDeleteOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null);
          }
        }}
        onConfirmDelete={() => void handleDelete()}
      />
    </>
  );
}