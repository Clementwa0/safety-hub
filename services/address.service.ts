"use client";

import { apiRequest } from "@/lib/http";
import type { Address, CreateAddressInput } from "@/types/address";

export const addressService = {
  async list(): Promise<Address[]> {
    return apiRequest<Address[]>("/api/account/addresses");
  },
  async create(input: CreateAddressInput): Promise<Address> {
    return apiRequest<Address>("/api/account/addresses", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  async remove(id: string): Promise<{ id: string }> {
    return apiRequest<{ id: string }>(`/api/account/addresses/${id}`, {
      method: "DELETE",
    });
  },
};
