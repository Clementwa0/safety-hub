"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AUTH } from "@/lib/routes";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const result = await signIn("sentinel-credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        setError("Invalid email or password");
        return;
      }

      router.replace(AUTH.SENTINEL_ROOT);
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Sign-in failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-primary/10 via-primary/5 to-background p-12">
        <div>
          <div className="mb-12 flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5">
              <ShieldCheck className="h-7 w-7 text-primary" />
            </div>

            <div>
              <span className="text-xl font-bold tracking-tight">
                Sentinel
              </span>

              <p className="text-sm text-muted-foreground">
                HSE Hub Limited
              </p>
            </div>
          </div>

          <div className="max-w-md space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">
              Manage your PPE business from one dashboard.
            </h2>

            <p className="text-muted-foreground">
              Inventory, quotations, customers, suppliers, reports,
              analytics, and orders—all in one secure platform.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span>✓ Product Management</span>
          <span>✓ Inventory Tracking</span>
          <span>✓ Customer CRM</span>
          <span>✓ Quotations & Orders</span>
          <span className="col-span-2">
            ✓ Sales Analytics & Reporting
          </span>
        </div>
      </div>

      {/* Login form */}
      <div className="flex flex-1 items-center justify-center p-6 md:p-10">
        <Card className="w-full max-w-sm border shadow-sm">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">
              Welcome back
            </CardTitle>

            <CardDescription>
              Sign in to your Sentinel account.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>

                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>

                  <Link
                    href="/forgot-password"
                    className="text-xs text-muted-foreground transition-colors hover:text-primary"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="pr-10"
                  />

                  <button
                    type="button"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    onClick={() =>
                      setShowPassword((value) => !value)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2">
                <Checkbox id="remember" />

                <Label
                  htmlFor="remember"
                  className="cursor-pointer text-sm font-normal"
                >
                  Remember me
                </Label>
              </div>

              {/* Error */}
              {error && (
                <p
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {error}
                </p>
              )}

              {/* Submit */}
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Need help?{" "}
              <Link
                href="/contact"
                className="font-medium text-primary hover:underline"
              >
                Contact support
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}