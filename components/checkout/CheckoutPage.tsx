"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaArrowLeft, FaLock, FaMobileScreenButton, FaTruck, FaWhatsapp } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loading } from "@/components/shared/Loading";
import EmptyCart from "@/components/cart/EmptyCart";
import { formatKES } from "@/lib/format";
import { MPESA_CONFIG, getMpesaNumberLabel } from "@/lib/config/mpesa";
import { useCart } from "@/hooks/useCart";
import { storeOrderService } from "@/services/storefront/store-order.service";
import { accountService } from "@/services/storefront/account.service";
import { checkoutFormSchema, toCheckoutInput, type CheckoutFormValues } from "@/lib/validation/checkout";
import type { StorePaymentMethod } from "@/types/storefront/store-order";
import {
  buildWhatsAppOrderMessage,
  generateWhatsAppReference,
  openWhatsAppCheckout,
  type WhatsAppPreferredPayment,
} from "@/lib/storefront/whatsapp";

const EMPTY_VALUES: CheckoutFormValues = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "Kenya",
  saveToProfile: false,
};

type CheckoutSelection = StorePaymentMethod | "whatsapp";

const PAYMENT_OPTIONS: {
  value: CheckoutSelection;
  label: string;
  description: string;
  icon: typeof FaMobileScreenButton;
  requiresAccount: boolean;
}[] = [
  {
    value: "mpesa",
    label: "M-Pesa",
    description: "Place your order, then pay using the Paybill details we'll show you next.",
    icon: FaMobileScreenButton,
    requiresAccount: false,
  },
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
  const [paymentMethod, setPaymentMethod] = useState<CheckoutSelection>("cod");
  const [whatsappPreferredPayment, setWhatsappPreferredPayment] = useState<WhatsAppPreferredPayment>("cod");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isSignedIn = Boolean(session?.user?.id);
  const signInHref = `/account/sign-in?next=${encodeURIComponent(pathname || "/checkout")}`;
  const selectedOption = PAYMENT_OPTIONS.find((option) => option.value === paymentMethod);
  const needsSignIn = Boolean(selectedOption?.requiresAccount) && !isSignedIn && sessionStatus !== "loading";
  const isWhatsAppOrder = paymentMethod === "whatsapp";
  const isMpesaOrder = paymentMethod === "mpesa";

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: EMPTY_VALUES,
    mode: "onBlur",
  });

  const formValues = watch();

 useEffect(() => {
    if (sessionStatus !== "authenticated" || !session?.user?.id) return;

    let cancelled = false;

    accountService
      .me()
      .then((profile) => {
        if (cancelled) return;
        reset({
          name: profile.name ?? session.user?.name ?? "",
          email: profile.email ?? session.user?.email ?? "",
          phone: profile.phone ?? "",
          address: profile.address?.address ?? "",
          city: profile.address?.city ?? "",
          country: profile.address?.country ?? "Kenya",
          saveToProfile: false,
        });
      })
      .catch(() => {
       if (!cancelled) {
          setValue("name", session.user?.name ?? "");
          setValue("email", session.user?.email ?? "");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [sessionStatus, session?.user?.id]);

  const hasUnavailableItems = items.some((item) => item.unavailable);
  const hasStockIssue = items.some((item) => !item.unavailable && item.quantity > item.stock);
  const fullShippingAddress = [formValues.address, formValues.city, formValues.country]
    .filter(Boolean)
    .join(", ");

  const onSubmit = async (values: CheckoutFormValues) => {
    setFormError(null);

    if (hasUnavailableItems || hasStockIssue) {
      setFormError("Please resolve the issues in your cart before checking out.");
      return;
    }

    if (needsSignIn) {
      router.push(signInHref);
      return;
    }

    if (paymentMethod === "whatsapp") {
      setSubmitting(true);
      try {
        const message = buildWhatsAppOrderMessage({
          customer: { name: values.name, phone: values.phone, email: values.email, address: fullShippingAddress },
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
      const order = await storeOrderService.checkout(toCheckoutInput(values, paymentMethod));

      if (isSignedIn && values.saveToProfile) {
        try {
          await accountService.updateProfile({
            name: values.name,
            phone: values.phone,
            address: values.address,
            city: values.city,
            country: values.country,
          });
        } catch {
          toast.error("Order placed, but we couldn't save these details to your profile.");
        }
      }

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

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" {...register("name")} placeholder="John Doe" />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="justify-between">
                  <span>Email</span>
                  {isSignedIn && (
                    <span className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground">
                      <FaLock className="h-3 w-3" />
                      Locked
                    </span>
                  )}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  // Read-only for authenticated customers: the account's
                  // email is the only source of truth for it, and it can
                  // only be changed through the sign-in provider — never
                  // from this form. Disabling here is a UX cue only; the
                  // server independently re-pins the email for signed-in
                  // customers regardless of what this input contains.
                  disabled={isSignedIn}
                  readOnly={isSignedIn}
                  {...register("email")}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" placeholder="07XX XXX XXX" {...register("phone")} />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
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
                <Input id="address" placeholder="Street, building, apartment" {...register("address")} />
                {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="Nairobi" {...register("city")} />
                {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="country">Country</Label>
                <Input id="country" placeholder="Kenya" {...register("country")} />
                {errors.country && <p className="text-xs text-destructive">{errors.country.message}</p>}
              </div>

              {isSignedIn && (
                <label htmlFor="saveToProfile" className="flex cursor-pointer items-start gap-2 sm:col-span-2">
                  <Checkbox
                    id="saveToProfile"
                    checked={Boolean(formValues.saveToProfile)}
                    onCheckedChange={(checked) => setValue("saveToProfile", checked === true)}
                    className="mt-0.5"
                  />
                  <span className="text-sm text-muted-foreground">Save updated details to my profile</span>
                </label>
              )}
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

              {isMpesaOrder && (
                <div className="mt-4 space-y-3 rounded-lg border border-success/20 bg-success/[0.03] p-4">
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground"
                    >
                      <FaMobileScreenButton className="h-4.5 w-4.5" />
                    </span>
                    <div className="min-w-0 space-y-1">
                      <h3 className="text-sm font-semibold text-foreground">Pay with M-Pesa</h3>
                      <p className="text-xs text-muted-foreground">
                        Select M-Pesa and place your order first. After your order is created, we&apos;ll show your{" "}
                        {getMpesaNumberLabel(MPESA_CONFIG.type).toLowerCase()}, order number, and exact amount to
                        pay.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm">
                    <span className="text-muted-foreground">{getMpesaNumberLabel(MPESA_CONFIG.type)}</span>
                    <span className="font-mono font-semibold text-foreground">{MPESA_CONFIG.businessNumber}</span>
                  </div>
                </div>
              )}

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
                : needsSignIn
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