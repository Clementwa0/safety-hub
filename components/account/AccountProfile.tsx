"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { Check } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { accountService } from "@/services/account.service";
import type { AccountMe } from "@/types/account";

export default function AccountProfile() {
  const { status } = useSession();
  const [profile, setProfile] = useState<AccountMe | null>(null);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      .me()
      .then((result) => {
        if (!cancelled) {
          setProfile(result);
          setPhone(result.phone ?? "");
        }
      })
      .catch((caught) => {
        if (!cancelled) setError(caught instanceof Error ? caught.message : "Could not load your profile");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [status]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const updated = await accountService.updateProfile({ phone: phone.trim() });
      setProfile((prev) => (prev ? { ...prev, phone: updated.phone } : prev));
      setPhone(updated.phone ?? "");
      toast.success("Profile updated");
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not update your profile");
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="space-y-6">
        <div className="h-9 w-40 animate-pulse rounded-xl bg-muted" />
        <div className="rounded-2xl border border-border bg-white p-8 shadow-[var(--shadow-soft)]">
          <div className="h-24 animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="rounded-2xl border border-border bg-white p-10 text-center shadow-[var(--shadow-soft)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Login required</p>
        <h1 className="mt-4 text-2xl font-semibold text-foreground sm:text-3xl">Sign in to manage your profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your email and name are managed by your sign-in provider.
        </p>
        <Button onClick={() => signIn("google", { callbackUrl: "/account/profile" })} className="mt-8 rounded-xl px-6 py-3">
          Sign in with Google
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Email is managed by your sign-in provider and cannot be changed here.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">{error}</div>
      ) : (
        <form
          className="space-y-8 rounded-2xl border border-border bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-background p-6 sm:flex-row sm:items-center">
            <Avatar className="size-16">
              {profile?.image ? (
                <AvatarImage src={profile.image} alt={profile.name ?? "Account avatar"} />
              ) : (
                <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                  {(profile?.name ?? "").split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "ME"}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="text-center sm:text-left">
              <p className="text-base font-semibold text-foreground">{profile?.name ?? "Customer"}</p>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={profile?.name ?? ""} readOnly className="h-11 rounded-xl bg-muted text-muted-foreground" />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile?.email ?? ""} readOnly className="h-11 rounded-xl bg-muted text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Email managed by your sign-in provider.</p>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11 rounded-xl"
                placeholder="Enter phone number"
              />
              <p className="text-xs text-muted-foreground">Used for delivery updates.</p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving} className="h-11 rounded-xl px-6 font-semibold">
              <Check className="h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
