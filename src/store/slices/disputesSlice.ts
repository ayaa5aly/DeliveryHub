import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { DisputesState } from "@/types/dispute";

const initialState: DisputesState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchDisputes = createAsyncThunk("disputes/fetchAll", async () => {
  return [] as DisputesState["items"];
});

const disputesSlice = createSlice({
  name: "disputes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDisputes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDisputes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchDisputes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? "Failed to load disputes";
      });
  },
});

export default disputesSlice.reducer;
