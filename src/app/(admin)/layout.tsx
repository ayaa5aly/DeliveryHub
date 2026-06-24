"use client";

import ProtectedRoute from "@/components/shared/ProtectedRoute";
import AdminLayout from "@/components/shared/AdminLayout";

export default function AdminRouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}
