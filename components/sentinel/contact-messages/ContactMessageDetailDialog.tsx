"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Mail, Reply, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ContactMessageStatusBadge } from "@/components/sentinel/contact-messages/ContactMessageStatusBadge";
import { formatDate } from "@/lib/format";
import type { ContactMessage, ContactMessageStatus } from "@/types/contact-message";

interface ContactMessageDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: ContactMessage | null;
  onStatusChange: (id: string, status: ContactMessageStatus) => Promise<void>;
  onDelete: (message: ContactMessage) => void;
}

export default function ContactMessageDetailDialog({
  open,
  onOpenChange,
  message,
  onStatusChange,
  onDelete,
}: ContactMessageDetailDialogProps) {
  const [updating, setUpdating] = useState<ContactMessageStatus | null>(null);
  const autoReadIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open || !message || message.status !== "new") return;
    if (autoReadIdRef.current === message.id) return;

    autoReadIdRef.current = message.id;
    void onStatusChange(message.id, "read");
  }, [open, message, onStatusChange]);

  if (!message) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleStatusChange = async (status: ContactMessageStatus) => {
    setUpdating(status);
    try {
      await onStatusChange(message.id, status);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl sm:min-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="space-y-2">
            <DialogTitle className="text-xl pr-8">{message.subject}</DialogTitle>
            <DialogDescription className="flex flex-wrap items-center gap-3 text-sm">
              <span className="flex items-center gap-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/20 text-xs font-medium text-primary">
                  {getInitials(message.name)}
                </div>
                {message.name}
              </span>
              <span className="text-muted-foreground/50">·</span>
              <span>
                {formatDate(new Date(message.createdAt))}
                <span className="ml-1 text-xs text-muted-foreground">
                  at{" "}
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </span>
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-6 min-h-0">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/30 p-3 flex-shrink-0">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Status
                </span>
                <ContactMessageStatusBadge status={message.status} />
              </div>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <div>
                  <span className="text-muted-foreground">Email</span>
                  <a
                    href={`mailto:${message.email}`}
                    className="ml-2 text-primary hover:underline"
                  >
                    {message.email}
                  </a>
                </div>
                {message.phone && (
                  <div>
                    <span className="text-muted-foreground">Phone</span>
                    <span className="ml-2">{message.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator className="flex-shrink-0" />

          <div className="flex-1 min-h-0">
            <p className="mb-3 text-sm font-medium text-foreground">Message</p>
            <div className="rounded-lg bg-muted/20 p-6 text-sm leading-relaxed text-muted-foreground overflow-y-auto max-h-[50vh]">
              <p className="whitespace-pre-wrap break-words">{message.message}</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 flex-wrap gap-2 pt-4 border-t">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <Button
              variant="default"
              size="sm"
              className="gap-2"
              onClick={() => {
                window.location.href = `mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`;
              }}
            >
              <Mail className="h-4 w-4" />
              Reply
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={message.status === "replied" || updating !== null}
              onClick={() => void handleStatusChange("replied")}
              className="gap-2"
            >
              {updating === "replied" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Reply className="h-4 w-4" />
              )}
              Mark as replied
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={message.status === "archived" || updating !== null}
              onClick={() => void handleStatusChange("archived")}
              className="gap-2"
            >
              {updating === "archived" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "📦"
              )}
              Archive
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-destructive hover:text-destructive"
              onClick={() => onDelete(message)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
