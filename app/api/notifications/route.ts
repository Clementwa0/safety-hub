import type { NextRequest } from "next/server";

import { apiError, apiSuccess, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { NotificationModel } from "@/lib/models/Notification";

/**
 * GET /api/notifications
 *
 * Query params:
 * - `since` (optional ISO timestamp) - only return notifications created
 *   after this cursor. The poller passes the `createdAt` of the newest
 *   notification it already has, so a poll only ever returns *new* items
 *   instead of re-downloading the whole recent list every time.
 * - `limit` (optional, default 20, max 50).
 *
 * `unreadCount` is always the true global count (ignores `since`/`limit`)
 * so the badge is correct even when the list itself is paginated/delta'd.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireStaff();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const since = searchParams.get("since");
    const limitParam = Number(searchParams.get("limit"));
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 50) : 20;

    const filter: Record<string, unknown> = { dismissed: false };

    if (since) {
      const sinceDate = new Date(since);
      if (!Number.isNaN(sinceDate.getTime())) {
        filter.createdAt = { $gt: sinceDate };
      }
    }

    const [items, unreadCount] = await Promise.all([
      NotificationModel.find(filter).sort("-createdAt").limit(limit).lean(),
      NotificationModel.countDocuments({ dismissed: false, read: false }),
    ]);

    return apiSuccess(
      {
        items: items.map((item) => serializeDoc(item)),
        unreadCount,
      },
      "Notifications loaded",
    );
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to load notifications",
      [],
      500,
    );
  }
}
