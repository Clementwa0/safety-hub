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
  password?: string;
  role: UserRole;
}
