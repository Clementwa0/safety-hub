"use client";

import { Eye, Reply, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ContactMessageStatusBadge } from "@/components/sentinel/contact-messages/ContactMessageStatusBadge";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ContactMessage } from "@/types/contact-message";

interface ContactMessageTableProps {
  messages: ContactMessage[];
  onView: (message: ContactMessage) => void;
  onDelete: (message: ContactMessage) => void;
  onReply?: (message: ContactMessage) => void;
}

export default function ContactMessageTable({
  messages,
  onView,
  onDelete,
  onReply,
}: ContactMessageTableProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getPreview = (text: string, maxLength = 80) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Received</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {messages.map((item) => (
            <TableRow
              key={item.id}
              className={cn(
                "cursor-pointer transition-colors hover:bg-muted/60",
                item.status === "new" && "bg-primary/5"
              )}
              onClick={() => onView(item)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/20 text-sm font-medium text-primary">
                    {getInitials(item.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {item.status === "new" && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                      )}
                      <span className={cn(
                        "truncate text-sm font-medium",
                        item.status === "new" && "font-semibold"
                      )}>
                        {item.name}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                      <span className="truncate">{item.email}</span>
                      {item.phone && (
                        <span className="truncate">{item.phone}</span>
                      )}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="max-w-[300px] min-w-[200px]">
                <div className={cn(
                  "space-y-0.5",
                  item.status === "new" && "font-medium"
                )}>
                  <p className="truncate text-sm">{item.subject}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {getPreview(item.message)}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <ContactMessageStatusBadge status={item.status} />
              </TableCell>
              <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                <div className="space-y-0.5">
                  <div>{formatDate(new Date(item.createdAt))}</div>
                  <div className="text-xs">
                    {new Date(item.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </TableCell>
              <TableCell onClick={(event) => event.stopPropagation()}>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`View message from ${item.name}`}
                    onClick={() => onView(item)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {onReply && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Reply to ${item.name}`}
                      onClick={() => onReply(item)}
                    >
                      <Reply className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Delete message from ${item.name}`}
                    onClick={() => onDelete(item)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}