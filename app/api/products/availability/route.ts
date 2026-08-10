import type { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { getProductAvailability } from "@/lib/server/availability";

// GET /api/products/availability?ids=<id1>,<id2>,...
//
// Deliberately separate from the main products list/detail endpoints:
// LineItemsEditor calls this on every quantity change while the user
// types, so it needs to be as cheap as possible (a projection of just
// stock/reserved for a handful of ids), not the full product document.
export async function GET(request: NextRequest) {
  try {
    const user = await requireStaff();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { searchParams } = new URL(request.url);
    const ids = (searchParams.get("ids") ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (ids.length === 0) {
      return apiSuccess({ items: [] }, "No ids requested");
    }

    await connectToDatabase();
    const availability = await getProductAvailability(ids);

    return apiSuccess(
      { items: Array.from(availability.values()) },
      "Availability loaded",
    );
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to load availability",
      [],
      500,
    );
  }
}
