import api from "./api";
import type { AuthResponse, LoginCredentials } from "@/types/auth";

const TOKEN_KEY = "dh_token";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/login", credentials);
    localStorage.setItem(TOKEN_KEY, data.tokens.accessToken);
    return data;
  },

  async logout(): Promise<void> {
    localStorage.removeItem(TOKEN_KEY);
    await api.post("/auth/logout").catch(() => undefined);
  },

  async getCurrentUser(): Promise<AuthResponse["user"]> {
    const { data } = await api.get<AuthResponse["user"]>("/auth/me");
    return data;
  },

  getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
};
