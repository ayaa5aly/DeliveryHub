// Customer-facing shipments API
import api from "@/lib/api/client";
import type { Shipment } from "@/features/shipments/types";
import type { ApiResponse } from "@/shared/types/api";
import type {
  CreateShipmentRequest,
  UpdateShipmentRequest,
  CancelShipmentRequest,
} from "@/features/shipments/types/dtos";

export function mapShipment(s: any): Shipment {
  return {
    id: s._id || s.id,
    trackingNumber: s.trackingNumber || "",
    pickupAddress: s.pickupAddress || "",
    deliveryAddress: s.deliveryAddress || "",
    pickupCoords: s.pickupCoords || [0, 0],
    deliveryCoords: s.deliveryCoords || [0, 0],
    weight: s.weight || 0,
    packageType: s.packageType || "small_box",
    deliverySpeed: s.deliverySpeed || "standard",
    notes: s.notes || undefined,
    status: s.status || "pending_offers",
    distanceKm: s.distanceKm || 0,
    estimatedPriceMin: s.estimatedPriceMin || 0,
    estimatedPriceMax: s.estimatedPriceMax || 0,
    price: s.price || s.estimatedPriceMax || undefined,
    createdAt: s.createdAt || new Date().toISOString(),
    etaDescription: s.etaDescription || s.selectedOfferId?.estimatedDelivery || undefined,
    pickedUpTime: s.pickedUpTime || undefined,
    deliveryProgressPercent: s.deliveryProgressPercent || 0,
    selectedOfferId: s.selectedOfferId?._id || s.selectedOfferId || undefined,
    captain: s.captain ? {
      id: s.captain._id || s.captain.id,
      name: s.captain.fullName || s.captain.name || "",
      phone: s.captain.phone || "",
      avatar: s.captain.profileImage || s.captain.avatar || undefined,
      rating: s.captain.rating || undefined,
      reviewsCount: s.captain.reviewsCount || undefined,
    } : undefined,
  };
}

// ── Shipment CRUD ─────────────────────────────────────────────────────────────

export async function getShipments(): Promise<Shipment[]> {
  const response = await api.get<ApiResponse<{ shipments: any[] }>>("/api/shipments");
  const shipments = response.data.data?.shipments || [];
  return shipments.map(mapShipment);
}

export async function getShipmentById(id: string): Promise<Shipment> {
  const response = await api.get<ApiResponse<any>>(`/api/shipments/${id}`);
  return mapShipment(response.data.data);
}

export async function createShipment(
  payload: CreateShipmentRequest,
): Promise<Shipment> {
  const response = await api.post<ApiResponse<any>>(
    "/api/shipments",
    payload,
  );
  return mapShipment(response.data.data);
}

export async function updateShipment(
  id: string,
  payload: UpdateShipmentRequest,
): Promise<Shipment> {
  const response = await api.put<ApiResponse<any>>(
    `/api/shipments/${id}`,
    payload,
  );
  return mapShipment(response.data.data);
}

export async function cancelShipment(
  id: string,
  payload?: CancelShipmentRequest,
): Promise<void> {
  await api.patch<ApiResponse<void>>(`/api/shipments/${id}/cancel`, payload);
}
