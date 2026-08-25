"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  ArrowRight,
  Package,
  Users,
  FileText,
  BarChart3,
  Truck,
  Settings2,
} from "lucide-react";

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
import { cn } from "@/lib/utils";
import Image from "next/image";
import logo from "@/public/logo.png";
export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await signIn("sentinel-credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        setError("Invalid email or password. Please try again.");
        return;
      }

      router.replace(AUTH.SENTINEL_ROOT);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Package, label: "Product Management" },
    { icon: Truck, label: "Inventory Tracking" },
    { icon: Users, label: "Customer CRM" },
    { icon: FileText, label: "Quotations & Orders" },
    { icon: BarChart3, label: "Sales Analytics" },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Login form - Full width on mobile */}
      <div className="flex flex-1 items-center justify-center p-4 sm:p-6 md:p-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div>
              <p className="text-xs text-muted-foreground text-center">
                HSE Hub Limited
              </p>
            </div>
          </div>

          <Card className="border-0 shadow-2xl shadow-primary/5 lg:shadow-xl">
            <CardHeader className="space-y-2 text-center pb-6">
              <div className="mx-auto rounded-full bg-primary/10 p-3 w-fit">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">
                Welcome back
              </CardTitle>
              <CardDescription className="text-sm">
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                    disabled={loading}
                    className={cn(
                      "h-11 rounded-xl border-muted-foreground/20 bg-white/50 backdrop-blur-sm transition-all duration-200",
                      "focus:border-primary focus:ring-2 focus:ring-primary/20",
                      "hover:border-primary/40",
                      error &&
                        "border-destructive focus:border-destructive focus:ring-destructive/20",
                    )}
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError(null);
                      }}
                      disabled={loading}
                      className={cn(
                        "h-11 rounded-xl border-muted-foreground/20 bg-white/50 backdrop-blur-sm pr-10 transition-all duration-200",
                        "focus:border-primary focus:ring-2 focus:ring-primary/20",
                        "hover:border-primary/40",
                        error &&
                          "border-destructive focus:border-destructive focus:ring-destructive/20",
                      )}
                    />

                    <button
                      type="button"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-all duration-200 hover:text-primary hover:scale-110"
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) =>
                        setRememberMe(checked as boolean)
                      }
                      className="border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label
                      htmlFor="remember"
                      className="cursor-pointer text-sm font-normal text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Remember me
                    </Label>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3">
                    <p
                      role="alert"
                      className="text-sm text-destructive flex items-center gap-2"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                      {error}
                    </p>
                  </div>
                )}

                {/* Submit button */}
                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 transition-all duration-200 shadow-lg shadow-primary/25 hover:shadow-primary/35"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </form>

              {/* Footer */}
              <div className="mt-6 text-center text-sm text-muted-foreground space-y-1">
                <p>
                  Need help?{" "}
                  <Link
                    href="/contact"
                    className="font-medium text-primary hover:underline hover:text-primary/80 transition-colors"
                  >
                    Contact support
                  </Link>
                </p>
                <p className="text-xs text-muted-foreground/60">
                  HSE Hub Limited © {new Date().getFullYear()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
