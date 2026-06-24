export type DisputeStatus = "open" | "under_review" | "resolved" | "closed";

export interface Dispute {
  id: string;
  shipmentId: string;
  raisedBy: string;
  reason: string;
  status: DisputeStatus;
  amount: number;
  createdAt: string;
  resolvedAt?: string;
}

export interface DisputesState {
  items: Dispute[];
  isLoading: boolean;
  error: string | null;
}
