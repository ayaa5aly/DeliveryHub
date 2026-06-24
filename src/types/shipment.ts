export type ShipmentStatus =
  | "pending"
  | "assigned"
  | "in_transit"
  | "delivered"
  | "cancelled";

export interface Shipment {
  id: string;
  trackingNumber: string;
  customerId: string;
  driverId?: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  price: number;
  createdAt: string;
  deliveredAt?: string;
}

export interface ShipmentsState {
  items: Shipment[];
  isLoading: boolean;
  error: string | null;
}
