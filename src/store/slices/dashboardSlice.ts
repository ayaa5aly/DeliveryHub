import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { DashboardState } from "@/types/dashboard";

const initialState: DashboardState = {
  stats: null,
  isLoading: false,
  error: null,
};

export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchStats",
  async () => {
    // Replace with real API when backend is ready
    return {
      totalUsers: 1248,
      activeDrivers: 342,
      totalShipments: 5891,
      totalRevenue: 284500,
      pendingDisputes: 12,
      escrowBalance: 45600,
    };
  },
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? "Failed to load dashboard";
      });
  },
});

export default dashboardSlice.reducer;
