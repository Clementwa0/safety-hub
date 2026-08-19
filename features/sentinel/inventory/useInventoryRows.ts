"use client";

import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";

import { productService } from "@/services/shared/product.service";
import type { InventoryRow } from "./types";

const AVAILABILITY_CHUNK_SIZE = 50;

export interface UseInventoryRowsResult {
  rows: InventoryRow[];
  /** Exposed for callers that apply an optimistic local edit (e.g. an
   *  inline stock update) rather than refetching the whole catalogue. */
  setRows: Dispatch<SetStateAction<InventoryRow[]>>;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

/**
 * Loads the catalogue plus its reserved/available projection and returns
 * `InventoryRow[]` — the same real data source the Inventory page uses.
 * Extracted so the Inventory Report tab can't drift from what the
 * Inventory page itself shows (no separate, possibly-stale computation).
 */
export function useInventoryRows(): UseInventoryRowsResult {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const products = await productService.list();

      const ids = products.map((p) => p.id);
      const availability = new Map<string, { reserved: number; available: number }>();
      for (let i = 0; i < ids.length; i += AVAILABILITY_CHUNK_SIZE) {
        const chunk = ids.slice(i, i + AVAILABILITY_CHUNK_SIZE);
        const result = await productService.getAvailability(chunk);
        for (const [id, entry] of result) {
          availability.set(id, { reserved: entry.reserved, available: entry.available });
        }
      }

      setRows(
        products.map((product) => {
          const entry = availability.get(product.id);
          return {
            ...product,
            reserved: entry?.reserved ?? 0,
            available: entry?.available ?? product.stock,
          };
        }),
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load inventory");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { rows, setRows, loading, error, reload: load };
}
