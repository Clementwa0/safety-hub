"use client";

import { Badge } from "@/components/ui/badge";
import type { ContactMessageStatus } from "@/types/contact-message";

type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

const STATUS_VARIANT: Record<ContactMessageStatus, BadgeVariant> = {
  new: "default",
  read: "secondary",
  replied: "outline",
  archived: "destructive",
};

export function ContactMessageStatusBadge({ status }: { status: ContactMessageStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status]} className="capitalize">
      {status}
    </Badge>
  );
}
