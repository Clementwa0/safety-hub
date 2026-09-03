"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaCircleCheck,
  FaCircleExclamation,
  FaHourglassHalf,
  FaSpinner,
} from "react-icons/fa6";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loading } from "@/components/shared/Loading";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatKES } from "@/lib/format";
import { useOrderPaymentStatus } from "@/hooks/use-order-payment-status";
import { MPESA_CONFIG } from "@/lib/config/mpesa";

import MpesaPaymentCard from "../components/MpesaPaymentCard";
import SaveOrderPrompt from "../components/SaveOrderPrompt";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");

  const {
    order,
    loading,
    error,
    isPolling,
    lastCheckedAt,
    pollingTimedOut,
  } = useOrderPaymentStatus(orderNumber);

  const [now, setNow] = useState(() => Date.now());
  const [justConfirmed, setJustConfirmed] = useState(false);

  const previousStatusRef = useRef(order?.paymentStatus);

  /*
   * Update the "last checked" timer while payment polling is active.
   */
  useEffect(() => {
    if (!isPolling) {
      return;
    }

    const tick = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(tick);
  }, [isPolling]);

  /*
   * Detect pending -> paid transition.
   */
  useEffect(() => {
    if (
      previousStatusRef.current === "pending" &&
      order?.paymentStatus === "paid"
    ) {
      setJustConfirmed(true);
    }

    previousStatusRef.current = order?.paymentStatus;
  }, [order?.paymentStatus]);

  /*
   * Human-readable polling timestamp.
   */
  const lastCheckedLabel = (() => {
    if (!lastCheckedAt) {
      return null;
    }

    const seconds = Math.max(
      0,
      Math.round((now - lastCheckedAt.getTime()) / 1000),
    );

    if (seconds < 5) {
      return "Just now";
    }

    return `${seconds}s ago`;
  })();

  /*
   * Loading
   */
  if (loading) {
    return (
      <Loading
        label="Confirming your order..."
        className="py-16"
      />
    );
  }

  /*
   * Error / missing order
   */
  if (error || !order) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-12">
        <EmptyState
          title="We couldn't find that order"
          description={
            error ?? "The order link may be invalid or expired."
          }
          action={
            <Button
              nativeButton={false}
              render={<Link href="/shop" />}
            >
              Continue Shopping
            </Button>
          }
        />
      </div>
    );
  }

  const awaitingMpesaPayment =
    order.paymentMethod === "mpesa" &&
    order.paymentStatus !== "paid";

  return (
    <div className="container mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-7 sm:py-9">
      {/* =========================================================
          SUCCESS HEADER
      ========================================================= */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full text-center"
      >
        <div className="mb-3 flex justify-center">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-full ${
              awaitingMpesaPayment
                ? "bg-secondary/10"
                : "bg-green-500/10"
            }`}
          >
            <FaCircleCheck
              className={`h-9 w-9 ${
                awaitingMpesaPayment
                  ? "text-secondary"
                  : "text-green-500"
              }`}
            />
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {awaitingMpesaPayment
            ? "Order Placed!"
            : "Order Confirmed!"}
        </h1>

        <p className="mx-auto mt-1.5 max-w-xl text-xs leading-5 text-muted-foreground sm:text-sm">
          {awaitingMpesaPayment
            ? "Complete your M-Pesa payment below to confirm this order."
            : "Thank you for your order. Your purchase has been received successfully."}
        </p>
      </motion.div>

      {/* =========================================================
          ORDER DETAILS + SAVE ORDER
      ========================================================= */}
      <div className="mt-6 grid w-full grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
        {/* =======================================================
            LEFT - ORDER DETAILS
        ======================================================= */}
        <Card className="h-full w-full overflow-hidden text-left">
          <CardContent className="space-y-3.5 p-4 sm:p-5">
            {/* Header */}
            <div className="border-b border-border/70 pb-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Order details
              </p>

              <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                <p className="text-base font-bold text-foreground sm:text-lg">
                  #{order.orderNumber}
                </p>

                <Badge
                  variant="outline"
                  className={
                    order.paymentStatus === "paid"
                      ? "border-success/30 bg-success/10 px-2 py-0.5 text-[10px] text-success"
                      : "border-secondary/30 bg-secondary/10 px-2 py-0.5 text-[10px] text-secondary"
                  }
                >
                  {order.paymentStatus === "paid"
                    ? "Paid"
                    : "Payment pending"}
                </Badge>
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-lg border border-border/70 bg-muted/[0.25] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Total
                </p>

                <p className="mt-1 text-base font-bold text-secondary">
                  {formatKES(order.total)}
                </p>
              </div>

              <div className="rounded-lg border border-border/70 bg-muted/[0.25] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Payment
                </p>

                <p className="mt-1 text-xs font-semibold text-foreground sm:text-sm">
                  {order.paymentMethod === "mpesa"
                    ? "M-Pesa"
                    : "Cash on Delivery"}
                </p>
              </div>
            </div>

            {/* ===================================================
                COD PAYMENT STATUS
            =================================================== */}
            {order.paymentMethod === "cod" && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Payment status
                </p>

                <div className="mt-1.5">
                  {order.paymentStatus === "paid" ? (
                    <Badge className="gap-1 border-success/30 bg-success/10 px-2 py-0.5 text-[10px] text-success">
                      <FaCircleCheck className="h-2.5 w-2.5" />
                      Payment confirmed
                    </Badge>
                  ) : order.paymentStatus === "failed" ? (
                    <Badge
                      variant="destructive"
                      className="gap-1 px-2 py-0.5 text-[10px]"
                    >
                      <FaCircleExclamation className="h-2.5 w-2.5" />
                      Payment failed
                    </Badge>
                  ) : order.paymentStatus === "refunded" ? (
                    <Badge
                      variant="outline"
                      className="px-2 py-0.5 text-[10px]"
                    >
                      Refunded
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="gap-1 px-2 py-0.5 text-[10px]"
                    >
                      {isPolling && (
                        <FaSpinner className="h-2.5 w-2.5 animate-spin" />
                      )}
                      Payment pending
                    </Badge>
                  )}
                </div>

                {order.paymentStatus === "pending" && (
                  <p className="mt-1.5 text-[10px] leading-4 text-muted-foreground sm:text-xs">
                    {pollingTimedOut
                      ? "We're still waiting for payment confirmation. Refresh later to check the latest status."
                      : "We're waiting for payment confirmation. This page will update automatically."}

                    {isPolling &&
                      lastCheckedLabel &&
                      ` Last checked: ${lastCheckedLabel}.`}
                  </p>
                )}

                {order.paymentStatus === "paid" && (
                  <p className="mt-1 text-[10px] text-muted-foreground sm:text-xs">
                    Payment confirmed
                    {justConfirmed ? " just now" : ""}.
                  </p>
                )}
              </div>
            )}

            {/* ===================================================
                M-PESA PAYMENT
            =================================================== */}
            {order.paymentMethod === "mpesa" && (
              <div className="space-y-3">
                {/* Payment status */}
                {order.paymentStatus === "paid" ? (
                  <div className="flex items-start gap-2.5 rounded-lg bg-success/10 p-3 text-left">
                    <FaCircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />

                    <div>
                      <p className="text-xs font-semibold text-success sm:text-sm">
                        Payment Confirmed
                      </p>

                      <p className="mt-0.5 text-[10px] leading-4 text-success/80 sm:text-xs">
                        Your M-Pesa payment has been received successfully
                        {justConfirmed ? " (just now)" : ""}.
                      </p>
                    </div>
                  </div>
                ) : order.paymentStatus === "failed" ? (
                  <div className="flex items-start gap-2.5 rounded-lg bg-destructive/10 p-3 text-left">
                    <FaCircleExclamation className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />

                    <div>
                      <p className="text-xs font-semibold text-destructive sm:text-sm">
                        Payment Failed
                      </p>

                      <p className="mt-0.5 text-[10px] leading-4 text-destructive/80 sm:text-xs">
                        Your M-Pesa payment wasn&apos;t completed.
                      </p>
                    </div>
                  </div>
                ) : order.paymentStatus === "refunded" ? (
                  <div className="flex items-start gap-2.5 rounded-lg bg-muted p-3 text-left">
                    <FaCircleExclamation className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                    <div>
                      <p className="text-xs font-semibold text-foreground sm:text-sm">
                        Refunded
                      </p>

                      <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground sm:text-xs">
                        This order&apos;s payment has been refunded.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2.5 rounded-lg bg-secondary/10 p-3 text-left">
                    <FaHourglassHalf className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />

                    <div>
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground sm:text-sm">
                        Payment Pending

                        {isPolling && (
                          <FaSpinner className="h-2.5 w-2.5 animate-spin text-muted-foreground" />
                        )}
                      </p>

                      <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground sm:text-xs">
                        {pollingTimedOut
                          ? "We're still waiting for your M-Pesa payment. Refresh later to check the latest status."
                          : "We're waiting for your M-Pesa payment. This page will update automatically."}

                        {isPolling &&
                          lastCheckedLabel &&
                          ` Last checked: ${lastCheckedLabel}.`}
                      </p>
                    </div>
                  </div>
                )}

                {/* M-Pesa payment instructions */}
                {order.paymentStatus !== "paid" && (
                  <MpesaPaymentCard
                    className="text-left"
                    total={order.total}
                    paymentType={MPESA_CONFIG.type}
                    businessNumber={MPESA_CONFIG.businessNumber}
                    businessName={MPESA_CONFIG.businessName}
                    accountReference={order.customer.phone}
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* =======================================================
            RIGHT - SAVE ORDER
        ======================================================= */}
        <div className="h-full w-full">
          <SaveOrderPrompt order={order} />
        </div>
      </div>

      {/* =========================================================
          ACTIONS
      ========================================================= */}
      <div className="mt-4 grid w-full grid-cols-1 gap-2.5 sm:mt-5 sm:grid-cols-2">
        <Button
          className="h-10 w-full text-sm"
          nativeButton={false}
          render={
            <Link href={`/account/orders/${order.id}`} />
          }
        >
          View Order
        </Button>

        <Button
          variant="outline"
          className="h-10 w-full text-sm"
          nativeButton={false}
          render={<Link href="/shop" />}
        >
          Continue Shopping
        </Button>
      </div>
    </div>
  );
}