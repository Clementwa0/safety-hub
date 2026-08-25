"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useCustomerSession } from "@/hooks/use-customer-session";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  LayoutDashboard,
  LogOut,
  Package,
  User,
} from "lucide-react";

export default function AccountMenu() {
  const { data: session, status } = useCustomerSession();

  const signedIn = status === "authenticated" && !!session?.user;

  if (!signedIn) {
    return (
      <Button
        variant="outline"
        className="hidden h-10 rounded-sm lg:inline-flex"
        nativeButton={false}
        render={<Link href="/account/sign-in" />}
      >
        Sign in
      </Button>
    );
  }

  const name = session.user.name ?? "Me";

  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "ME";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-sm bg-muted text-foreground transition hover:bg-secondary/10 lg:h-11 lg:w-11"
        aria-label="Open account menu"
      >
        <Avatar className="size-10">
          {session.user.image ? (
            <img
              src={session.user.image}
              alt={`${name}'s avatar`}
              className="size-full object-cover"
            />
          ) : (
            <AvatarFallback>{initials}</AvatarFallback>
          )}
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <div className="px-4 py-3">
          <p className="text-sm font-semibold text-foreground">
            {session.user.name}
          </p>

          <p className="mt-1 truncate text-xs text-muted-foreground">
            {session.user.email}
          </p>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          nativeButton={false}
          render={
            <Link
              href="/account"
              className="flex w-full items-center gap-2"
            />
          }
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </DropdownMenuItem>

        <DropdownMenuItem
          nativeButton={false}
          render={
            <Link
              href="/account/orders"
              className="flex w-full items-center gap-2"
            />
          }
        >
          <Package className="h-4 w-4" />
          Orders
        </DropdownMenuItem>

        <DropdownMenuItem
          nativeButton={false}
          render={
            <Link
              href="/account/profile"
              className="flex w-full items-center gap-2"
            />
          }
        >
          <User className="h-4 w-4" />
          Profile
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}