import mongoose, { Schema, type Document, type Model } from "mongoose";

/**
 * Sentinel notifications are staff-wide (not per-user) — the same
 * convention already used for the pending-orders and new-messages counts
 * they replace (see adminStoreOrderService.stats / contactMessageService.stats,
 * which are also global counters rather than scoped to a signed-in staff
 * member). Every staff/admin user reading the notification feed sees the
 * same list.
 */
export const NOTIFICATION_TYPES = ["new_order", "new_contact_message"] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface INotification extends Document {
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  entity?: string;
  entityId?: string;
  read: boolean;
  readAt?: Date | null;
  /** Soft-deleted — dismissed notifications are excluded from every list/count query, never physically removed. */
  dismissed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    link: { type: String, trim: true },
    entity: { type: String, trim: true },
    entityId: { type: String, trim: true },
    read: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
    dismissed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

// Powers the notification list/poll queries (filter on dismissed, sort by
// recency) and the unread-count badge query (filter on dismissed + read).
notificationSchema.index({ dismissed: 1, createdAt: -1 });
notificationSchema.index({ dismissed: 1, read: 1 });

export const NotificationModel: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>("Notification", notificationSchema);
