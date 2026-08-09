"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import CustomerFields from "@/components/sentinel/sales/CustomerFields";
import LineItemsEditor from "@/components/sentinel/sales/LineItemsEditor";
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

const EMPTY_CUSTOMER: Customer = { name: "" };

interface OrderFormProps {
  order?: Order;
}

export default function OrderForm({ order }: OrderFormProps) {
  const router = useRouter();

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
            Products included in this order. Totals include tax and discounts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LineItemsEditor items={items} onChange={setItems} error={errors.items} />
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

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {order ? "Save changes" : "Create order"}
        </Button>
      </div>
    </form>
  );
}
