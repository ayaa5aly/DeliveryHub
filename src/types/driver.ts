export type DriverStatus = "active" | "inactive" | "pending" | "suspended";

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  vehicleType: string;
  status: DriverStatus;
  rating: number;
  totalDeliveries: number;
  joinedAt: string;
}

export interface DriversState {
  items: Driver[];
  isLoading: boolean;
  error: string | null;
}
