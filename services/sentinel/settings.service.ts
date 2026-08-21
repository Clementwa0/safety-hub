"use client";

import { apiRequest } from "@/lib/http";

export interface PortalSettingsSocial {
  facebook: string;
  instagram: string;
  linkedin: string;
}

export interface PortalSettings {
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  whatsapp: string;
  currency: string;
  taxRate: number;
  shippingPolicy: string;
  website: string;
  businessHours: string;
  logoUrl: string;
  social: PortalSettingsSocial;
}


export const DEFAULT_PORTAL_SETTINGS: PortalSettings = {
  companyName: "HSE Hub Limited",
  contactEmail: "info@hsehub.co.ke",
  contactPhone: "+254700000000",
  address: "Nairobi, Kenya",
  whatsapp: "+254700000000",
  currency: "KES",
  taxRate: 0,
  shippingPolicy: "Delivery within 2-5 business days.",
  website: "",
  businessHours: "Mon - Fri: 8:00 AM - 5:00 PM",
  logoUrl: "",
  social: {
    facebook: "",
    instagram: "",
    linkedin: "",
  },
};

function normalize(partial?: Partial<PortalSettings> | null): PortalSettings {
  return {
    companyName: partial?.companyName ?? DEFAULT_PORTAL_SETTINGS.companyName,
    contactEmail: partial?.contactEmail ?? DEFAULT_PORTAL_SETTINGS.contactEmail,
    contactPhone: partial?.contactPhone ?? DEFAULT_PORTAL_SETTINGS.contactPhone,
    address: partial?.address ?? DEFAULT_PORTAL_SETTINGS.address,
    whatsapp: partial?.whatsapp ?? DEFAULT_PORTAL_SETTINGS.whatsapp,
    currency: partial?.currency ?? DEFAULT_PORTAL_SETTINGS.currency,
    taxRate: partial?.taxRate ?? DEFAULT_PORTAL_SETTINGS.taxRate,
    shippingPolicy: partial?.shippingPolicy ?? DEFAULT_PORTAL_SETTINGS.shippingPolicy,
    website: partial?.website ?? DEFAULT_PORTAL_SETTINGS.website,
    businessHours: partial?.businessHours ?? DEFAULT_PORTAL_SETTINGS.businessHours,
    logoUrl: partial?.logoUrl ?? DEFAULT_PORTAL_SETTINGS.logoUrl,
    social: {
      facebook: partial?.social?.facebook ?? DEFAULT_PORTAL_SETTINGS.social.facebook,
      instagram: partial?.social?.instagram ?? DEFAULT_PORTAL_SETTINGS.social.instagram,
      linkedin: partial?.social?.linkedin ?? DEFAULT_PORTAL_SETTINGS.social.linkedin,
    },
  };
}

export const settingsService = {
  async get(): Promise<PortalSettings> {
    const payload = await apiRequest<{ settings?: Partial<PortalSettings> }>("/api/settings");
    return normalize(payload.settings);
  },

  async update(input: Partial<PortalSettings>): Promise<PortalSettings> {
    const payload = await apiRequest<{ settings?: Partial<PortalSettings> }>("/api/settings", {
      method: "PATCH",
      body: JSON.stringify(input),
    });
    return normalize(payload.settings);
  },
};
