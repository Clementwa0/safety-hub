"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaCircleCheck } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loading } from "@/components/shared/Loading";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatKES } from "@/lib/format";
import { storeOrderService } from "@/services/store-order.service";
import type { StoreOrder } from "@/types/store-order";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");

  const [order, setOrder] = useState<StoreOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderNumber) {
      setLoading(false);
      setError("No order was specified.");
      return;
    }

    let cancelled = false;
    setLoading(true);

    storeOrderService
      .getById(orderNumber)
      .then((result) => {
        if (!cancelled) setOrder(result);
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
  }, [orderNumber]);

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

  return (
    <div className="container mx-auto flex max-w-lg flex-col items-center px-4 py-16 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-6 flex justify-center">
          <FaCircleCheck className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Order Confirmed!</h1>
        <p className="mt-2 text-muted-foreground">Thank you for your order.</p>
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
        </CardContent>
      </Card>

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
