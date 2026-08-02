export const CONTACT_MESSAGE_STATUSES = ["new", "read", "replied", "archived"] as const;

export type ContactMessageStatus = (typeof CONTACT_MESSAGE_STATUSES)[number];

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessageStats {
  total: number;
  new: number;
  read: number;
  replied: number;
  archived: number;
}

export interface AdminContactMessageQuery {
  page?: number;
  limit?: number;
  sort?: string;
  q?: string;
  status?: ContactMessageStatus | "all";
}

export interface Paginated<T> {
  items: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}
