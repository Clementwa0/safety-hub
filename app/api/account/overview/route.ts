import { apiError, apiSuccess } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { auth } from "@/lib/customer-auth";
import { StoreOrderModel } from "@/lib/models/StoreOrder";
import { AddressModel } from "@/lib/models/Address";
import type {
  AccountOverview,
  AccountOverviewOrder,
} from "@/types/account";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return apiError("Not signed in", [], 401);
    }

    await connectToDatabase();

    const userId = session.user.id;

    const [orderCount, pendingOrders, completedOrders, addressCount, recentOrders] = await Promise.all([
      StoreOrderModel.countDocuments({ user: userId }),
      StoreOrderModel.countDocuments({
        user: userId,
        status: { $in: ["pending", "confirmed", "processing", "shipped"] },
      }),
      StoreOrderModel.countDocuments({ user: userId, status: "delivered" }),
      AddressModel.countDocuments({ customer: userId }),
      StoreOrderModel.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(3)
        .select("_id orderNumber createdAt total paymentStatus status")
        .lean(),
    ]);

    const overview: AccountOverview = {
      orderCount,
      pendingOrders,
      completedOrders,
      addressCount,
      recentOrders: recentOrders.map((order): AccountOverviewOrder => ({
        id: String(order._id),
        orderNumber: String(order.orderNumber),
        createdAt:
          order.createdAt instanceof Date
            ? order.createdAt.toISOString()
            : String(order.createdAt),
        total: Number(order.total),
        paymentStatus: order.paymentStatus,
        status: order.status,
      })),
    };

    return apiSuccess(overview, "Account overview loaded");
  } catch (error) {
    return apiError(
      error instanceof Error
        ? error.message
        : "Failed to load account overview",
      [],
      500
    );
  }
}