import { apiError, apiSuccess } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { CONTACT_MESSAGE_STATUSES, ContactMessageModel } from "@/lib/models/ContactMessage";

export async function GET() {
  try {
    const user = await requireAdmin();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    await connectToDatabase();

    const [statusCounts, total] = await Promise.all([
      ContactMessageModel.aggregate<{ _id: string; count: number }>([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      ContactMessageModel.countDocuments(),
    ]);

    const byStatus = Object.fromEntries(
      CONTACT_MESSAGE_STATUSES.map((status) => [status, 0]),
    ) as Record<string, number>;

    for (const entry of statusCounts) {
      byStatus[entry._id] = entry.count;
    }

    return apiSuccess(
      {
        total,
        new: byStatus.new,
        read: byStatus.read,
        replied: byStatus.replied,
        archived: byStatus.archived,
      },
      "Stats loaded",
    );
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load stats", [], 500);
  }
}
