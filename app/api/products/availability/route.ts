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

    // Optional `variants=productId:sku,productId2:sku2` - lets callers that
    // know a specific variant (LineItemsEditor, once a size is picked) get
    // that variant's stock instead of the parent product's rolled-up total.
    // Same format snapshotLineItemAvailability builds server-side, just
    // serialized for the querystring.
    const variantSkusByProductId = new Map<string, string>();
    for (const pair of (searchParams.get("variants") ?? "").split(",")) {
      const [productId, variantSku] = pair.split(":");
      if (productId && variantSku) {
        variantSkusByProductId.set(productId.trim(), variantSku.trim());
      }
    }

    await connectToDatabase();
    const availability = await getProductAvailability(
      ids,
      variantSkusByProductId.size > 0 ? variantSkusByProductId : undefined,
    );

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
