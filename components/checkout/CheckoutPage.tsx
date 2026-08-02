"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { FaArrowLeft, FaLock } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loading } from "@/components/shared/Loading";
import EmptyCart from "@/components/cart/EmptyCart";
import { formatKES } from "@/lib/format";
import { useCart } from "@/hooks/useCart";
import { storeOrderService } from "@/services/store-order.service";

interface CheckoutFormState {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

const INITIAL_FORM: CheckoutFormState = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "Kenya",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, itemCount, subtotal, shippingFee, tax, total, loading, refresh } = useCart();
  const [form, setForm] = useState<CheckoutFormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const update =
    (field: keyof CheckoutFormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const hasUnavailableItems = items.some((item) => item.unavailable);
  const hasStockIssue = items.some((item) => !item.unavailable && item.quantity > item.stock);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (hasUnavailableItems || hasStockIssue) {
      setFormError("Please resolve the issues in your cart before checking out.");
      return;
    }

    setSubmitting(true);
    try {
      const order = await storeOrderService.checkout({
        customer: { name: form.name, email: form.email, phone: form.phone },
        shippingAddress: { address: form.address, city: form.city, country: form.country },
      });

      await refresh();
      router.push(`/checkout/success?order=${order.orderNumber}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Checkout failed. Please try again.";
      setFormError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && items.length === 0) {
    return <Loading label="Loading your cart..." className="py-24" />;
  }

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <Link
        href="/cart"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-primary"
      >
        <FaArrowLeft className="h-4 w-4" />
        Back to Cart
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-foreground">Checkout</h1>

      <form onSubmit={(event) => void handleSubmit(event)} className="mt-6 grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" required value={form.name} onChange={update("name")} placeholder="John Doe" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={update("email")}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={update("phone")}
                  placeholder="07XX XXX XXX"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  required
                  value={form.address}
                  onChange={update("address")}
                  placeholder="Street, building, apartment"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" required value={form.city} onChange={update("city")} placeholder="Nairobi" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="country">Country</Label>
                <Input id="country" required value={form.country} onChange={update("country")} placeholder="Kenya" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit lg:sticky lg:top-[170px]">
          <CardHeader>
            <CardTitle className="text-lg">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatKES(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 font-medium">{formatKES(item.subtotal)}</p>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                <span className="font-medium">{formatKES(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">{shippingFee === 0 ? "Free" : formatKES(shippingFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">VAT (16%)</span>
                <span className="font-medium">{formatKES(tax)}</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span className="text-secondary">{formatKES(total)}</span>
            </div>

            {(hasUnavailableItems || hasStockIssue) && (
              <p className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">
                Some items in your cart need attention before you can check out. Please
                {" "}
                <Link href="/cart" className="underline">
                  review your cart
                </Link>
                .
              </p>
            )}

            {formError && !hasUnavailableItems && !hasStockIssue && (
              <p className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">{formError}</p>
            )}

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={submitting || hasUnavailableItems || hasStockIssue}
            >
              <FaLock className="h-4 w-4" />
              {submitting ? "Placing Order..." : "Place Order"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
