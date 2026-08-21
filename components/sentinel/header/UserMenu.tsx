"use client";

import { ChevronDown, HelpCircle, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function UserMenu() {
  const router = useRouter();
  const { data: session } = useSession();

  const user = session?.user;

  const displayName = user?.name?.trim() || "Sentinel User";
  const email = user?.email || "";
  const roleLabel = user?.role === "staff" ? "Sentinel Staff" : "Sentinel Admin";

  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .map((name) => name.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "SA";

  const handleLogout = async () => {
    await signOut({
      redirect: false,
      callbackUrl: "/sentinel/login",
    });

    toast.success("Signed out successfully");

    router.replace("/sentinel/login");
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Avatar className="h-9 w-9 border shadow-sm">
          <AvatarImage
            src={user?.image ?? ""}
            alt={displayName}
          />

          <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>

        <span className="hidden flex-col items-start leading-tight sm:flex">
          <span className="text-sm font-semibold text-foreground">
            {displayName}
          </span>

          <span className="text-xs text-muted-foreground">
            {roleLabel}
          </span>
        </span>

        <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72">
        <div className="flex items-center gap-3 p-3">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={user?.image ?? ""}
              alt={displayName}
            />

            <AvatarFallback className="bg-primary text-sm font-semibold text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex min-w-0 flex-col">
            <span className="truncate font-semibold">
              {displayName}
            </span>

            <span className="truncate text-xs text-muted-foreground">
              {email}
            </span>

            <span className="mt-0.5 text-xs text-muted-foreground">
              {roleLabel}
            </span>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => router.push("/sentinel/profile")}
        >
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => router.push("/sentinel/help")}
        >
          <HelpCircle className="mr-2 h-4 w-4" />
          Help
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}