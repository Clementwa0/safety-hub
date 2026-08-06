"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { FaArrowLeft, FaLock, FaMobileScreenButton, FaTruck, FaWhatsapp } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loading } from "@/components/shared/Loading";
import EmptyCart from "@/components/cart/EmptyCart";
import { formatKES } from "@/lib/format";
import { useCart } from "@/hooks/useCart";
import { storeOrderService } from "@/services/store-order.service";
import type { StorePaymentMethod } from "@/types/store-order";
import {
  buildWhatsAppOrderMessage,
  generateWhatsAppReference,
  openWhatsAppCheckout,
  type WhatsAppPreferredPayment,
} from "@/lib/storefront/whatsapp";

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


type CheckoutSelection = StorePaymentMethod | "whatsapp";

const PAYMENT_OPTIONS: {
  value: CheckoutSelection;
  label: string;
  description: string;
  icon: typeof FaMobileScreenButton;
  requiresAccount: boolean;
}[] = [
 /**  {
    value: "mpesa",
    label: "M-Pesa",
    description: "Pay instantly with a Safaricom M-Pesa STK push. Requires an account.",
    icon: FaMobileScreenButton,
    requiresAccount: true,
  },
  
  */
  {
    value: "cod",
    label: "Cash on Delivery",
    description: "Pay in cash when your order arrives.",
    icon: FaTruck,
    requiresAccount: false,
  },
  {
    value: "whatsapp",
    label: "Order via WhatsApp",
    description: "Chat with our team to confirm availability and payment — no order is placed here.",
    icon: FaWhatsapp,
    requiresAccount: false,
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status: sessionStatus } = useSession();
  const { items, itemCount, subtotal, shippingFee, tax, total, loading, refresh } = useCart();
  const [form, setForm] = useState<CheckoutFormState>(INITIAL_FORM);
  const [paymentMethod, setPaymentMethod] = useState<CheckoutSelection>("cod");
  const [whatsappPreferredPayment, setWhatsappPreferredPayment] = useState<WhatsAppPreferredPayment>("cod");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isSignedIn = Boolean(session?.user?.id);
  const signInHref = `/account/sign-in?next=${encodeURIComponent(pathname || "/checkout")}`;
  const needsSignInForMpesa = paymentMethod === "mpesa" && !isSignedIn;
  const isWhatsAppOrder = paymentMethod === "whatsapp";

  const update =
    (field: keyof CheckoutFormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const hasUnavailableItems = items.some((item) => item.unavailable);
  const hasStockIssue = items.some((item) => !item.unavailable && item.quantity > item.stock);
  const fullShippingAddress = [form.address, form.city, form.country].filter(Boolean).join(", ");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (hasUnavailableItems || hasStockIssue) {
      setFormError("Please resolve the issues in your cart before checking out.");
      return;
    }

    // M-Pesa payments require a signed-in account. Rather than letting the
    // request round-trip to the server just to be rejected, send the
    // shopper to sign in first and bring them straight back here.
    if (needsSignInForMpesa) {
      router.push(signInHref);
      return;
    }

    // WhatsApp Checkout never touches the order-creation API — it's a
    // parallel channel that hands the customer off to a human in chat.
    // Everything they've typed into the form above still gets used, just
    // to build the message instead of a `StoreOrder`. Checking
    // `paymentMethod` directly (not the `isWhatsAppOrder` bool) so
    // TypeScript narrows it to `StorePaymentMethod` for the checkout()
    // call below, once this branch has returned.
    if (paymentMethod === "whatsapp") {
      setSubmitting(true);
      try {
        const message = buildWhatsAppOrderMessage({
          customer: { name: form.name, phone: form.phone, email: form.email, address: fullShippingAddress },
          items: items.map((item) => ({ name: item.name, quantity: item.quantity, lineTotal: item.subtotal })),
          totals: { subtotal, shippingFee, tax, total },
          preferredPayment: whatsappPreferredPayment,
          reference: generateWhatsAppReference(),
        });

        const result = openWhatsAppCheckout(message);
        if (!result.ok) {
          setFormError(result.error);
          toast.error(result.error);
          return;
        }

        toast.success("Opening WhatsApp — your cart is still saved here.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setSubmitting(true);
    try {
      const order = await storeOrderService.checkout({
        customer: { name: form.name, email: form.email, phone: form.phone },
        shippingAddress: { address: form.address, city: form.city, country: form.country },
        paymentMethod,
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

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value as CheckoutSelection)}
                className="gap-3"
              >
                {PAYMENT_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const locked = option.requiresAccount && !isSignedIn && sessionStatus !== "loading";

                  return (
                    <Label
                      key={option.value}
                      htmlFor={`payment-${option.value}`}
                      className="flex cursor-pointer items-start gap-3 rounded-lg border border-input p-3 has-[[data-checked]]:border-secondary has-[[data-checked]]:bg-secondary/5"
                    >
                      <RadioGroupItem value={option.value} id={`payment-${option.value}`} className="mt-1" />
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1">
                        <span className="block text-sm font-medium text-foreground">{option.label}</span>
                        <span className="block text-xs text-muted-foreground">{option.description}</span>
                        {locked && (
                          <span className="mt-1 block text-xs font-medium text-secondary">
                            You&apos;ll be asked to sign in before this order is placed.
                          </span>
                        )}
                      </span>
                    </Label>
                  );
                })}
              </RadioGroup>

              {/* {/needsSignInForMpesa && ( 
                <div className="mt-4 rounded-md bg-secondary/10 p-3 text-xs text-foreground">
                  <p>M-Pesa payments require an account so we can send your payment prompt and receipt.</p>
                  <Link href={signInHref} className="mt-2 inline-block font-medium text-secondary underline">
                    Sign in to continue with M-Pesa
                  </Link>
                </div>
              )}*/}

              {isWhatsAppOrder && (
                <div className="mt-4 space-y-2 rounded-md bg-green-600/5 p-3">
                  <Label className="text-xs font-medium text-foreground">
                    Preferred payment to mention in the chat
                  </Label>
                  <RadioGroup
                    value={whatsappPreferredPayment}
                    onValueChange={(value) => setWhatsappPreferredPayment(value as WhatsAppPreferredPayment)}
                    className="flex gap-4"
                  >
                    <Label
                      htmlFor="wa-pref-cod"
                      className="flex cursor-pointer items-center gap-2 text-sm font-normal text-foreground"
                    >
                      <RadioGroupItem value="cod" id="wa-pref-cod" />
                      Cash on Delivery
                    </Label>
                    <Label
                      htmlFor="wa-pref-mpesa"
                      className="flex cursor-pointer items-center gap-2 text-sm font-normal text-foreground"
                    >
                      <RadioGroupItem value="mpesa" id="wa-pref-mpesa" />
                      M-Pesa
                    </Label>
                  </RadioGroup>
                  <p className="text-xs text-muted-foreground">
                    No order is placed yet — our team will confirm this with you on WhatsApp.
                  </p>
                </div>
              )}
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
              className={`w-full gap-2 ${isWhatsAppOrder ? "bg-green-600 hover:bg-green-700" : ""}`}
              disabled={submitting || hasUnavailableItems || hasStockIssue}
            >
              {isWhatsAppOrder ? <FaWhatsapp className="h-4 w-4" /> : <FaLock className="h-4 w-4" />}
              {submitting
                ? isWhatsAppOrder
                  ? "Opening WhatsApp..."
                  : "Placing Order..."
                : needsSignInForMpesa
                  ? "Sign In to Continue"
                  : isWhatsAppOrder
                    ? "Continue on WhatsApp"
                    : "Place Order"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
