import api from "./api";
import type { EscrowTransaction } from "@/types/escrow";

export const escrowService = {
  async getAll(): Promise<EscrowTransaction[]> {
    const { data } = await api.get<EscrowTransaction[]>("/escrow");
    return data;
  },

  async release(id: string): Promise<EscrowTransaction> {
    const { data } = await api.post<EscrowTransaction>(`/escrow/${id}/release`);
    return data;
  },

  async refund(id: string): Promise<EscrowTransaction> {
    const { data } = await api.post<EscrowTransaction>(`/escrow/${id}/refund`);
    return data;
  },
};
