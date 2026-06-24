import { createBrowserRouter, Navigate } from "react-router-dom";
import AdminLayout from "@/components/shared/AdminLayout";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import Login from "@/pages/auth/Login";
import Dashboard from "@/pages/dashboard/Dashboard";
import Disputes from "@/pages/disputes/Disputes";
import Drivers from "@/pages/drivers/Drivers";
import Escrow from "@/pages/escrow/Escrow";
import Offices from "@/pages/offices/Offices";
import Revenue from "@/pages/revenue/Revenue";
import Settings from "@/pages/settings/Settings";
import Shipments from "@/pages/shipments/Shipments";
import Users from "@/pages/users/Users";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "users", element: <Users /> },
      { path: "drivers", element: <Drivers /> },
      { path: "shipments", element: <Shipments /> },
      { path: "disputes", element: <Disputes /> },
      { path: "escrow", element: <Escrow /> },
      { path: "offices", element: <Offices /> },
      { path: "revenue", element: <Revenue /> },
      { path: "settings", element: <Settings /> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);
