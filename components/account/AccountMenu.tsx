"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { FaUser } from "react-icons/fa6";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function initialsFor(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "";
  if (!source) return "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export default function AccountMenu() {
  const { data: session, status } = useSession();

  if (status !== "authenticated" || !session?.user) {
    return (
      <Link
        href="/account/sign-in"
        className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-muted"
        aria-label="Sign in"
      >
        <FaUser className="h-5 w-5 text-primary" />
      </Link>
    );
  }

  const { name, email, image } = session.user;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-muted"
        aria-label="Account menu"
      >
        <Avatar size="sm">
          {image && <AvatarImage src={image} alt={name ?? email ?? "Account"} />}
          <AvatarFallback>{initialsFor(name, email)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm font-medium text-foreground">{name || "My Account"}</p>
          {email && <p className="truncate text-xs text-muted-foreground">{email}</p>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/account/orders" />}>My Orders</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
