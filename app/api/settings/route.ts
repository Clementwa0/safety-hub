import { z } from "zod";
import type { NextRequest } from "next/server";
import { apiError, apiSuccess, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { SettingsModel, SETTINGS_SINGLETON_ID } from "@/lib/models/Settings";
import { requireAdmin } from "@/lib/auth";
import { COMPANY } from "@/lib/constants";

const settingsSchema = z.object({
  companyName: z.string().trim().min(1),
  contactEmail: z.string().trim().email(),
  contactPhone: z.string().trim().min(1),
  address: z.string().trim().min(1),
  whatsapp: z.string().trim().min(1),
  currency: z.string().trim().min(1),
  taxRate: z.number().min(0).max(100),
  shippingPolicy: z.string().trim().optional().default(""),
});

const settingsPatchSchema = settingsSchema.partial();

/**
 * The company defaults doubled as the settings service's hardcoded
 * fallbacks before this endpoint was wired up. Reused here so a fresh
 * install seeds the same values instead of empty strings.
 */
const DEFAULT_SETTINGS = {
  companyName: COMPANY.name,
  contactEmail: COMPANY.email,
  contactPhone: COMPANY.phone,
  address: COMPANY.address,
  whatsapp: COMPANY.whatsapp,
  currency: "KES",
  taxRate: 0,
  shippingPolicy: "Delivery within 2-5 business days.",
};

export async function GET() {
  try {
    await connectToDatabase();

    const settings = await SettingsModel.findByIdAndUpdate(
      SETTINGS_SINGLETON_ID,
      { $setOnInsert: DEFAULT_SETTINGS },
      { new: true, upsert: true },
    ).lean();

    return apiSuccess({ settings: serializeDoc(settings) }, "Settings loaded");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load settings", [], 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const body = await request.json();
    const parsed = settingsPatchSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Validation failed", parsed.error.issues.map((issue) => issue.message), 400);
    }

    await connectToDatabase();

    const settings = await SettingsModel.findByIdAndUpdate(
      SETTINGS_SINGLETON_ID,
      { $set: parsed.data, $setOnInsert: DEFAULT_SETTINGS },
      { new: true, upsert: true, runValidators: true },
    ).lean();

    return apiSuccess({ settings: serializeDoc(settings) }, "Settings updated");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update settings", [], 500);
  }
}
