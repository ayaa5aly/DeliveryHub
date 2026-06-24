import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { OfficesState } from "@/types/office";

const initialState: OfficesState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchOffices = createAsyncThunk("offices/fetchAll", async () => {
  return [] as OfficesState["items"];
});

const officesSlice = createSlice({
  name: "offices",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOffices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOffices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchOffices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? "Failed to load offices";
      });
  },
});

export default officesSlice.reducer;
