import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { usersService } from "@/services/users.service";
import type { UsersState } from "@/types/user";

const initialState: UsersState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk("users/fetchAll", async () => {
  return usersService.getAll();
});

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? "Failed to load users";
      });
  },
});

export default usersSlice.reducer;
