import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { shipmentsService } from "@/services/shipments.service";
import type { ShipmentsState } from "@/types/shipment";

const initialState: ShipmentsState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchShipments = createAsyncThunk("shipments/fetchAll", async () => {
  return shipmentsService.getAll();
});

const shipmentsSlice = createSlice({
  name: "shipments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchShipments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchShipments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchShipments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? "Failed to load shipments";
      });
  },
});

export default shipmentsSlice.reducer;
