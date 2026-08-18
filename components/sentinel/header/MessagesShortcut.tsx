"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { contactMessageService } from "@/services/sentinel/contact-message.service";

export default function MessagesShortcut() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    contactMessageService
      .stats()
      .then((stats) => mounted && setCount(stats.new))
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Messages"
      className="relative text-muted-foreground hover:bg-muted hover:text-foreground"
      nativeButton={false}
      render={<Link href="/sentinel/contact-messages" />}
    >
      <MessageSquare className="h-[18px] w-[18px]" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-background">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Button>
  );
}
