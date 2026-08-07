"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutDashboard, Package, User, LogOut } from "lucide-react";

export default function AccountMenu() {
  const { data: session, status } = useSession();
  const signedIn = status === "authenticated" && !!session?.user;

  if (!signedIn) {
    return (
      <Button
        variant="outline"
        className="hidden h-10 rounded-full lg:inline-flex"
        onClick={() => signIn("google", { callbackUrl: "/account" })}
      >
        Sign in
      </Button>
    );
  }

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
    : "ME";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground transition hover:bg-secondary/10 lg:h-11 lg:w-11"
          aria-label="Open account menu"
        >
          <Avatar className="size-10">
            {session?.user?.image ? (
              <img src={session.user.image} alt={session.user.name ?? "Account avatar"} />
            ) : (
              <AvatarFallback>{initials}</AvatarFallback>
            )}
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-4 py-3">
          <p className="text-sm font-semibold text-foreground">{session?.user?.name}</p>
          <p className="mt-1 text-xs text-muted-foreground truncate">{session?.user?.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/account" className="flex items-center gap-2 w-full">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/account/orders" className="flex items-center gap-2 w-full">
            <Package className="h-4 w-4" />
            Orders
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/account/profile" className="flex items-center gap-2 w-full">
            <User className="h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-destructive transition hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
