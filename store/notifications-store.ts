import { create } from "zustand";

import { notificationService } from "@/services/sentinel/notification.service";
import type { Notification } from "@/types/sentinel/notification";

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  hasLoaded: boolean;
  error: Error | null;
  /** In-flight guard so an overlapping poll/fetch never fires a duplicate request. */
  fetching: boolean;

  fetchInitial: () => Promise<void>;
  /** Delta poll: only requests notifications newer than what's already in the store, then merges them in de-duplicated. */
  poll: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  dismiss: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

/** Merges freshly-fetched notifications into the existing list, newest first, de-duplicated by id. */
function mergeNotifications(existing: Notification[], incoming: Notification[]): Notification[] {
  if (incoming.length === 0) return existing;

  const byId = new Map(existing.map((item) => [item.id, item]));
  for (const item of incoming) {
    byId.set(item.id, item);
  }

  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  hasLoaded: false,
  error: null,
  fetching: false,

  fetchInitial: async () => {
    if (get().fetching) return;
    set({ loading: true, fetching: true, error: null });
    try {
      const { items, unreadCount } = await notificationService.list({ limit: 20 });
      set({
        notifications: items,
        unreadCount,
        loading: false,
        fetching: false,
        hasLoaded: true,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error : new Error("Failed to load notifications"),
        loading: false,
        fetching: false,
        hasLoaded: true,
      });
    }
  },

  poll: async () => {
    // Guards against overlapping requests if a poll tick fires before the
    // previous one has resolved (e.g. a slow connection) — never lets two
    // poll requests be in flight at once, which is how duplicate/stale
    // merges would otherwise happen.
    if (get().fetching) return;

    set({ fetching: true });
    try {
      const newest = get().notifications[0]?.createdAt;
      const { items, unreadCount } = await notificationService.list(
        newest ? { since: newest, limit: 20 } : { limit: 20 },
      );
      set((state) => ({
        notifications: mergeNotifications(state.notifications, items),
        unreadCount,
        fetching: false,
        hasLoaded: true,
      }));
    } catch {
      // Silent — polling failures shouldn't surface as errors; the next
      // tick will simply try again.
      set({ fetching: false });
    }
  },

  markAsRead: async (id: string) => {
    const previous = get().notifications;
    const target = previous.find((item) => item.id === id);
    if (!target || target.read) return;

    // Optimistic update so the UI reacts immediately; rolled back on failure.
    set((state) => ({
      notifications: state.notifications.map((item) => (item.id === id ? { ...item, read: true } : item)),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));

    try {
      await notificationService.markRead(id, true);
    } catch (error) {
      set({ notifications: previous, unreadCount: get().unreadCount + 1, error: error instanceof Error ? error : new Error("Failed to mark as read") });
    }
  },

  dismiss: async (id: string) => {
    const previous = get().notifications;
    const target = previous.find((item) => item.id === id);
    if (!target) return;

    // Optimistic removal — the item disappears from the list immediately.
    set((state) => ({
      notifications: state.notifications.filter((item) => item.id !== id),
      unreadCount: target.read ? state.unreadCount : Math.max(0, state.unreadCount - 1),
    }));

    try {
      await notificationService.dismiss(id);
    } catch (error) {
      // Roll back: re-insert and re-sort so a failed dismiss doesn't silently disappear.
      set((state) => ({
        notifications: mergeNotifications(state.notifications, [target]),
        unreadCount: target.read ? state.unreadCount : state.unreadCount + 1,
        error: error instanceof Error ? error : new Error("Failed to dismiss notification"),
      }));
    }
  },

  markAllRead: async () => {
    const previous = get().notifications;
    const previousUnread = get().unreadCount;

    set((state) => ({
      notifications: state.notifications.map((item) => ({ ...item, read: true })),
      unreadCount: 0,
    }));

    try {
      await notificationService.markAllRead();
    } catch (error) {
      set({ notifications: previous, unreadCount: previousUnread, error: error instanceof Error ? error : new Error("Failed to mark all as read") });
    }
  },
}));
