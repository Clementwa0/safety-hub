"use client";

import { useEffect, useRef, useState } from "react";
import { FaMobileScreenButton, FaCircleCheck, FaCircleExclamation, FaRotateRight } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { formatKES } from "@/lib/format";
import { storeOrderService } from "@/services/store-order.service";
import type { StoreOrder } from "@/types/store-order";

const POLL_INTERVAL_MS = 4000;
const POLL_TIMEOUT_MS = 90_000;

interface MpesaPaymentPanelProps {
  order: StoreOrder;
  onOrderUpdate: (order: StoreOrder) => void;
}

/**
 * Drives the M-Pesa payment for an order from the checkout success page:
 * sends the STK push automatically the first time it renders for a
 * still-pending order, polls for the outcome, and offers a retry if the
 * customer cancels, the request times out, or it fails outright.
 */
export function MpesaPaymentPanel({ order, onOrderUpdate }: MpesaPaymentPanelProps) {
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const hasAutoSentRef = useRef(false);

  const send = async () => {
    setSending(true);
    setSendError(null);
    setTimedOut(false);
    try {
      const updated = await storeOrderService.payWithMpesa(order.id);
      onOrderUpdate(updated);
    } catch (error) {
      setSendError(error instanceof Error ? error.message : "Could not send the M-Pesa prompt.");
    } finally {
      setSending(false);
    }
  };

  // Auto-send the STK push exactly once, the first time this order shows
  // up here pending and without a request already in flight.
  useEffect(() => {
    if (hasAutoSentRef.current) return;
    if (order.paymentStatus !== "pending" || order.mpesa?.checkoutRequestId) return;
    hasAutoSentRef.current = true;
    void send();
    // Intentionally only runs on mount — later status changes are handled
    // by the polling effect below, not by re-running this one.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll for the outcome while a request is in flight and still pending.
  useEffect(() => {
    if (order.paymentStatus !== "pending" || !order.mpesa?.checkoutRequestId) return;

    let cancelled = false;
    const startedAt = Date.now();

    const interval = setInterval(() => {
      if (cancelled) return;

      if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
        setTimedOut(true);
        clearInterval(interval);
        return;
      }

      storeOrderService
        .getMpesaStatus(order.id)
        .then((updated) => {
          if (!cancelled) onOrderUpdate(updated);
        })
        .catch(() => {
          // Transient network/API hiccup — the next tick tries again.
        });
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [order.id, order.paymentStatus, order.mpesa?.checkoutRequestId, onOrderUpdate]);

  if (order.paymentStatus === "paid") {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-md bg-green-500/10 p-3 text-sm text-green-700">
        <FaCircleCheck className="h-4 w-4 shrink-0" />
        <span>
          Payment received{order.mpesa?.receiptNumber ? ` — M-Pesa receipt ${order.mpesa.receiptNumber}` : ""}.
        </span>
      </div>
    );
  }

  if (order.paymentStatus === "failed") {
    return (
      <div className="mt-4 space-y-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
        <div className="flex items-center gap-2">
          <FaCircleExclamation className="h-4 w-4 shrink-0" />
          <span>{order.mpesa?.resultDesc || "The M-Pesa payment wasn't completed."}</span>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => void send()}
          disabled={sending}
          className="gap-2"
        >
          <FaRotateRight className="h-3.5 w-3.5" />
          {sending ? "Sending..." : "Try Again"}
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-2 rounded-md bg-secondary/10 p-3 text-sm text-foreground">
      <div className="flex items-center gap-2">
        <FaMobileScreenButton className="h-4 w-4 shrink-0 text-secondary" />
        <span>
          {sending
            ? "Sending the payment prompt to your phone..."
            : `Check ${order.mpesa?.phone || "your phone"} and enter your M-Pesa PIN to pay ${formatKES(order.total)}.`}
        </span>
      </div>

      {timedOut && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Still waiting on that payment.</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void send()}
            disabled={sending}
            className="gap-2"
          >
            <FaRotateRight className="h-3.5 w-3.5" />
            {sending ? "Sending..." : "Resend Prompt"}
          </Button>
        </div>
      )}

      {sendError && <p className="text-xs text-destructive">{sendError}</p>}
    </div>
  );
}
