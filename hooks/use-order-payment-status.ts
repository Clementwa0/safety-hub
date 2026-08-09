"use client";

import { useEffect, useRef, useState } from "react";

import { storeOrderService } from "@/services/storefront/store-order.service";
import type { StoreOrder, StorePaymentStatus } from "@/types/storefront/store-order";

const POLL_INTERVAL_MS = 5000;
const MAX_POLL_DURATION_MS = 10 * 60 * 1000; // 10 minutes

/** Every payment status other than "pending" is a final outcome. */
function isTerminalPaymentStatus(status: StorePaymentStatus): boolean {
  return status !== "pending";
}

interface UseOrderPaymentStatusResult {
  order: StoreOrder | null;
  loading: boolean;
  error: string | null;
  /** True while an active background poll is in flight-eligible state. */
  isPolling: boolean;
  /** Timestamp of the last successful status check (initial load or poll). */
  lastCheckedAt: Date | null;
  /** True once polling has given up after MAX_POLL_DURATION_MS without a terminal status. */
  pollingTimedOut: boolean;
}

/**
 * Loads an order by id/order-number and, while its payment is still
 * `pending`, polls the existing authenticated order-detail endpoint
 * (`GET /api/store-orders/[id]`) every 5s so the UI picks up admin-side
 * payment updates without a manual refresh.
 *
 * The client never sets payment status itself — it only reflects whatever
 * the backend reports. Polling stops as soon as the status becomes
 * terminal (paid/failed/refunded), after MAX_POLL_DURATION_MS, or when the
 * component unmounts.
 */
export function useOrderPaymentStatus(orderId: string | null): UseOrderPaymentStatusResult {
  const [order, setOrder] = useState<StoreOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null);
  const [pollingTimedOut, setPollingTimedOut] = useState(false);

  const paymentStatus = order?.paymentStatus ?? null;

  // Initial load. When there's no orderId, there's nothing to fetch — the
  // "no order" state is derived below rather than written via setState here,
  // so the effect only ever manages the actual async fetch lifecycle.
  useEffect(() => {
    if (!orderId) return;

    let cancelled = false;
    // Resetting loading/error before the fetch starts is the standard
    // "reset state before an async fetch" pattern — safe here since the
    // effect's own cleanup (`cancelled`) guards against stale writes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    setPollingTimedOut(false);

    storeOrderService
      .getById(orderId)
      .then((result) => {
        if (cancelled) return;
        setOrder(result);
        setLastCheckedAt(new Date());
      })
      .catch((caught) => {
        if (!cancelled) setError(caught instanceof Error ? caught.message : "Could not load order");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const effectiveLoading = orderId ? loading : false;
  const effectiveError = orderId ? error : "No order was specified.";

  // Background polling while payment is pending.
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!orderId || !paymentStatus || isTerminalPaymentStatus(paymentStatus)) {
      startedAtRef.current = null;
      return;
    }

    if (startedAtRef.current === null) {
      startedAtRef.current = Date.now();
    }

    const interval = setInterval(async () => {
      if (Date.now() - (startedAtRef.current ?? Date.now()) > MAX_POLL_DURATION_MS) {
        setPollingTimedOut(true);
        clearInterval(interval);
        return;
      }

      try {
        const latest = await storeOrderService.getById(orderId);
        setOrder(latest);
        setLastCheckedAt(new Date());

        if (isTerminalPaymentStatus(latest.paymentStatus)) {
          clearInterval(interval);
        }
      } catch {
        // Transient network/API hiccup — keep the current state and retry
        // on the next tick rather than surfacing an error.
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [orderId, paymentStatus]);

  const isPolling = Boolean(
    paymentStatus && !isTerminalPaymentStatus(paymentStatus) && !pollingTimedOut && !effectiveLoading,
  );

  return { order, loading: effectiveLoading, error: effectiveError, isPolling, lastCheckedAt, pollingTimedOut };
}