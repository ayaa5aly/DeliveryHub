export type OfficeStatus = "active" | "inactive" | "pending";

export interface Office {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  status: OfficeStatus;
  captainCount: number;
  rating: number;
  joinedAt: string;
}

export interface OfficesState {
  items: Office[];
  isLoading: boolean;
  error: string | null;
}
