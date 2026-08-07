"use client";

import { apiRequest } from "@/lib/http";
import type {
  AccountMe,
  AccountOverview,
  AccountProfileUpdate,
  LinkGuestOrdersResult,
} from "@/types/account";

export const accountService = {
  async me(): Promise<AccountMe> {
    return apiRequest<AccountMe>("/api/account/me");
  },
  async updateProfile(input: AccountProfileUpdate): Promise<AccountMe> {
    return apiRequest<AccountMe>("/api/account/me", {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },
  async overview(): Promise<AccountOverview> {
    return apiRequest<AccountOverview>("/api/account/overview");
  },
  async linkGuestOrders(): Promise<LinkGuestOrdersResult> {
    return apiRequest<LinkGuestOrdersResult>("/api/account/link-guest-orders", {
      method: "POST",
    });
  },
};
