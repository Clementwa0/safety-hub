import { apiRequest } from "@/lib/http";
import type { AdminUser, UserInput } from "@/types/sentinel/user";

export const userService = {
  async list(): Promise<AdminUser[]> {
    const payload = await apiRequest<{ items: AdminUser[] }>("/api/users");
    return payload.items;
  },

  async create(input: UserInput): Promise<AdminUser> {
    return apiRequest<AdminUser>("/api/users", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async update(id: string, input: Partial<UserInput>): Promise<AdminUser> {
    return apiRequest<AdminUser>(`/api/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  async remove(id: string): Promise<void> {
    await apiRequest<void>(`/api/users/${id}`, { method: "DELETE" });
  },
};
