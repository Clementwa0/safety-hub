"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { Package, Clock, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountSummaryCard } from "@/components/account/AccountSummaryCard";
import { RecentOrders } from "@/components/account/RecentOrders";
import { accountService } from "@/services/storefront/account.service";
import type { AccountOverview } from "@/types/storefront/account";

function OverviewSkeleton() {
  return (
    <div className="space-y-8" aria-hidden>
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-64 rounded-full" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}

export default function AccountOverviewPage() {
  const { data: session, status } = useSession();
  const [overview, setOverview] = useState<AccountOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    accountService
      .overview()
      .then((result) => {
        if (!cancelled) setOverview(result);
      })
      .catch((caught) => {
        if (!cancelled) setError(caught instanceof Error ? caught.message : "Could not load your account");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [status]);

  const firstName = session?.user?.name?.split(" ")[0];

  if (status === "loading" || loading) {
    return (
      <div>
        <Skeleton className="h-9 w-72 rounded-full" />
        <Skeleton className="mt-2 h-5 w-56 rounded-full" />
        <div className="mt-8">
          <OverviewSkeleton />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="rounded-2xl border border-border bg-white p-10 text-center shadow-[var(--shadow-soft)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Account required</p>
        <h1 className="mt-4 text-2xl font-semibold text-foreground sm:text-3xl">Sign in to view your dashboard</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          Visit your orders, profile, and account summary after signing in.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => signIn("google", { callbackUrl: "/account" })} className="rounded-xl px-6 py-3">
            Sign in with Google
          </Button>
          <Link
            href="/account/sign-in"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            More sign-in options
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Dashboard</p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
            Welcome back, {firstName ?? "Customer"} <span aria-hidden>👋</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Here&apos;s your order summary.</p>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
        >
          Continue Shopping
        </Link>
      </div>

      {error ? (
        <div className="mt-8 rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <AccountSummaryCard
              icon={<Package className="h-5 w-5" />}
              label="Total Orders"
              value={overview?.orderCount ?? 0}
              description="All orders placed through your account."
            />
            <AccountSummaryCard
              icon={<Clock className="h-5 w-5" />}
              label="Pending Orders"
              value={overview?.pendingOrders ?? 0}
              description="Orders that are still being processed."
            />
            <AccountSummaryCard
              icon={<CheckCircle2 className="h-5 w-5" />}
              label="Completed Orders"
              value={overview?.completedOrders ?? 0}
              description="Orders that have been delivered successfully."
            />
          </div>

          <div className="mt-10">
            <RecentOrders orders={overview?.recentOrders ?? []} />
          </div>
        </>
      )}
    </div>
  );
}
