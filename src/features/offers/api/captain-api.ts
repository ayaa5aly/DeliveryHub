// Captain/Office-facing offers API
import api from "@/lib/api/client";
import type { ProviderOffer } from "@/features/offers/types";
import type { ApiResponse } from "@/shared/types/api";
import type { SubmitOfferRequest } from "@/features/offers/types/dtos";
import { mockProviderDashboardData } from "@/features/captain/data/mock-dashboard-data";

// ── Captain Offers API ────────────────────────────────────────────────────────

export async function getCaptainOffers(): Promise<ProviderOffer[]> {
  try {
    const response = await api.get<ApiResponse<any[]>>(
      "/api/offers/mine",
    );
    const offers = Array.isArray(response.data?.data) ? response.data.data : [];
    return offers.map((o: any) => ({
      id: o._id,
      requestId: o.shipment && typeof o.shipment === 'object'
        ? (o.shipment.trackingNumber || o.shipment._id || 'Shipment')
        : (o.shipment || 'Shipment'),
      quoteEGP: o.price,
      status: o.status || "pending",
      createdAt: o.createdAt,
    }));
  } catch (error) {
    throw error;
  }
}

export async function submitOffer(
  payload: SubmitOfferRequest,
): Promise<ProviderOffer> {
  const response = await api.post<ApiResponse<any>>(
    "/api/offers/create",
    {
      shipmentId: payload.requestId,
      price: payload.quoteEGP,
      estimatedDelivery: payload.estimatedDelivery || "2 hours",
      coverage: payload.coverage || "None",
      description: payload.description || "Custom offer from driver dashboard",
    },
  );
  
  const o = response.data.data;
  return {
    id: o._id,
    requestId: o.shipment && typeof o.shipment === 'object'
      ? (o.shipment.trackingNumber || o.shipment._id || 'Shipment')
      : (o.shipment || 'Shipment'),
    quoteEGP: o.price,
    status: o.status || "pending",
  };
}

export async function withdrawOffer(offerId: string): Promise<void> {
  // Not supported on the backend; mock success
  console.log("Withdrawing offer (local mock):", offerId);
}
