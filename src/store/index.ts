import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import dashboardReducer from "./slices/dashboardSlice";
import disputesReducer from "./slices/disputesSlice";
import driversReducer from "./slices/driversSlice";
import escrowReducer from "./slices/escrowSlice";
import officesReducer from "./slices/officesSlice";
import revenueReducer from "./slices/revenueSlice";
import shipmentsReducer from "./slices/shipmentsSlice";
import uiReducer from "./slices/uiSlice";
import usersReducer from "./slices/usersSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    disputes: disputesReducer,
    drivers: driversReducer,
    escrow: escrowReducer,
    offices: officesReducer,
    revenue: revenueReducer,
    shipments: shipmentsReducer,
    ui: uiReducer,
    users: usersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
