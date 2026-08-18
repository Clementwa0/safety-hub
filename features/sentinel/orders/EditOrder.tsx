"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { EmptyState } from "@/components/shared/EmptyState";
import { Loading } from "@/components/shared/Loading";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { orderService } from "@/services/sentinel/order.service";
import type { Order } from "@/types/sentinel/order";
import OrderForm from "./components/OrderForm";

export default function EditOrderPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await orderService.getById(id);
        if (active) setOrder(result);
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : "Could not load");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit order"
        description={order?.number}
      />
      {loading ? (
        <Loading label="Loading order..." />
      ) : error || !order ? (
        <EmptyState
          title="Order not found"
          description={error ?? "This order may have been deleted."}
          action={
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try again
            </Button>
          }
        />
      ) : (
        <OrderForm order={order} />
      )}
    </div>
  );
}
