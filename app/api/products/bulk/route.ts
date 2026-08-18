import type { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { ProductModel } from "@/lib/models/Product";
import { requireAdmin } from "@/lib/auth";
import { bulkProductActionSchema } from "@/lib/validation/product";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const body = await request.json();
    const parsed = bulkProductActionSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Validation failed", parsed.error.issues.map((issue) => issue.message), 400);
    }

    const { ids, action, status } = parsed.data;
    await connectToDatabase();

    switch (action) {
      case "delete": {
        const result = await ProductModel.deleteMany({ _id: { $in: ids } });
        return apiSuccess({ deleted: result.deletedCount ?? 0 }, "Products deleted");
      }
      case "set-status": {
        if (!status) return apiError("A status is required.", [], 400);
        await ProductModel.updateMany({ _id: { $in: ids } }, { $set: { status } });
        return apiSuccess({ updated: ids.length }, "Status updated");
      }
      case "set-featured": {
        await ProductModel.updateMany({ _id: { $in: ids } }, { $set: { featured: true } });
        return apiSuccess({ updated: ids.length }, "Marked as featured");
      }
      case "unset-featured": {
        await ProductModel.updateMany({ _id: { $in: ids } }, { $set: { featured: false } });
        return apiSuccess({ updated: ids.length }, "Removed from featured");
      }
      case "set-new": {
        await ProductModel.updateMany({ _id: { $in: ids } }, { $set: { isNewArrival: true } });
        return apiSuccess({ updated: ids.length }, "Marked as new arrival");
      }
      case "unset-new": {
        await ProductModel.updateMany({ _id: { $in: ids } }, { $set: { isNewArrival: false } });
        return apiSuccess({ updated: ids.length }, "Removed new arrival badge");
      }
      default:
        return apiError("Unsupported action", [], 400);
    }
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Bulk action failed", [], 500);
  }
}
