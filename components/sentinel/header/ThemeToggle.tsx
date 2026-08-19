"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, SunMoon } from "lucide-react";
import { useTheme } from "next-themes";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: SunMoon },
] as const;

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Toggle theme"
        title="Toggle theme"
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Sun
          className={cn(
            "h-[18px] w-[18px] transition-all duration-300",
            isDark ? "scale-0 -rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100",
          )}
        />
        <Moon
          className={cn(
            "absolute h-[18px] w-[18px] transition-all duration-300",
            isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0",
          )}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-36">
        {OPTIONS.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              "gap-2",
              mounted && theme === value && "bg-muted font-medium text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
