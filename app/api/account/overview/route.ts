import { apiError, apiSuccess } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { StoreOrderModel } from "@/lib/models/StoreOrder";
import { AddressModel } from "@/lib/models/Address";
import { resolveStorefrontCustomer } from "@/lib/storefront/identity";
import { customerOrderFilter } from "@/lib/storefront/ownership";
import type {
  AccountOverview,
  AccountOverviewOrder,
} from "@/types/storefront/account";

export async function GET() {
  try {
    const customer = await resolveStorefrontCustomer();

    if (!customer) {
      return apiError("Not signed in", [], 401);
    }

    await connectToDatabase();

    const [orderCount, pendingOrders, completedOrders, addressCount, recentOrders] = await Promise.all([
      StoreOrderModel.countDocuments(customerOrderFilter(customer.id)),
      StoreOrderModel.countDocuments(
        customerOrderFilter(customer.id, {
          status: { $in: ["pending", "confirmed", "processing", "shipped"] },
        }),
      ),
      StoreOrderModel.countDocuments(customerOrderFilter(customer.id, { status: "delivered" })),
      AddressModel.countDocuments({ customer: customer.id }),
      StoreOrderModel.find(customerOrderFilter(customer.id))
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
