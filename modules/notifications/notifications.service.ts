import { connectToDatabase } from "@/lib/db";
import { NotificationModel, type NotificationType } from "@/lib/models/Notification";

export interface CreateNotificationInput {
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  entity?: string;
  entityId?: string;
}

/**
 * Creates an in-app Sentinel notification.
 *
 * This is intentionally side-effect-only and never awaited by its callers
 * in the request path that matters to the customer/visitor (order
 * placement, contact form submission) — the same "best-effort, never
 * blocks or rolls back the primary operation" approach already used for
 * the contact form's email notification in app/api/contact/route.ts.
 * Callers should attach a `.catch()` (or otherwise swallow the promise)
 * rather than `await` this inline in a request/transaction that must
 * succeed regardless of whether the notification write does.
 */
export async function createNotification(input: CreateNotificationInput) {
  await connectToDatabase();

  return NotificationModel.create({
    type: input.type,
    title: input.title,
    message: input.message,
    link: input.link,
    entity: input.entity,
    entityId: input.entityId,
  });
}
