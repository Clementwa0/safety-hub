"use client";

import { Plus, Search } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { TableSkeleton } from "@/components/shared/Loading";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

import type {
  AdminCategory,
  CategoryWithCount,
} from "@/types/category";
import CategoryTable from "./CategoryTable";

interface CategoriesContentProps {
  categories: CategoryWithCount[];
  loading: boolean;
  error: string | null;

  onRetry: () => void;
  onCreate: () => void;
  onEdit: (category: AdminCategory) => void;
  onDelete: (category: CategoryWithCount) => void;
}

export default function CategoriesContent({
  categories,
  loading,
  error,
  onRetry,
  onCreate,
  onEdit,
  onDelete,
}: CategoriesContentProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter categories based on search
  const filteredCategories = categories.filter((category) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      category.name.toLowerCase().includes(query) ||
      category.slug.toLowerCase().includes(query) ||
      (category.description && category.description.toLowerCase().includes(query))
    );
  });

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Categories"
        description="Manage product categories and taxonomy."
        actions={
          <Button onClick={onCreate} size="sm" className="sm:size-default">
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Add category</span>
            <span className="sm:hidden">Add</span>
          </Button>
        }
      />

      <Card className="border-border/70 p-2 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4">
              <TableSkeleton rows={5} columns={4} />
            </div>
          ) : error ? (
            <div className="p-6 sm:p-8">
              <EmptyState
                title="Something went wrong"
                description={error}
                action={
                  <Button variant="outline" onClick={onRetry}>
                    Try again
                  </Button>
                }
              />
            </div>
          ) : categories.length === 0 ? (
            <div className="p-6 sm:p-8">
              <EmptyState
                title="No categories yet"
                description="Create a category to organise your products."
                action={
                  <Button onClick={onCreate}>
                    <Plus className="h-4 w-4" />
                    Add category
                  </Button>
                }
              />
            </div>
          ) : (
            <>
              {/* Category Table */}
              <div className="p-0">
                <CategoryTable
                  categories={filteredCategories}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}