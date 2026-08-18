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

  // Already signed in (e.g. followed a stale bookmark to this page) — send
  // them straight on rather than showing the sign-in form again.
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
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <Link href="/" className="text-lg font-bold text-primary">
            {COMPANY.name}
          </Link>
          <CardTitle className="mt-2 text-xl">Sign in to your customer account</CardTitle>
          <CardDescription>Track orders, save addresses, and check out faster.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {errorCode && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <FaTriangleExclamation className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{ERROR_MESSAGES[errorCode] ?? "Something went wrong signing you in. Please try again."}</p>
            </div>
          )}

          <div className="space-y-2">
            <Button type="button" variant="outline" className="w-full gap-2" onClick={handleGoogle}>
              <FaGoogle className="h-4 w-4" />
              Continue with Google
            </Button>
            <Button type="button" variant="outline" className="w-full gap-2" onClick={handleFacebook}>
              <FaFacebook className="h-4 w-4" />
              Continue with Facebook
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
