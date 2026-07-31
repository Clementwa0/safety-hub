"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Download, Loader2, Star, StarOff, Sparkles, SparklesIcon, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PRODUCT_STATUSES, PRODUCT_STATUS_LABELS, type ProductStatus } from "@/types/product";
import type { BulkProductAction } from "@/services/product.service";

interface BulkActionsBarProps {
  count: number;
  busy?: boolean;
  onClear: () => void;
  onDelete: () => void;
  onSetStatus: (status: ProductStatus) => void;
  onAction: (action: BulkProductAction) => void;
  onExport: () => void;
}

export function BulkActionsBar({
  count,
  busy,
  onClear,
  onDelete,
  onSetStatus,
  onAction,
  onExport,
}: BulkActionsBarProps) {
  return (
    <AnimatePresence>
      {count > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          className="sticky top-2 z-20 flex flex-wrap items-center gap-2 rounded-lg border bg-card px-4 py-3 shadow-sm"
        >
          <span className="text-sm font-medium">
            {count} product{count === 1 ? "" : "s"} selected
          </span>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" size="sm" disabled={busy} />}>
                Change status
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {PRODUCT_STATUSES.map((status) => (
                  <DropdownMenuItem key={status} onClick={() => onSetStatus(status)}>
                    {PRODUCT_STATUS_LABELS[status]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => onAction("set-featured")}
              className="gap-1.5"
            >
              <Star className="h-3.5 w-3.5" />
              Mark featured
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => onAction("unset-featured")}
              className="gap-1.5"
            >
              <StarOff className="h-3.5 w-3.5" />
              Unfeature
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => onAction("set-new")}
              className="gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Mark new
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => onAction("unset-new")}
              className="gap-1.5"
            >
              <SparklesIcon className="h-3.5 w-3.5 opacity-40" />
              Unmark new
            </Button>

            <Button variant="outline" size="sm" disabled={busy} onClick={onExport} className="gap-1.5">
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>

            <Button
              variant="destructive"
              size="sm"
              disabled={busy}
              onClick={onDelete}
              className="gap-1.5"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              Delete
            </Button>

            <Button variant="ghost" size="icon-sm" onClick={onClear} aria-label="Clear selection">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default BulkActionsBar;
