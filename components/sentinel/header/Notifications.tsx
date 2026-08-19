"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { adminStoreOrderService } from "@/services/sentinel/admin-store-order.service";

export default function Notifications() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    adminStoreOrderService
      .stats({
        signal: controller.signal,
      })
      .then((stats) => {
        if (!mounted) return;

        setCount(
          typeof stats.pending === "number"
            ? Math.max(0, stats.pending)
            : 0
        );
      })
      .catch((error) => {
        if (!mounted || error?.name === "AbortError") return;

        setCount(0);
      });

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

 if (count <= 0) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Notifications, ${count} pending orders`}
      title={`${count} pending order${count === 1 ? "" : "s"}`}
      className="
        relative
        shrink-0
        text-muted-foreground
        hover:bg-muted
        hover:text-foreground
      "
      nativeButton={false}
      render={<Link href="/sentinel/store-orders" />}
    >
      <Bell
        className="!h-5 !w-5"
        strokeWidth={2}
        aria-hidden="true"
      />

      <span
        aria-hidden="true"
        className="
          absolute
          -right-0.5
          -top-0.5
          flex
          h-4
          min-w-4
          items-center
          justify-center
          rounded-full
          bg-red-500
          px-1
          text-[10px]
          font-bold
          leading-none
          text-white
          ring-2
          ring-background
        "
      >
        {count > 99 ? "99+" : count}
      </span>
    </Button>
  );
}