export const NOTIFICATION_TYPES = ["new_order", "new_contact_message"] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  entity?: string;
  entityId?: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListResponse {
  items: Notification[];
  unreadCount: number;
}

export interface NotificationUnreadCount {
  unreadCount: number;
  /** ISO timestamp of the newest non-dismissed notification, or null if there are none yet. Used by the poller to decide whether it needs to fetch the full list. */
  latestAt: string | null;
}
