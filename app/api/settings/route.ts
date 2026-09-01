import { z } from "zod";
import type { NextRequest } from "next/server";
import { apiError, apiSuccess, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import {
  SettingsModel,
  SETTINGS_SINGLETON_ID,
} from "@/lib/models/Settings";
import { requireAdmin } from "@/lib/auth";
import { COMPANY } from "@/lib/constants";
import { recordAuditEvent } from "@/modules/audit/audit.service";

const settingsSocialSchema = z.object({
  facebook: z.string().trim().optional().default(""),
  instagram: z.string().trim().optional().default(""),
  linkedin: z.string().trim().optional().default(""),
});

const settingsSchema = z.object({
  companyName: z.string().trim().min(1),
  contactEmail: z.string().trim().email(),
  contactPhone: z.string().trim().min(1),
  address: z.string().trim().min(1),
  whatsapp: z.string().trim().min(1),
  currency: z.string().trim().min(1),
  taxRate: z.number().min(0).max(100),
  shippingPolicy: z.string().trim().optional().default(""),
  website: z.string().trim().optional().default(""),
  businessHours: z.string().trim().optional().default(""),
  logoUrl: z.string().trim().optional().default(""),
  social: settingsSocialSchema
    .optional()
    .default({
      facebook: "",
      instagram: "",
      linkedin: "",
    }),
});

const settingsPatchSchema = settingsSchema.partial();

/**
 * Default company settings used when the singleton settings
 * document does not yet exist.
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
  website: "",
  businessHours: "Mon - Fri: 8:00 AM - 5:00 PM",
  logoUrl: "",
  social: {
    facebook: COMPANY.social.facebook,
    instagram: COMPANY.social.instagram,
    linkedin: COMPANY.social.linkedin,
  },
};

/**
 * GET /api/settings
 *
 * Returns the singleton company settings document.
 * If it doesn't exist, it is created using DEFAULT_SETTINGS.
 */
export async function GET() {
  try {
    await connectToDatabase();

    const settings = await SettingsModel.findByIdAndUpdate(
      SETTINGS_SINGLETON_ID,
      {
        $setOnInsert: DEFAULT_SETTINGS,
      },
      {
        new: true,
        upsert: true,
      },
    ).lean();

    return apiSuccess(
      {
        settings: serializeDoc(settings),
      },
      "Settings loaded",
    );
  } catch (error) {
    return apiError(
      error instanceof Error
        ? error.message
        : "Failed to load settings",
      [],
      500,
    );
  }
}

/**
 * PATCH /api/settings
 *
 * Updates company settings.
 *
 * Important:
 * We intentionally do NOT use $setOnInsert together with $set here.
 * MongoDB rejects updates where the same path exists in both operators.
 *
 * If the settings document already exists:
 *   -> update only the submitted fields.
 *
 * If the settings document doesn't exist:
 *   -> create it using DEFAULT_SETTINGS merged with the submitted fields.
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAdmin();

    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const body = await request.json();

    const parsed = settingsPatchSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        "Validation failed",
        parsed.error.issues.map((issue) => issue.message),
        400,
      );
    }

    await connectToDatabase();

    /**
     * Check whether the singleton settings document already exists.
     */
    const existingSettings = await SettingsModel.findById(
      SETTINGS_SINGLETON_ID,
    ).lean();

    let update: Record<string, unknown>;

    if (existingSettings) {
      /**
       * Existing settings:
       * Only update the fields submitted by the admin.
       */
      update = {
        $set: parsed.data,
      };
    } else {
      /**
       * First update:
       * Create a complete settings document using defaults,
       * then override the defaults with the admin's submitted values.
       */
      update = {
        $set: {
          ...DEFAULT_SETTINGS,
          ...parsed.data,
        },
      };
    }

    const settings = await SettingsModel.findByIdAndUpdate(
      SETTINGS_SINGLETON_ID,
      update,
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    ).lean();

    await recordAuditEvent({
      actor: user.name || user.email || "system",
      action: "settings_updated",
      entity: "Settings",
      entityId: SETTINGS_SINGLETON_ID,
      metadata: {
        changedFields: Object.keys(parsed.data),
        currency: settings?.currency,
        taxRate: settings?.taxRate,
      },
    });

    return apiSuccess(
      {
        settings: serializeDoc(settings),
      },
      "Settings updated",
    );
  } catch (error) {
    return apiError(
      error instanceof Error
        ? error.message
        : "Failed to update settings",
      [],
      500,
    );
  }
}
