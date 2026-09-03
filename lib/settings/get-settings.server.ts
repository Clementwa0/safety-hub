import { cache } from "react";

import { connectToDatabase } from "@/lib/db";
import { SettingsModel, SETTINGS_SINGLETON_ID } from "@/lib/models/Settings";
import { COMPANY } from "@/lib/constants";
import type { PortalSettings } from "@/services/sentinel/settings.service";

/**
 * Server-only settings read. Only import this from server components,
 * layouts, or route handlers - never from a "use client" file (it talks
 * to Mongoose directly).
 *
 * Wrapped in React's `cache()` so every server component that calls this
 * during the same request shares one DB round trip instead of each
 * layout/page issuing its own query.
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

export const getSettings = cache(async (): Promise<PortalSettings> => {
  try {
    await connectToDatabase();

    const doc = await SettingsModel.findByIdAndUpdate(
      SETTINGS_SINGLETON_ID,
      { $setOnInsert: DEFAULT_SETTINGS },
      { returnDocument: "after", upsert: true },
    ).lean();

    if (!doc) {
      return DEFAULT_SETTINGS as PortalSettings;
    }

    return {
      companyName: doc.companyName,
      contactEmail: doc.contactEmail,
      contactPhone: doc.contactPhone,
      address: doc.address,
      whatsapp: doc.whatsapp,
      currency: doc.currency,
      taxRate: doc.taxRate,
      shippingPolicy: doc.shippingPolicy,
      website: doc.website ?? "",
      businessHours: doc.businessHours ?? "",
      logoUrl: doc.logoUrl ?? "",
      social: {
        facebook: doc.social?.facebook ?? "",
        instagram: doc.social?.instagram ?? "",
        linkedin: doc.social?.linkedin ?? "",
      },
    };
  } catch {
    // DB unreachable at build/edge time (e.g. static generation without
    // MONGODB_URI) - fall back to constants so the page still renders.
    return DEFAULT_SETTINGS as PortalSettings;
  }
});
