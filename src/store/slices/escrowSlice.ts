import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { escrowService } from "@/services/escrow.service";
import type { EscrowState } from "@/types/escrow";

const initialState: EscrowState = {
  items: [],
  totalHeld: 0,
  isLoading: false,
  error: null,
};

export const fetchEscrow = createAsyncThunk("escrow/fetchAll", async () => {
  const items = await escrowService.getAll();
  const totalHeld = items
    .filter((t) => t.status === "held")
    .reduce((sum, t) => sum + t.amount, 0);
  return { items, totalHeld };
});

const escrowSlice = createSlice({
  name: "escrow",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEscrow.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEscrow.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.totalHeld = action.payload.totalHeld;
      })
      .addCase(fetchEscrow.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? "Failed to load escrow";
      });
  },
});

export default escrowSlice.reducer;
