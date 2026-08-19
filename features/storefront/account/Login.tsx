"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { FaGoogle, FaFacebook, FaTriangleExclamation } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { COMPANY } from "@/lib/constants";
import { getSafeCallbackUrl } from "@/lib/storefront/safe-redirect";
import { useCustomerSession } from "@/hooks/use-customer-session";

const DEFAULT_CALLBACK_URL = "/account";

const ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked:
    "That email is already registered with a different sign-in method. Try the method you used originally.",
  AccessDenied: "Sign-in was cancelled.",
};

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useCustomerSession();

  const callbackUrl = getSafeCallbackUrl(searchParams.get("next"), DEFAULT_CALLBACK_URL);
  const errorCode = searchParams.get("error");

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [status, callbackUrl, router]);

  async function handleGoogle() {
    await signIn("google", { callbackUrl });
  }

  async function handleFacebook() {
    await signIn("facebook", { callbackUrl });
  }

  if (status === "authenticated") {
    return null;
  }

  return (
    <div className="relative flex min-h-[calc(100vh-12rem)] items-center justify-center px-4 py-12 overflow-hidden">
      {/* Decorative background – only visual, no interactive elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-30%] right-[-10%] h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[-30%] left-[-10%] h-[500px] w-[500px] rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <Card className="w-full max-w-md shadow-lg border-border/50 transition-shadow hover:shadow-xl">
        <CardHeader className="items-center text-center space-y-2 pb-6">
          <Link
            href="/"
            className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors"
          >
            {COMPANY.name}
          </Link>
          <CardTitle className="mt-1 text-2xl font-display">Sign in to your customer account</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Track orders, save addresses, and check out faster.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {errorCode && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <FaTriangleExclamation className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{ERROR_MESSAGES[errorCode] ?? "Something went wrong signing you in. Please try again."}</p>
            </div>
          )}

          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 h-11 transition-all hover:scale-[1.02] active:scale-[0.98]"
              onClick={handleGoogle}
            >
              <FaGoogle className="h-4 w-4" />
              Continue with Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 h-11 transition-all hover:scale-[1.02] active:scale-[0.98]"
              onClick={handleFacebook}
            >
              <FaFacebook className="h-4 w-4" />
              Continue with Facebook
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}