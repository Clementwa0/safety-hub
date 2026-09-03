import { apiError, apiSuccess } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { NotificationModel } from "@/lib/models/Notification";

/** PATCH /api/notifications/mark-all-read - marks every unread, non-dismissed notification as read in one query. */
export async function PATCH() {
  try {
    const user = await requireStaff();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    await connectToDatabase();

    await NotificationModel.updateMany(
      { dismissed: false, read: false },
      { read: true, readAt: new Date() },
    );

    return apiSuccess({ unreadCount: 0 }, "All notifications marked as read");
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to mark notifications as read",
      [],
      500,
    );
  }
}
