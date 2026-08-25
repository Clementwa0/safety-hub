import type { NextRequest } from "next/server";
import { apiError, apiSuccess, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { MovementModel } from "@/lib/models/Movement";
import { requireStaff } from "@/lib/auth";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Recent Movements feed for the Inventory page — a read of the
 * append-only Movement ledger (see lib/models/Movement.ts and
 * modules/inventory/movements.ts for what writes to it). Newest first, capped
 * at `limit` (default 20). Populates just the product name/sku, not the
 * full product document, since that's all the panel renders.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireStaff();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { searchParams } = new URL(request.url);
    const rawLimit = Number(searchParams.get("limit"));
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, MAX_LIMIT) : DEFAULT_LIMIT;

    await connectToDatabase();

    const movements = await MovementModel.find({})
      .sort("-createdAt")
      .limit(limit)
      .populate("product", "name sku")
      .lean();

    return apiSuccess({ items: movements.map((movement) => serializeDoc(movement)) }, "Movements loaded");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load movements", [], 500);
  }
}
