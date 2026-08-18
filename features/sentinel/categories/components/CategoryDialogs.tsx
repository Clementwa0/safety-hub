"use client";

import { Loader2, AlertTriangle, Package, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import type {
  AdminCategory,
  CategoryWithCount,
} from "@/types/category";
import CategoryForm from "./CategoryForm";

interface CategoryDialogsProps {
  formOpen: boolean;
  editing: AdminCategory | null;

  onFormOpenChange: (open: boolean) => void;
  onSaved: () => void;

  pendingDelete: CategoryWithCount | null;
  deleting: boolean;

  onDeleteOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
}

export default function CategoryDialogs({
  formOpen,
  editing,
  onFormOpenChange,
  onSaved,
  pendingDelete,
  deleting,
  onDeleteOpenChange,
  onConfirmDelete,
}: CategoryDialogsProps) {
  const hasProducts = pendingDelete && pendingDelete.productCount > 0;
  const productCount = pendingDelete?.productCount || 0;

  return (
    <>
      {/* Category Form Dialog */}
      <CategoryForm
        open={formOpen}
        onOpenChange={onFormOpenChange}
        category={editing}
        onSaved={onSaved}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={Boolean(pendingDelete)} 
        onOpenChange={(open) => !deleting && onDeleteOpenChange(open)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Category?
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {pendingDelete && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-muted/30 p-3">
                <p className="text-sm font-medium text-foreground">
                  {pendingDelete.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  /{pendingDelete.slug}
                </p>
              </div>

              {hasProducts ? (
                <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-3 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-medium text-destructive">
                      {productCount} product{productCount !== 1 ? "s" : ""} assigned
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Products will remain in your store but lose this category association.
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                    No products
                  </Badge>
                  <span className="text-xs">Safe to delete</span>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={deleting}
              onClick={() => onDeleteOpenChange(false)}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={onConfirmDelete}
              className="flex-1 sm:flex-none"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Category
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}