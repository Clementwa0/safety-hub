"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaCircleCheck, FaCircleExclamation, FaHourglassHalf, FaSpinner } from "react-icons/fa6";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loading } from "@/components/shared/Loading";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatKES } from "@/lib/format";
import { useOrderPaymentStatus } from "@/hooks/use-order-payment-status";
import SaveOrderPrompt from "@/components/checkout/SaveOrderPrompt";
import { MpesaPaymentCard } from "@/components/storefront/checkout/MpesaPaymentCard";
import { MPESA_CONFIG } from "@/lib/config/mpesa";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");

  const { order, loading, error, isPolling, lastCheckedAt, pollingTimedOut } =
    useOrderPaymentStatus(orderNumber);

  // Ticks once a second purely so the "Last checked: Xs ago" label below
  // stays live between polls, without affecting when polling itself runs.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!isPolling) return;
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, [isPolling]);

  const lastCheckedLabel = (() => {
    if (!lastCheckedAt) return null;
    const seconds = Math.max(0, Math.round((now - lastCheckedAt.getTime()) / 1000));
    if (seconds < 5) return "Just now";
    return `${seconds}s ago`;
  })();

  // Tracks whether payment just transitioned to "paid" during this visit,
  // purely to soften the copy ("...just now").
  const [justConfirmed, setJustConfirmed] = useState(false);
  const previousStatusRef = useRef(order?.paymentStatus);
  useEffect(() => {
    if (previousStatusRef.current === "pending" && order?.paymentStatus === "paid") {
      setJustConfirmed(true);
    }
    previousStatusRef.current = order?.paymentStatus;
  }, [order?.paymentStatus]);

  if (loading) {
    return <Loading label="Confirming your order..." className="py-24" />;
  }

  if (error || !order) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-16">
        <EmptyState
          title="We couldn't find that order"
          description={error ?? "The order link may be invalid or expired."}
          action={
            <Button nativeButton={false} render={<Link href="/shop" />}>
              Continue Shopping
            </Button>
          }
        />
      </div>
    );
  }

  const awaitingMpesaPayment = order.paymentMethod === "mpesa" && order.paymentStatus !== "paid";

  return (
    <div className="container mx-auto flex max-w-lg flex-col items-center px-4 py-16 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-6 flex justify-center">
          <FaCircleCheck className={`h-16 w-16 ${awaitingMpesaPayment ? "text-secondary" : "text-green-500"}`} />
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          {awaitingMpesaPayment ? "Order Placed!" : "Order Confirmed!"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {awaitingMpesaPayment
            ? "Complete your M-Pesa payment below to confirm this order."
            : "Thank you for your order."}
        </p>
      </motion.div>

      <Card className="mt-8 w-full">
        <CardContent className="space-y-4 p-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Order Number</p>
            <p className="text-lg font-semibold text-foreground">{order.orderNumber}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total</p>
            <p className="text-lg font-semibold text-secondary">{formatKES(order.total)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Payment Method</p>
            <p className="text-sm font-medium text-foreground">
              {order.paymentMethod === "mpesa" ? "M-Pesa" : "Cash on Delivery"}
            </p>
          </div>

          {order.paymentMethod === "cod" && (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Payment Status</p>
              <div className="mt-1 flex items-center gap-2">
                {order.paymentStatus === "paid" ? (
                  <Badge className="gap-1 border-success/30 bg-success/10 text-success">
                    <FaCircleCheck className="h-3 w-3" />
                    Payment confirmed
                  </Badge>
                ) : order.paymentStatus === "failed" ? (
                  <Badge variant="destructive" className="gap-1">
                    <FaCircleExclamation className="h-3 w-3" />
                    Payment failed
                  </Badge>
                ) : order.paymentStatus === "refunded" ? (
                  <Badge variant="outline">Refunded</Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    {isPolling && <FaSpinner className="h-3 w-3 animate-spin" />}
                    Payment pending
                  </Badge>
                )}
              </div>
              {order.paymentStatus === "pending" && (
                <p className="mt-1 text-left text-xs text-muted-foreground">
                  {pollingTimedOut
                    ? "We're still waiting for payment confirmation. You can refresh this page later to check the latest status."
                    : "We're waiting for confirmation of your payment. This page will update automatically."}
                  {isPolling && lastCheckedLabel && ` Last checked: ${lastCheckedLabel}.`}
                </p>
              )}
              {order.paymentStatus === "paid" && (
                <p className="mt-1 text-left text-xs text-muted-foreground">
                  Payment confirmed{justConfirmed ? " just now" : ""}.
                </p>
              )}
            </div>
          )}

          {order.paymentMethod === "mpesa" && (
            <div className="space-y-3">
              {order.paymentStatus === "paid" ? (
                <div className="flex items-start gap-3 rounded-md bg-success/10 p-3 text-left">
                  <FaCircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  <div>
                    <p className="text-sm font-semibold text-success">Payment Confirmed</p>
                    <p className="mt-0.5 text-xs text-success/80">
                      Your M-Pesa payment has been received successfully
                      {justConfirmed ? " (just now)" : ""}.
                    </p>
                  </div>
                </div>
              ) : order.paymentStatus === "failed" ? (
                <div className="flex items-start gap-3 rounded-md bg-destructive/10 p-3 text-left">
                  <FaCircleExclamation className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                  <div>
                    <p className="text-sm font-semibold text-destructive">Payment Failed</p>
                    <p className="mt-0.5 text-xs text-destructive/80">
                      Your M-Pesa payment wasn&apos;t completed.
                    </p>
                  </div>
                </div>
              ) : order.paymentStatus === "refunded" ? (
                <div className="flex items-start gap-3 rounded-md bg-muted p-3 text-left">
                  <FaCircleExclamation className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Refunded</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">This order&apos;s payment has been refunded.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 rounded-md bg-secondary/10 p-3 text-left">
                  <FaHourglassHalf className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                      Payment Pending
                      {isPolling && <FaSpinner className="h-3 w-3 animate-spin text-muted-foreground" />}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {pollingTimedOut
                        ? "We're still waiting for your M-Pesa payment. You can refresh this page later to check the latest status."
                        : "We're waiting for your M-Pesa payment. This page will update automatically."}
                      {isPolling && lastCheckedLabel && ` Last checked: ${lastCheckedLabel}.`}
                    </p>
                  </div>
                </div>
              )}

              {order.paymentStatus !== "paid" && (
                <MpesaPaymentCard
                  className="text-left"
                  total={order.total}
                  paymentType={MPESA_CONFIG.type}
                  businessNumber={MPESA_CONFIG.businessNumber}
                  businessName={MPESA_CONFIG.businessName}
                  accountReference={order.orderNumber}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <SaveOrderPrompt order={order} />

      <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
        <Button className="flex-1" nativeButton={false} render={<Link href={`/account/orders/${order.id}`} />}>
          View Order
        </Button>
        <Button variant="outline" className="flex-1" nativeButton={false} render={<Link href="/shop" />}>
          Continue Shopping
        </Button>
      </div>
    </div>
  );
}