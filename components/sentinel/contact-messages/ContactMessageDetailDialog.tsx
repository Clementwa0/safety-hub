"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Mail, Trash2 } from "lucide-react";

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

  // Mark a newly-opened "new" message as read automatically, mirroring the
  // way most inbox UIs behave. Guarded by a ref so it only fires once per
  // message, even if this component re-renders while the dialog is open.
  useEffect(() => {
    if (!open || !message || message.status !== "new") return;
    if (autoReadIdRef.current === message.id) return;

    autoReadIdRef.current = message.id;
    void onStatusChange(message.id, "read");
  }, [open, message, onStatusChange]);

  if (!message) return null;

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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{message.subject}</DialogTitle>
          <DialogDescription>
            Submitted {formatDate(new Date(message.createdAt))}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status</span>
            <ContactMessageStatusBadge status={message.status} />
          </div>

          <div className="grid gap-1">
            <p>
              <span className="font-medium text-foreground">Name: </span>
              <span className="text-muted-foreground">{message.name}</span>
            </p>
            <p>
              <span className="font-medium text-foreground">Email: </span>
              <span className="text-muted-foreground">{message.email}</span>
            </p>
            <p>
              <span className="font-medium text-foreground">Phone: </span>
              <span className="text-muted-foreground">{message.phone || "—"}</span>
            </p>
          </div>

          <Separator />

          <div>
            <p className="mb-1 font-medium text-foreground">Message</p>
            <p className="whitespace-pre-wrap text-muted-foreground">{message.message}</p>
          </div>
        </div>

        <DialogFooter className="flex-wrap gap-2 sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={message.status === "replied" || updating !== null}
              onClick={() => void handleStatusChange("replied")}
            >
              {updating === "replied" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Mark as replied
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={message.status === "archived" || updating !== null}
              onClick={() => void handleStatusChange("archived")}
            >
              {updating === "archived" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Archive
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(message)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>

          <Button
            variant="default"
            size="sm"
            nativeButton={false}
            render={
              <a
                href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`}
              />
            }
          >
            <Mail className="h-4 w-4" />
            Reply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
