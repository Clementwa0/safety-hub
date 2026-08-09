export type UserRole = "admin" | "staff";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: number;
  updatedAt?: number;
}

export interface UserInput {
  name: string;
  email: string;
  /** Only required when creating a new user; omitted on role/name edits. */
  password?: string;
  role: UserRole;
}
