export type UserStatus = "active" | "inactive" | "suspended";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "customer" | "driver";
  status: UserStatus;
  isVerified: boolean;
  createdAt: string;
}

export interface UsersState {
  items: AdminUser[];
  isLoading: boolean;
  error: string | null;
}
