"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Pencil, Printer } from "lucide-react";
import { toast } from "sonner";

import DocumentPreview from "@/components/sentinel/sales/DocumentPreview";
import { OrderStatusBadge } from "@/components/sentinel/sales/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Loading } from "@/components/shared/Loading";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { orderService } from "@/services/sentinel/order.service";
import { ORDER_STATUSES, type Order, type OrderStatus } from "@/types/sentinel/order";

export default function OrderViewPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      setOrder(await orderService.getById(id));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [load]);

  const updateStatus = async (next: OrderStatus) => {
    if (!order) return;
    setUpdatingStatus(true);
    try {
      const updated = await orderService.update(order.id, { status: next });
      setOrder(updated);
      toast.success(`Status updated to ${next}`);
      router.refresh();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not update");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) return <Loading label="Loading order..." />;
  if (error || !order) {
    return (
      <EmptyState
        title="Order not found"
        description={error ?? "This order may have been deleted."}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Order ${order.number}`}
        description={`For ${order.customer.name}${order.customer.company ? ` · ${order.customer.company}` : ""}`}
        breadcrumbs={[
          { label: "Admin", href: "/sentinel/dashboard" },
          { label: "Orders", href: "/sentinel/orders" },
          { label: order.number },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button
              nativeButton={false}
              render={<Link href={`/sentinel/orders/${order.id}/edit`} />}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base">Status</CardTitle>
            <div className="mt-2">
              <OrderStatusBadge status={order.status} />
            </div>
          </div>
          <div className="w-full max-w-xs space-y-2">
            <Label>Change status</Label>
            <Select
              value={order.status}
              onValueChange={(value) => {
                if (typeof value === "string") void updateStatus(value as OrderStatus);
              }}
              disabled={updatingStatus}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUSES.map((option) => (
                  <SelectItem key={option} value={option}>
                    <span className="capitalize">{option}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {order.notes ? (
            <p className="whitespace-pre-line text-sm text-muted-foreground">
              {order.notes}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No notes on this order.</p>
          )}
        </CardContent>
      </Card>

      <DocumentPreview
        documentType="Order"
        documentNumber={order.number}
        issueDate={order.createdAt}
        status={order.status}
        customer={order.customer}
        items={order.items}
        notes={order.notes}
      />
    </div>
  );
}
