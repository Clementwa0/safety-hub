import { apiError, apiSuccess } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { NotificationModel } from "@/lib/models/Notification";

/**
 * GET /api/notifications/unread-count
 *
 * Deliberately the *only* thing the poller hits on its regular interval -
 * a count() and a single-doc findOne(), not the full notification list.
 * The poller only fetches the full list (GET /api/notifications) when
 * `latestAt` here has moved past what it already has, so a tab left open
 * all day costs one cheap query every interval instead of a growing list
 * fetch.
 */
export async function GET() {
  try {
    const user = await requireStaff();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    await connectToDatabase();

    const [unreadCount, latest] = await Promise.all([
      NotificationModel.countDocuments({ dismissed: false, read: false }),
      NotificationModel.findOne({ dismissed: false }).sort("-createdAt").select("createdAt").lean(),
    ]);

    return apiSuccess(
      {
        unreadCount,
        latestAt: latest?.createdAt ? new Date(latest.createdAt).toISOString() : null,
      },
      "Unread count loaded",
    );
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to load unread count",
      [],
      500,
    );
  }
}
