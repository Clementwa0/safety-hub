"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { orderService } from "@/services/sentinel/order.service";
import { ORDER_STATUSES, type Order, type OrderInput, type OrderStatus } from "@/types/sentinel/order";
import type { Customer, LineItem } from "@/types/sentinel/sales";
import { createLineItem } from "@/lib/sales";
import { settingsService } from "@/services/sentinel/settings.service";
import CustomerFields from "@/components/sentinel/sales/CustomerFields";
import LineItemsEditor from "@/components/sentinel/sales/LineItemsEditor";

const EMPTY_CUSTOMER: Customer = { name: "" };

// True for a line item that still matches createLineItem()'s blank
// defaults (minus id/taxRate) - i.e. the staffer hasn't touched it yet, so
// it's safe to swap in the real admin-configured tax rate once it loads.
function isUntouchedLineItem(item: LineItem): boolean {
  return (
    !item.productId &&
    item.name === "" &&
    item.description === "" &&
    item.quantity === 1 &&
    item.unitPrice === 0 &&
    item.discount === 0
  );
}

interface OrderFormProps {
  order?: Order;
}

export default function OrderForm({ order }: OrderFormProps) {
  const router = useRouter();
  const itemsLocked = order?.status === "shipped" || order?.status === "delivered";

  const [customer, setCustomer] = useState<Customer>(
    order?.customer ?? EMPTY_CUSTOMER,
  );
  const [items, setItems] = useState<LineItem[]>(
    order?.items ?? [createLineItem()],
  );
  const [status, setStatus] = useState<OrderStatus>(order?.status ?? "pending");
  const [notes, setNotes] = useState(order?.notes ?? "");
  const [errors, setErrors] = useState<{ customer?: string; items?: string }>({});
  const [saving, setSaving] = useState(false);

  // For a brand-new order, the pre-populated first row above was created
  // before the real Settings.taxRate could be fetched. Swap it in once
  // loaded - but only while that row is still untouched, so it never
  // overwrites something the staffer already edited.
  useEffect(() => {
    if (order) return;

    let mounted = true;

    settingsService
      .get()
      .then((settings) => {
        if (!mounted) return;
        setItems((prev) =>
          prev.length === 1 && isUntouchedLineItem(prev[0])
            ? [{ ...prev[0], taxRate: settings.taxRate }]
            : prev,
        );
      })
      .catch(() => {
        // Fetch failed - the pre-populated row just keeps its fallback rate.
      });

    return () => {
      mounted = false;
    };
  }, [order]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: typeof errors = {};

    if (!customer.name.trim()) nextErrors.customer = "Customer name is required";
    if (items.length === 0 || items.every((item) => !item.name.trim())) {
      nextErrors.items = "Add at least one line item";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    const payload: OrderInput = {
      customer,
      items: items.filter((item) => item.name.trim()),
      status,
      notes: notes.trim() || undefined,
    };

    setSaving(true);
    try {
      if (order) {
        await orderService.update(order.id, payload);
        toast.success("Order updated");
      } else {
        await orderService.create(payload);
        toast.success("Order created");
      }
      router.push("/sentinel/orders");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save the order",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer</CardTitle>
          <CardDescription>Who is this order for?</CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerFields
            value={customer}
            onChange={setCustomer}
            errors={errors.customer ? { name: errors.customer } : undefined}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
          <CardDescription>
            {itemsLocked
              ? "Shipped and delivered order items are locked to preserve the commercial record."
              : "Products included in this order. Totals include tax and discounts."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <fieldset disabled={itemsLocked} aria-describedby={itemsLocked ? "order-items-locked" : undefined}>
            <LineItemsEditor items={items} onChange={setItems} error={errors.items} />
          </fieldset>
          {itemsLocked ? (
            <p id="order-items-locked" className="mt-3 text-sm text-muted-foreground">
              To correct a shipped order, create the appropriate follow-up document rather than changing its original items.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fulfilment</CardTitle>
          <CardDescription>Status and internal notes.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(value) => {
                if (typeof value === "string") setStatus(value as OrderStatus);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
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
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="order-notes">Notes (optional)</Label>
            <Textarea
              id="order-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Delivery instructions or internal notes"
            />
          </div>
        </CardContent>
      </Card>

      {/* Action buttons – responsive stacking */}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto"
        >
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {order ? "Save changes" : "Create order"}
        </Button>
      </div>
    </form>
  );
}
