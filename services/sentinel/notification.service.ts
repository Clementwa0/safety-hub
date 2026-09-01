"use client";

import { apiRequest } from "@/lib/http";
import type {
  Notification,
  NotificationListResponse,
  NotificationUnreadCount,
} from "@/types/sentinel/notification";

export const notificationService = {
  async list(params: { since?: string; limit?: number; signal?: AbortSignal } = {}): Promise<NotificationListResponse> {
    const search = new URLSearchParams();
    if (params.since) search.set("since", params.since);
    if (params.limit) search.set("limit", String(params.limit));

    return apiRequest<NotificationListResponse>(
      `/api/notifications${search.toString() ? `?${search.toString()}` : ""}`,
      { signal: params.signal },
    );
  },

  async unreadCount(signal?: AbortSignal): Promise<NotificationUnreadCount> {
    return apiRequest<NotificationUnreadCount>("/api/notifications/unread-count", { signal });
  },

  async markRead(id: string, read = true): Promise<Notification> {
    return apiRequest<Notification>(`/api/notifications/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ read }),
    });
  },

  async dismiss(id: string): Promise<Notification> {
    return apiRequest<Notification>(`/api/notifications/${id}`, {
      method: "DELETE",
    });
  },

  async markAllRead(): Promise<{ unreadCount: number }> {
    return apiRequest<{ unreadCount: number }>("/api/notifications/mark-all-read", {
      method: "PATCH",
    });
  },
};
