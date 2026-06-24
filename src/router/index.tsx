/**
 * Route paths used throughout the admin dashboard.
 * Next.js App Router handles the actual routing via src/app/.
 * Import ROUTES wherever you need a type-safe path string.
 */
export const ROUTES = {
  login: "/login",
  dashboard: "/dashboard",
  users: "/users",
  drivers: "/drivers",
  shipments: "/shipments",
  disputes: "/disputes",
  escrow: "/escrow",
  offices: "/offices",
  revenue: "/revenue",
  settings: "/settings",
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
