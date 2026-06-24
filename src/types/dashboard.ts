export interface DashboardStats {
  totalUsers: number;
  activeDrivers: number;
  totalShipments: number;
  totalRevenue: number;
  pendingDisputes: number;
  escrowBalance: number;
}

export interface DashboardState {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
}
