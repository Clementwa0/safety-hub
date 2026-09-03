import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { z } from "zod";

import { apiError, apiSuccess, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { NotificationModel } from "@/lib/models/Notification";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const patchSchema = z.object({
  read: z.boolean(),
});

/** PATCH /api/notifications/[id] - mark a notification read/unread. */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireStaff();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return apiError("Invalid notification id", [], 400);
    }

    const body = await request.json().catch(() => null);
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validation failed", parsed.error.issues.map((issue) => issue.message), 400);
    }

    await connectToDatabase();

    const updated = await NotificationModel.findByIdAndUpdate(
      id,
      {
        read: parsed.data.read,
        readAt: parsed.data.read ? new Date() : null,
      },
      { new: true },
    ).lean();

    if (!updated) {
      return apiError("Notification not found", [], 404);
    }

    return apiSuccess(serializeDoc(updated), "Notification updated");
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to update notification",
      [],
      500,
    );
  }
}

/**
 * DELETE /api/notifications/[id] - dismiss a notification. Soft-deletes
 * (sets `dismissed: true`) rather than removing the document, so
 * dismissed notifications stay excluded from every list/count query
 * without losing the audit trail.
 */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireStaff();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return apiError("Invalid notification id", [], 400);
    }

    await connectToDatabase();

    const dismissed = await NotificationModel.findByIdAndUpdate(
      id,
      { dismissed: true },
      { new: true },
    ).lean();

    if (!dismissed) {
      return apiError("Notification not found", [], 404);
    }

    return apiSuccess(serializeDoc(dismissed), "Notification dismissed");
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to dismiss notification",
      [],
      500,
    );
  }
}
