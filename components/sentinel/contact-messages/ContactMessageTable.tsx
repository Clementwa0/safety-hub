"use client";

import { Eye, Trash2 } from "lucide-react";

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
import type { ContactMessage } from "@/types/contact-message";

interface ContactMessageTableProps {
  messages: ContactMessage[];
  onView: (message: ContactMessage) => void;
  onDelete: (message: ContactMessage) => void;
}

export default function ContactMessageTable({
  messages,
  onView,
  onDelete,
}: ContactMessageTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="hidden md:table-cell">Phone</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {messages.map((item) => (
            <TableRow
              key={item.id}
              className="cursor-pointer"
              onClick={() => onView(item)}
            >
              <TableCell className="text-sm font-medium">{item.name}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{item.email}</TableCell>
              <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                {item.phone || "—"}
              </TableCell>
              <TableCell className="max-w-[220px] truncate text-sm">{item.subject}</TableCell>
              <TableCell>
                <ContactMessageStatusBadge status={item.status} />
              </TableCell>
              <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                {formatDate(new Date(item.createdAt))}
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
