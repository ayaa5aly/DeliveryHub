import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { revenueService } from "@/services/revenue.service";
import type { RevenueState } from "@/types/revenue";

const initialState: RevenueState = {
  records: [],
  summary: null,
  isLoading: false,
  error: null,
};

export const fetchRevenue = createAsyncThunk("revenue/fetchAll", async () => {
  const [records, summary] = await Promise.all([
    revenueService.getRecords(),
    revenueService.getSummary(),
  ]);
  return { records, summary };
});

const revenueSlice = createSlice({
  name: "revenue",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRevenue.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRevenue.fulfilled, (state, action) => {
        state.isLoading = false;
        state.records = action.payload.records;
        state.summary = action.payload.summary;
      })
      .addCase(fetchRevenue.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? "Failed to load revenue";
      });
  },
});

export default revenueSlice.reducer;
