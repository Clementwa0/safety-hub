"use client";

import { apiRequest } from "@/lib/http";

export interface PortalSettings {
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  whatsapp: string;
  currency: string;
  taxRate: number;
  shippingPolicy: string;
}

export const settingsService = {
  async get(): Promise<PortalSettings> {
    const payload = await apiRequest<{ settings?: Partial<PortalSettings> }>('/api/settings');
    return {
      companyName: payload.settings?.companyName ?? "HSE Hub Limited",
      contactEmail: payload.settings?.contactEmail ?? "info@hsehub.co.ke",
      contactPhone: payload.settings?.contactPhone ?? "+254700000000",
      address: payload.settings?.address ?? "Nairobi, Kenya",
      whatsapp: payload.settings?.whatsapp ?? "+254700000000",
      currency: payload.settings?.currency ?? "KES",
      taxRate: payload.settings?.taxRate ?? 0,
      shippingPolicy: payload.settings?.shippingPolicy ?? "Delivery within 2-5 business days.",
    };
  },
};
