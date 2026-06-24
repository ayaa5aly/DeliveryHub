import api from "./api";
import type { AdminUser } from "@/types/user";

export const usersService = {
  async getAll(): Promise<AdminUser[]> {
    const { data } = await api.get<AdminUser[]>("/users");
    return data;
  },

  async getById(id: string): Promise<AdminUser> {
    const { data } = await api.get<AdminUser>(`/users/${id}`);
    return data;
  },

  async updateStatus(id: string, status: AdminUser["status"]): Promise<AdminUser> {
    const { data } = await api.patch<AdminUser>(`/users/${id}/status`, { status });
    return data;
  },
};
