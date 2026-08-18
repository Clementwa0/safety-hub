import type { NextRequest } from "next/server";
import { apiError, apiSuccess, getPaginationParams, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { StoreOrderModel } from "@/lib/models/StoreOrder";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { searchParams } = new URL(request.url);
    const { page, limit, sort, query, status } = getPaginationParams(searchParams);
    const paymentStatus = searchParams.get("paymentStatus") || "";

    await connectToDatabase();

    const filter: Record<string, unknown> = {};

    if (query) {
      filter.$or = [
        { orderNumber: { $regex: query, $options: "i" } },
        { "customer.name": { $regex: query, $options: "i" } },
        { "customer.email": { $regex: query, $options: "i" } },
      ];
    }
    if (status) {
      filter.status = status;
    }
    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    const [orders, total] = await Promise.all([
      StoreOrderModel.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      StoreOrderModel.countDocuments(filter),
    ]);

    return apiSuccess(
      {
        items: orders.map((order) => serializeDoc(order)),
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
      "Orders loaded",
    );
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load orders", [], 500);
  }
}
