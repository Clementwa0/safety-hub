export type UserRole = "admin" | "staff";
export type UserStatus = "active" | "suspended";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: number;
  updatedAt?: number;
}

export interface CreateStaffInput {
  name: string;
  email: string;
  password: string;
  role: "staff";
}

export interface UpdateUserInput {
  name?: string;
  status?: UserStatus;
  /** Omit to leave the password unchanged. */
  password?: string;
}
