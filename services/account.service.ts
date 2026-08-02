"use client";

import { apiRequest } from "@/lib/http";
import type { AccountMe, LinkGuestOrdersResult } from "@/types/account";

export const accountService = {
  async me(): Promise<AccountMe> {
    return apiRequest<AccountMe>("/api/account/me");
  },
  async linkGuestOrders(): Promise<LinkGuestOrdersResult> {
    return apiRequest<LinkGuestOrdersResult>("/api/account/link-guest-orders", {
      method: "POST",
    });
  },
};
