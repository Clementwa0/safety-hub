import { apiError, apiSuccess } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { StoreOrderModel, STORE_ORDER_STATUSES } from "@/lib/models/StoreOrder";
import { requireStaff } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireStaff();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    await connectToDatabase();

    const [statusCounts, revenueAgg, totalOrders] = await Promise.all([
      StoreOrderModel.aggregate<{ _id: string; count: number }>([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      StoreOrderModel.aggregate<{ _id: null; revenue: number }>([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, revenue: { $sum: "$total" } } },
      ]),
      StoreOrderModel.countDocuments(),
    ]);

    const byStatus = Object.fromEntries(STORE_ORDER_STATUSES.map((status) => [status, 0])) as Record<
      string,
      number
    >;
    for (const entry of statusCounts) {
      byStatus[entry._id] = entry.count;
    }

    return apiSuccess(
      {
        totalOrders,
        pending: byStatus.pending,
        confirmed: byStatus.confirmed,
        processing: byStatus.processing,
        shipped: byStatus.shipped,
        delivered: byStatus.delivered,
        cancelled: byStatus.cancelled,
        totalRevenue: revenueAgg[0]?.revenue ?? 0,
      },
      "Stats loaded",
    );
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load stats", [], 500);
  }
}
