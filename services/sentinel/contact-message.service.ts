"use client";

import { apiRequest } from "@/lib/http";
import type {
  AdminContactMessageQuery,
  ContactMessage,
  ContactMessageStats,
  ContactMessageStatus,
  Paginated,
} from "@/types/sentinel/contact-message";

export const contactMessageService = {
  async list(query: AdminContactMessageQuery = {}): Promise<Paginated<ContactMessage>> {
    const params = new URLSearchParams();
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));
    if (query.sort) params.set("sort", query.sort);
    if (query.q) params.set("q", query.q);
    if (query.status && query.status !== "all") params.set("status", query.status);

    return apiRequest<Paginated<ContactMessage>>(
      `/api/contact-messages${params.toString() ? `?${params.toString()}` : ""}`,
    );
  },
  async getById(id: string): Promise<ContactMessage> {
    return apiRequest<ContactMessage>(`/api/contact-messages/${id}`);
  },
  async updateStatus(id: string, status: ContactMessageStatus): Promise<ContactMessage> {
    return apiRequest<ContactMessage>(`/api/contact-messages/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
  async remove(id: string): Promise<ContactMessage> {
    return apiRequest<ContactMessage>(`/api/contact-messages/${id}`, {
      method: "DELETE",
    });
  },
  async stats(): Promise<ContactMessageStats> {
    return apiRequest<ContactMessageStats>("/api/contact-messages/stats");
  },
};
