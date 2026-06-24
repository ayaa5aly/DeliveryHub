export type EscrowStatus = "held" | "released" | "refunded" | "disputed";

export interface EscrowTransaction {
  id: string;
  shipmentId: string;
  amount: number;
  status: EscrowStatus;
  payerId: string;
  payeeId: string;
  createdAt: string;
  releasedAt?: string;
}

export interface EscrowState {
  items: EscrowTransaction[];
  totalHeld: number;
  isLoading: boolean;
  error: string | null;
}
