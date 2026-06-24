export interface RevenueRecord {
  id: string;
  period: string;
  totalRevenue: number;
  platformFee: number;
  driverPayouts: number;
  officePayouts: number;
  transactionCount: number;
}

export interface RevenueState {
  records: RevenueRecord[];
  summary: {
    totalRevenue: number;
    platformFee: number;
    growthRate: number;
  } | null;
  isLoading: boolean;
  error: string | null;
}
