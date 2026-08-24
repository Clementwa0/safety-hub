"use client";

import { useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useCustomerSession } from "@/hooks/use-customer-session";
import {
  FaArrowRight,
  FaCircleCheck,
  FaEnvelope,
  FaGoogle,
  FaShieldHalved,
  FaXmark,
} from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { accountService } from "@/services/storefront/account.service";
import type { StoreOrder } from "@/types/storefront/store-order";

interface SaveOrderPromptProps {
  order: StoreOrder;
}

export default function SaveOrderPrompt({
  order,
}: SaveOrderPromptProps) {
  const { data: session, status } = useCustomerSession();

  const [dismissed, setDismissed] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const hasLinkedRef = useRef(false);

  const callbackUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `/checkout/success?order=${order.orderNumber}`;

  /*
   * Link existing guest orders after authentication.
   */
  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user?.id &&
      !hasLinkedRef.current
    ) {
      hasLinkedRef.current = true;

      void accountService.linkGuestOrders().catch(() => {
        // Best-effort linking.
      });
    }
  }, [status, session?.user?.id]);

  if (dismissed) {
    return null;
  }

  /*
   * Authenticated customer
   */
  if (status === "authenticated") {
    return (
      <Card className="h-full w-full overflow-hidden border-secondary/30 bg-gradient-to-br from-secondary/[0.08] via-background to-background shadow-sm">
        <CardContent className="flex h-full min-h-[180px] items-center p-4 sm:p-5">
          <div className="flex w-full items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/10 ring-4 ring-secondary/[0.05]">
              <FaCircleCheck className="h-4 w-4 text-secondary" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-secondary">
                  Order saved
                </p>

                <span className="h-1 w-1 rounded-full bg-secondary" />
              </div>

              <h3 className="mt-1 text-lg font-bold tracking-tight text-foreground">
                Your order is safely saved
              </h3>

              <p className="mt-1.5 text-xs leading-5 text-muted-foreground sm:text-sm">
                Order{" "}
                <span className="font-semibold text-foreground">
                  #{order.orderNumber}
                </span>{" "}
                is now linked to your account.
              </p>

              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-2.5 py-1 text-[10px] font-medium text-secondary">
                <FaCircleCheck className="h-2.5 w-2.5" />
                Available in My Orders
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  async function handleGoogle() {
    await signIn(
      "google",
      {
        callbackUrl,
      },
      {
        login_hint: order.customer.email,
      },
    );
  }

  async function handleEmail() {
    if (!order.customer.email) {
      return;
    }

    setEmailSending(true);

    try {
      const result = await signIn("nodemailer", {
        email: order.customer.email,
        callbackUrl,
        redirect: false,
      });

      if (!result?.error) {
        setEmailSent(true);
      }
    } finally {
      setEmailSending(false);
    }
  }

  return (
    <Card className="group relative h-full w-full overflow-hidden border-primary/15 bg-gradient-to-br from-primary/[0.06] via-background to-secondary/[0.04] shadow-sm transition-shadow duration-300 hover:shadow-md">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/[0.07] blur-2xl" />

      <div className="pointer-events-none absolute -bottom-16 -left-12 h-32 w-32 rounded-full bg-secondary/[0.06] blur-2xl" />

      <CardContent className="relative flex h-full flex-col p-4 sm:p-5">
        {/* Dismiss */}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss save order prompt"
          className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-all hover:bg-background hover:text-foreground hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <FaXmark className="h-3.5 w-3.5" />
        </button>

        {/* =====================================================
            HEADER
        ===================================================== */}
        <div className="pr-7">
          <div className="flex items-center gap-2">
            {/* Icon */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm ring-4 ring-primary/[0.08]">
              <FaShieldHalved className="h-4 w-4" />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                Save your order
              </p>

              <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
                Quick & secure
              </p>
            </div>
          </div>

          <h2 className="mt-3 text-lg font-bold tracking-tight text-foreground sm:text-xl">
            Never lose track of your order.
          </h2>

          <p className="mt-1.5 max-w-md text-xs leading-5 text-muted-foreground sm:text-sm">
            Create an account or sign in to keep your order history,
            track deliveries, and checkout faster next time.
          </p>
        </div>

        {/* =====================================================
            ORDER EMAIL
        ===================================================== */}
        <div className="mt-3 rounded-xl border border-primary/10 bg-background/80 p-3 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Order email
              </p>

              <p className="mt-1 truncate text-xs font-semibold text-foreground sm:text-sm">
                {order.customer.email || "No email provided"}
              </p>
            </div>

            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary/10">
              <FaEnvelope className="h-3 w-3 text-secondary" />
            </div>
          </div>
        </div>

        {/* =====================================================
            BENEFITS
        ===================================================== */}
        <div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-3">
          <div className="flex items-center gap-1.5">
            <FaCircleCheck className="h-3 w-3 shrink-0 text-secondary" />

            <span className="text-[10px] font-medium text-muted-foreground sm:text-[11px]">
              Track orders
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <FaCircleCheck className="h-3 w-3 shrink-0 text-secondary" />

            <span className="text-[10px] font-medium text-muted-foreground sm:text-[11px]">
              Order history
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <FaCircleCheck className="h-3 w-3 shrink-0 text-secondary" />

            <span className="text-[10px] font-medium text-muted-foreground sm:text-[11px]">
              Faster checkout
            </span>
          </div>
        </div>

        {/* =====================================================
            AUTHENTICATION
        ===================================================== */}
        <div className="mt-4">
          {emailSent ? (
            <div className="rounded-xl border border-secondary/25 bg-secondary/[0.06] p-3">
              <div className="flex items-start gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/10">
                  <FaEnvelope className="h-3.5 w-3.5 text-secondary" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground sm:text-sm">
                    Check your email
                  </p>

                  <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground sm:text-xs">
                    We sent a secure sign-in link to{" "}
                    <span className="font-semibold text-foreground">
                      {order.customer.email}
                    </span>
                    .
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 w-full justify-center gap-2 rounded-lg border-border bg-background text-xs font-semibold shadow-sm transition-all hover:border-primary/30 hover:bg-muted/50 sm:h-10 sm:text-sm"
                onClick={handleGoogle}
              >
                <FaGoogle className="h-3.5 w-3.5" />
                Continue with Google
              </Button>

              <Button
                type="button"
                variant="default"
                className="h-9 w-full justify-center gap-2 rounded-lg bg-primary text-xs font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:h-10 sm:text-sm"
                onClick={handleEmail}
                disabled={emailSending || !order.customer.email}
              >
                <FaEnvelope className="h-3.5 w-3.5" />

                {emailSending
                  ? "Sending sign-in link..."
                  : "Save with email"}

                {!emailSending && (
                  <FaArrowRight className="ml-0.5 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-center gap-1.5">
          <FaShieldHalved className="h-2.5 w-2.5 text-muted-foreground" />

          <p className="text-[9px] leading-4 text-muted-foreground">
            Secure account • Optional • Your order remains valid
          </p>
        </div>
      </CardContent>
    </Card>
  );
}