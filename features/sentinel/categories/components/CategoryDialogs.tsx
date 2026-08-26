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
  const hasProducts =
    pendingDelete && pendingDelete.productCount > 0;

  const productCount = pendingDelete?.productCount ?? 0;

  return (
    <>
      {/* Category Form */}
      <CategoryForm
        open={formOpen}
        onOpenChange={onFormOpenChange}
        category={editing}
        onSaved={onSaved}
      />

      {/* Delete Confirmation */}
      <Dialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!deleting) {
            onDeleteOpenChange(open);
          }
        }}
      >
        <DialogContent
          className="
            w-[calc(100%-2rem)]
            max-w-md
            gap-0
            overflow-hidden
            rounded-xl
            p-0
          "
        >
          {/* Header */}
          <DialogHeader className="border-b px-4 py-4 sm:px-6 sm:py-5">
            <DialogTitle className="flex items-center gap-2 text-base font-semibold sm:text-lg">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-destructive/10 sm:h-8 sm:w-8">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive sm:h-4 sm:w-4" />
              </span>

              Delete category?
            </DialogTitle>

            <DialogDescription className="pl-9 text-xs sm:pl-10 sm:text-sm">
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {pendingDelete && (
            <div className="space-y-3 px-4 py-4 sm:space-y-4 sm:px-6 sm:py-5">
              {/* Category */}
              <div className="rounded-lg border bg-muted/30 px-3 py-2.5 sm:p-3">
                <p className="truncate text-sm font-medium text-foreground">
                  {pendingDelete.name}
                </p>

                <p className="mt-0.5 truncate text-[11px] text-muted-foreground sm:text-xs">
                  /{pendingDelete.slug}
                </p>
              </div>

              {/* Products Warning */}
              {hasProducts ? (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                  <div className="flex items-start gap-2">
                    <Package className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive sm:h-4 sm:w-4" />

                    <div className="min-w-0">
                      <p className="text-xs font-medium text-destructive sm:text-sm">
                        {productCount} product
                        {productCount !== 1 ? "s" : ""} assigned
                      </p>

                      <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground sm:text-xs">
                        Products will remain in your store but
                        lose this category association.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="
                      h-5
                      border-emerald-200
                      px-1.5
                      text-[10px]
                      font-medium
                      text-emerald-600
                      sm:h-6
                      sm:px-2
                      sm:text-xs
                    "
                  >
                    No products
                  </Badge>

                  <span className="text-[10px] text-muted-foreground sm:text-xs">
                    Safe to delete
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <DialogFooter
            className="
              flex-row
              gap-2
              border-t
              bg-muted/20
              px-4
              py-3
              sm:px-6
              sm:py-4
            "
          >
            <Button
              type="button"
              variant="outline"
              disabled={deleting}
              onClick={() => onDeleteOpenChange(false)}
              className="h-9 flex-1 text-xs sm:h-10 sm:flex-none sm:px-4 sm:text-sm"
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={onConfirmDelete}
              className="h-9 flex-1 text-xs sm:h-10 sm:flex-none sm:px-4 sm:text-sm"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Delete
                  <span className="hidden sm:inline">
                    {" "}
                    Category
                  </span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}