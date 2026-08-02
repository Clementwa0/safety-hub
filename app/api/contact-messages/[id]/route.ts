import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { z } from "zod";

import { apiError, apiSuccess, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { CONTACT_MESSAGE_STATUSES, ContactMessageModel } from "@/lib/models/ContactMessage";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const updateSchema = z.object({
  status: z.enum(CONTACT_MESSAGE_STATUSES),
});

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return apiError("Invalid contact message id", [], 400);
    }

    await connectToDatabase();
    const message = await ContactMessageModel.findById(id).lean();

    if (!message) {
      return apiError("Contact message not found", [], 404);
    }

    return apiSuccess(serializeDoc(message), "Contact message loaded");
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to load contact message",
      [],
      500,
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return apiError("Invalid contact message id", [], 400);
    }

    const body = await request.json().catch(() => null);
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        "Validation failed",
        parsed.error.issues.map((issue) => issue.message),
        400,
      );
    }

    await connectToDatabase();

    const updated = await ContactMessageModel.findByIdAndUpdate(
      id,
      { status: parsed.data.status },
      { new: true },
    ).lean();

    if (!updated) {
      return apiError("Contact message not found", [], 404);
    }

    return apiSuccess(serializeDoc(updated), "Contact message updated");
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to update contact message",
      [],
      500,
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return apiError("Invalid contact message id", [], 400);
    }

    await connectToDatabase();

    const deleted = await ContactMessageModel.findByIdAndDelete(id).lean();

    if (!deleted) {
      return apiError("Contact message not found", [], 404);
    }

    return apiSuccess(serializeDoc(deleted), "Contact message deleted");
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to delete contact message",
      [],
      500,
    );
  }
}
