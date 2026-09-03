"use client";

import Link from "next/link";
import { HelpCircle } from "lucide-react";

export default function HelpButton() {
  return (
    <Link
      href="/sentinel/help"
      aria-label="Help"
      title="Help"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <HelpCircle className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden="true" />
    </Link>
  );
}
