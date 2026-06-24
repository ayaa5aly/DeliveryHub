import api from "./api";
import type { RevenueRecord } from "@/types/revenue";

export const revenueService = {
  async getRecords(): Promise<RevenueRecord[]> {
    const { data } = await api.get<RevenueRecord[]>("/revenue");
    return data;
  },

  async getSummary(): Promise<{
    totalRevenue: number;
    platformFee: number;
    growthRate: number;
  }> {
    const { data } = await api.get("/revenue/summary");
    return data;
  },
};
