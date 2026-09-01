"use client";

import Link from "next/link";
import { Bell, Check, X } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotificationsPolling } from "@/hooks/useNotificationsPolling";
import { useNotificationsStore } from "@/store/notifications-store";
import type { Notification } from "@/types/sentinel/notification";

export default function Notifications() {
  // Mounted once at the Sentinel layout level (via Header), so this is the
  // single place the poll interval lives for the whole admin session —
  // navigating between /sentinel pages doesn't spin up a second poller.
  useNotificationsPolling();

  const notifications = useNotificationsStore((state) => state.notifications);
  const unreadCount = useNotificationsStore((state) => state.unreadCount);
  const markAsRead = useNotificationsStore((state) => state.markAsRead);
  const dismiss = useNotificationsStore((state) => state.dismiss);
  const markAllRead = useNotificationsStore((state) => state.markAllRead);

  return (
    <Popover>
      <PopoverTrigger
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        title="Notifications"
        className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <Bell className="!h-5 !w-5" strokeWidth={2} aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-background"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
          <span className="text-sm font-semibold text-foreground">Notifications</span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllRead()}
              className="text-xs font-medium text-primary hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-muted-foreground">
            You&apos;re all caught up.
          </p>
        ) : (
          <ScrollArea className="max-h-96">
            <ul className="divide-y divide-border">
              {notifications.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  onRead={() => markAsRead(notification.id)}
                  onDismiss={() => dismiss(notification.id)}
                />
              ))}
            </ul>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}

function NotificationRow({
  notification,
  onRead,
  onDismiss,
}: {
  notification: Notification;
  onRead: () => void;
  onDismiss: () => void;
}) {
  const body = (
    <div className="min-w-0 flex-1">
      <div className="flex items-start gap-1.5">
        {!notification.read && (
          <span
            aria-hidden="true"
            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
          />
        )}
        <p className={`truncate text-sm ${notification.read ? "font-normal text-muted-foreground" : "font-medium text-foreground"}`}>
          {notification.title}
        </p>
      </div>
      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{notification.message}</p>
      <p className="mt-1 text-[11px] text-muted-foreground/80">
        {formatDistanceToNowStrict(new Date(notification.createdAt), { addSuffix: true })}
      </p>
    </div>
  );

  return (
    <li className="group flex items-start gap-2 px-3 py-2.5 hover:bg-muted/60">
      {notification.link ? (
        <Link href={notification.link} onClick={onRead} className="flex min-w-0 flex-1 items-start gap-2">
          {body}
        </Link>
      ) : (
        <button type="button" onClick={onRead} className="flex min-w-0 flex-1 items-start gap-2 text-left">
          {body}
        </button>
      )}

      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        {!notification.read && (
          <button
            type="button"
            onClick={onRead}
            aria-label="Mark as read"
            title="Mark as read"
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          title="Dismiss"
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  );
}