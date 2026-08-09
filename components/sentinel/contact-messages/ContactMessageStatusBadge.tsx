"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ContactMessageStatus } from "@/types/sentinel/contact-message";

const STATUS_CONFIG = {
  new: {
    icon: "●",
    className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50",
  },
  read: {
    icon: "👁",
    className: "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100",
  },
  replied: {
    icon: "✓",
    className: "bg-green-50 text-green-700 border-green-200 hover:bg-green-50",
  },
  archived: {
    icon: "📦",
    className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50",
  },
};

interface ContactMessageStatusBadgeProps {
  status: ContactMessageStatus;
  showIcon?: boolean;
}

export function ContactMessageStatusBadge({ 
  status, 
  showIcon = true 
}: ContactMessageStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  
  return (
    <Badge
      variant="outline"
      className={cn(
        "capitalize border font-medium",
        config.className
      )}
    >
      {showIcon && <span className="mr-1">{config.icon}</span>}
      {status}
    </Badge>
  );
}