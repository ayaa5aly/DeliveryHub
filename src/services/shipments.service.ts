import api from "./api";
import type { Shipment } from "@/types/shipment";

export const shipmentsService = {
  async getAll(): Promise<Shipment[]> {
    const { data } = await api.get<Shipment[]>("/shipments");
    return data;
  },

  async getById(id: string): Promise<Shipment> {
    const { data } = await api.get<Shipment>(`/shipments/${id}`);
    return data;
  },

  async updateStatus(id: string, status: Shipment["status"]): Promise<Shipment> {
    const { data } = await api.patch<Shipment>(`/shipments/${id}/status`, { status });
    return data;
  },
};
