"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { FaGoogle, FaEnvelope } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("next") || "/account/orders";

  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    setError(null);
    await signIn("google", { callbackUrl });
  }

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const result = await signIn("nodemailer", {
        email: email.trim(),
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setError("Couldn't send the sign-in link. Please try again.");
      } else {
        setEmailSent(true);
      }
    } catch {
      setError("Couldn't send the sign-in link. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto flex max-w-md flex-col px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">Sign in</CardTitle>
          <CardDescription>
            Track your orders across devices. Guest checkout still works without an account.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-center gap-2"
            onClick={handleGoogleSignIn}
          >
            <FaGoogle className="h-4 w-4" />
            Continue with Google
          </Button>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs uppercase tracking-wide text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>

          {emailSent ? (
            <div className="rounded-lg bg-secondary/10 p-4 text-center text-sm text-foreground">
              <FaEnvelope className="mx-auto mb-2 h-5 w-5 text-secondary" />
              Check <span className="font-medium">{email}</span> for a sign-in link.
            </div>
          ) : (
            <form onSubmit={handleEmailSignIn} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="email">Continue with email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" variant="secondary" className="w-full" disabled={submitting}>
                {submitting ? "Sending..." : "Send sign-in link"}
              </Button>
            </form>
          )}

          <p className="text-center text-xs text-muted-foreground">
            No password needed — we&apos;ll email you a one-click sign-in link.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
