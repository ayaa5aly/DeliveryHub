import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { DriversState } from "@/types/driver";

const initialState: DriversState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchDrivers = createAsyncThunk("drivers/fetchAll", async () => {
  return [] as DriversState["items"];
});

const driversSlice = createSlice({
  name: "drivers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDrivers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDrivers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchDrivers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? "Failed to load drivers";
      });
  },
});

export default driversSlice.reducer;
