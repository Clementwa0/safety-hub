"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useCustomerSession } from "@/hooks/use-customer-session";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Home, Package, User, MapPin, LogOut } from "lucide-react";

interface AccountSidebarProps {
  onNavigate?: () => void;
}

const navItems = [
  { label: "Overview", href: "/account", icon: Home },
  { label: "Orders", href: "/account/orders", icon: Package },
  { label: "Addresses", href: "/account/addresses", icon: MapPin },
  { label: "Profile", href: "/account/profile", icon: User },
];

export function AccountSidebarContent({ onNavigate }: AccountSidebarProps) {
  const pathname = usePathname();
  const { data: session, status } = useCustomerSession();
  const signedIn = status === "authenticated" && !!session?.user;
  const name = session?.user?.name ?? "Customer";
  const email = session?.user?.email ?? "No email available";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isActive = (href: string) => {
    if (href === "/account") {
      return pathname === "/account";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-full max-h-[calc(100vh-8rem)] flex-col overflow-y-auto rounded-3xl border border-border bg-white shadow-[var(--shadow-card)]">
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-3">
          <Avatar className="size-14 ring-2 ring-border">
            {session?.user?.image ? (
              <AvatarImage src={session.user.image} alt={name} />
            ) : (
              <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                {initials || "ME"}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{name}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
        </div>

        <nav className="space-y-1" aria-label="Account navigation">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                  active
                    ? "bg-[#EFF6FF] text-[#2563EB]"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? "text-[#2563EB]" : "text-muted-foreground"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-border p-4">
        {signedIn ? (
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/5 hover:text-destructive"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        ) : (
          <Link
            href="/account/sign-in"
            className="flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            Sign in
          </Link>
        )}
      </div>
    </div>
  );
}
