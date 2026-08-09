"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { FaGoogle, FaFacebook, FaEnvelope, FaCircleCheck, FaTriangleExclamation } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { COMPANY } from "@/lib/constants";
import { getSafeCallbackUrl } from "@/lib/storefront/safe-redirect";

const DEFAULT_CALLBACK_URL = "/account";

// NextAuth redirects back here with `?error=...` on a failed sign-in (e.g.
// an OAuth account that's already linked with a different provider, or the
// customer cancelling the Google/Facebook consent screen). Map the codes
// worth explaining to something a customer will understand; anything else
// falls back to a generic message.
const ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked:
    "That email is already registered with a different sign-in method. Try the method you used originally.",
  AccessDenied: "Sign-in was cancelled.",
  Verification: "That sign-in link is invalid or has expired. Request a new one below.",
};

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();

  const callbackUrl = getSafeCallbackUrl(searchParams.get("next"), DEFAULT_CALLBACK_URL);
  const errorCode = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

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

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmailError(null);
    setEmailSending(true);

    try {
      const result = await signIn("nodemailer", {
        email,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setEmailError("Couldn't send that link. Check the address and try again.");
      } else {
        setEmailSent(true);
      }
    } finally {
      setEmailSending(false);
    }
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

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs font-medium uppercase text-muted-foreground">Or</span>
            <Separator className="flex-1" />
          </div>

          {emailSent ? (
            <div className="flex items-start gap-2 rounded-lg border border-secondary/30 bg-secondary/5 p-3 text-sm text-foreground">
              <FaCircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
              <p>
                Check <span className="font-medium">{email}</span> for a sign-in link.
              </p>
            </div>
          ) : (
            <form className="space-y-3" onSubmit={handleEmailSubmit}>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email / Magic Link</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              {emailError && <p className="text-sm text-destructive">{emailError}</p>}

              <Button type="submit" variant="secondary" className="w-full gap-2" disabled={emailSending}>
                <FaEnvelope className="h-4 w-4" />
                {emailSending ? "Sending..." : "Send magic link"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
