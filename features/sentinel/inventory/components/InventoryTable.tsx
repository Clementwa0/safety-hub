"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Loader2, Pencil, X } from "lucide-react";

import { SafeImage } from "@/components/shared/SafeImage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatKES } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getStockBucket } from "../stockStatus";
import { inventoryValue, type InventoryRow } from "../types";

const BUCKET_TEXT_STYLES: Record<ReturnType<typeof getStockBucket>, string> = {
  out: "text-destructive",
  low: "text-destructive",
  "running-low": "text-amber-600",
  "in-stock": "text-success",
};

const BUCKET_BADGE_STYLES: Record<ReturnType<typeof getStockBucket>, string> = {
  out: "bg-destructive/10 text-destructive",
  low: "bg-destructive/10 text-destructive",
  "running-low": "bg-amber-500/10 text-amber-600",
  "in-stock": "bg-success/10 text-success",
};

const BUCKET_LABELS: Record<ReturnType<typeof getStockBucket>, string> = {
  out: "Unavailable",
  low: "Low",
  "running-low": "Running Low",
  "in-stock": "Available",
};

/** Split bar: how much of on-hand stock is reserved for pending sales
 *  orders vs. still sellable. This is the thing a "products" table can't
 *  show, since `reserved` isn't part of the catalogue model at all. */
function StockSplitBar({ stock, reserved }: { stock: number; reserved: number }) {
  if (stock <= 0) {
    return <div className="h-1.5 w-full rounded-full bg-muted" />;
  }
  const reservedPct = Math.min(100, Math.round((reserved / stock) * 100));
  return (
    <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-success/20">
      {reservedPct > 0 && <div className="h-full bg-amber-500" style={{ width: `${reservedPct}%` }} />}
    </div>
  );
}

interface StockCellProps {
  row: InventoryRow;
  saving: boolean;
  onSave: (id: string, nextStock: number) => Promise<boolean>;
}

/** On-hand quantity with an inline pencil-to-edit affordance. */
function StockCell({ row, saving, onSave }: StockCellProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(row.stock));

  const startEdit = () => {
    setDraft(String(row.stock));
    setEditing(true);
  };

  const cancel = () => setEditing(false);

  const save = async () => {
    const next = Number(draft);
    if (!Number.isFinite(next) || next < 0 || !Number.isInteger(next)) return;
    if (next === row.stock) {
      setEditing(false);
      return;
    }
    const ok = await onSave(row.id, next);
    if (ok) setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1.5">
        <Input
          type="number"
          min={0}
          step={1}
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void save();
            if (e.key === "Escape") cancel();
          }}
          className="h-8 w-20"
          disabled={saving}
        />
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="h-8 w-8 shrink-0 text-success"
          onClick={() => void save()}
          disabled={saving}
          aria-label="Save on-hand stock"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
        </Button>
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="h-8 w-8 shrink-0"
          onClick={cancel}
          disabled={saving}
          aria-label="Cancel"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={startEdit}
      className="group/stock flex items-center gap-1.5 rounded-md px-1 py-0.5 text-left transition-colors hover:bg-accent/60"
    >
      <span className="text-sm font-medium tabular-nums text-foreground">{row.stock}</span>
      <Pencil className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/stock:opacity-100" />
    </button>
  );
}

interface InventoryTableProps {
  rows: InventoryRow[];
  loading?: boolean;
  savingId?: string | null;
  onStockUpdate: (id: string, nextStock: number) => Promise<boolean>;
}

export default function InventoryTable({ rows, loading = false, savingId = null, onStockUpdate }: InventoryTableProps) {
  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 w-full animate-pulse rounded bg-muted" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
        No products match these filters
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop table */}
      <div className="hidden w-full overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[220px] text-sm font-medium">Product</TableHead>
              <TableHead className="text-sm font-medium">On Hand</TableHead>
              <TableHead className="hidden sm:table-cell text-sm font-medium">Reserved</TableHead>
              <TableHead className="min-w-[130px] text-sm font-medium">Available</TableHead>
              <TableHead className="hidden lg:table-cell text-sm font-medium">Value</TableHead>
              <TableHead className="text-right text-sm font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.map((row) => {
              const normalizedImage = typeof row.image === "string" ? row.image.trim() : row.image?.src;
              const bucket = getStockBucket(row.available);

              return (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-muted">
                        <SafeImage
                          src={normalizedImage || null}
                          alt={row.name}
                          fill
                          preset="thumbnail"
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{row.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {row.sku ? `SKU: ${row.sku} · ` : ""}
                          {row.category}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <StockCell row={row} saving={savingId === row.id} onSave={onStockUpdate} />
                  </TableCell>

                  <TableCell className="hidden sm:table-cell">
                    {row.reserved > 0 ? (
                      <span className="text-sm font-medium tabular-nums text-amber-600">{row.reserved}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="w-28 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn("text-sm font-semibold tabular-nums", BUCKET_TEXT_STYLES[bucket])}>
                          {row.available}
                        </span>
                        <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-medium", BUCKET_BADGE_STYLES[bucket])}>
                          {BUCKET_LABELS[bucket]}
                        </span>
                      </div>
                      <StockSplitBar stock={row.stock} reserved={row.reserved} />
                    </div>
                  </TableCell>

                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {formatKES(inventoryValue(row))}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      nativeButton={false}
                      render={<Link href={`/sentinel/products/${row.id}/edit`} />}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-2 p-2 md:hidden">
        {rows.map((row) => {
          const normalizedImage = typeof row.image === "string" ? row.image.trim() : row.image?.src;
          const bucket = getStockBucket(row.available);

          return (
            <Card key={row.id} className="border-border/70 shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                    <SafeImage
                      src={normalizedImage || null}
                      alt={row.name}
                      fill
                      preset="thumbnail"
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{row.name}</p>
                        <p className="truncate text-[10px] text-muted-foreground">
                          {row.sku ? `SKU: ${row.sku} · ` : ""}
                          {row.category}
                        </p>
                      </div>
                      <span className={cn("shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium", BUCKET_BADGE_STYLES[bucket])}>
                        {BUCKET_LABELS[bucket]}
                      </span>
                    </div>

                    <StockSplitBar stock={row.stock} reserved={row.reserved} />

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-[9px] uppercase tracking-wide text-muted-foreground">On Hand</p>
                        <StockCell row={row} saving={savingId === row.id} onSave={onStockUpdate} />
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Reserved</p>
                        <p className="text-sm font-medium tabular-nums text-amber-600">
                          {row.reserved > 0 ? row.reserved : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Available</p>
                        <p className={cn("text-sm font-semibold tabular-nums", BUCKET_TEXT_STYLES[bucket])}>
                          {row.available}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/50 pt-1.5">
                      <p className="text-[10px] text-muted-foreground">Value: {formatKES(inventoryValue(row))}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 shrink-0 px-2 text-xs"
                        nativeButton={false}
                        render={<Link href={`/sentinel/products/${row.id}/edit`} />}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
