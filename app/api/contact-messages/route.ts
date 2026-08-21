import type { NextRequest } from "next/server";

import { apiError, apiSuccess, getPaginationParams, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { ContactMessageModel } from "@/lib/models/ContactMessage";

export async function GET(request: NextRequest) {
  try {
    const user = await requireStaff();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { searchParams } = new URL(request.url);
    const { page, limit, sort, query, status } = getPaginationParams(searchParams);

    await connectToDatabase();

    const filter: Record<string, unknown> = {};

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { subject: { $regex: query, $options: "i" } },
      ];
    }
    if (status) {
      filter.status = status;
    }

    const [messages, total] = await Promise.all([
      ContactMessageModel.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ContactMessageModel.countDocuments(filter),
    ]);

    return apiSuccess(
      {
        items: messages.map((item) => serializeDoc(item)),
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
      "Contact messages loaded",
    );
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to load contact messages",
      [],
      500,
    );
  }
}
