import type { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { ProductModel } from "@/lib/models/Product";
import { requireStaff } from "@/lib/auth";
import { bulkProductActionSchema } from "@/lib/validation/product";
import { bulkDeleteProducts } from "@/modules/catalog/bulk-delete-products";

export async function POST(request: NextRequest) {
  try {
    const user = await requireStaff();
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
        const result = await bulkDeleteProducts(ids, user.name || user.email || "system");

        if (result.deleted.length === 0 && (result.blocked.length > 0 || result.missing.length > 0)) {
          return apiError(
            "No products were deleted. Some have sales history and must be archived instead; others no longer exist.",
            [
              ...result.blocked.map((b) => `${b.name ?? b.id}: ${b.reason}`),
              ...result.missing.map((id) => `${id}: product not found`),
            ],
            409,
          );
        }

        const skipped = result.blocked.length + result.missing.length;
        return apiSuccess(
          { deleted: result.deleted.length, blocked: result.blocked, missing: result.missing },
          skipped > 0
            ? `${result.deleted.length} product(s) deleted; ${skipped} skipped (sales history or not found).`
            : "Products deleted",
        );
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
