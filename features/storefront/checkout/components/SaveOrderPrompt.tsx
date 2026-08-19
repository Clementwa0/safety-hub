import { useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useCustomerSession } from "@/hooks/use-customer-session";
import { FaGoogle, FaEnvelope, FaXmark, FaCircleCheck } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { accountService } from "@/services/storefront/account.service";
import type { StoreOrder } from "@/types/storefront/store-order";

interface SaveOrderPromptProps {
  order: StoreOrder;
}

export default function SaveOrderPrompt({ order }: SaveOrderPromptProps) {
  const { data: session, status } = useCustomerSession();
  const [dismissed, setDismissed] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const hasLinkedRef = useRef(false);

  const callbackUrl =
    typeof window !== "undefined" ? window.location.href : `/checkout/success?order=${order.orderNumber}`;

 
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id && !hasLinkedRef.current) {
      hasLinkedRef.current = true;
      void accountService.linkGuestOrders().catch(() => {
      });
    }
  }, [status, session?.user?.id]);

  if (dismissed) return null;

  if (status === "authenticated") {
    return (
      <Card className="mt-6 w-full border-secondary/30 bg-secondary/5">
        <CardContent className="flex items-center gap-3 p-4">
          <FaCircleCheck className="h-5 w-5 shrink-0 text-secondary" />
          <p className="text-sm text-foreground">
            This order is saved to your account — find it anytime under{" "}
            <span className="font-medium">My Orders</span>.
          </p>
        </CardContent>
      </Card>
    );
  }

  async function handleGoogle() {
    await signIn("google", { callbackUrl }, { login_hint: order.customer.email });
  }

  async function handleEmail() {
    setEmailSending(true);
    try {
      const result = await signIn("nodemailer", {
        email: order.customer.email,
        callbackUrl,
        redirect: false,
      });
      if (!result?.error) setEmailSent(true);
    } finally {
      setEmailSending(false);
    }
  }

  return (
    <Card className="mt-6 w-full">
      <CardContent className="relative space-y-3 p-5">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="absolute right-3 top-3 text-muted-foreground transition hover:text-foreground"
        >
          <FaXmark className="h-4 w-4" />
        </button>

        <div>
          <p className="font-semibold text-foreground">Save this order to an account</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Track it — and every future order — from any device. No re-typing needed.
          </p>
        </div>

        {emailSent ? (
          <p className="text-sm text-secondary">
            Check <span className="font-medium">{order.customer.email}</span> for a sign-in link.
          </p>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" variant="outline" className="gap-2" onClick={handleGoogle}>
              <FaGoogle className="h-4 w-4" />
              Continue with Google
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="gap-2"
              onClick={handleEmail}
              disabled={emailSending}
            >
              <FaEnvelope className="h-4 w-4" />
              {emailSending ? "Sending..." : `Email me a link (${order.customer.email})`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
