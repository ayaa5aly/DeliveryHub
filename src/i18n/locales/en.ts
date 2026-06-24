export const en = {
  common: {
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    search: "Search",
    actions: "Actions",
    noData: "No data available",
    currency: "EGP",
  },
  auth: {
    login: "Sign in",
    email: "Email",
    password: "Password",
    rememberMe: "Remember me",
    forgotPassword: "Forgot password?",
    signIn: "Sign in",
    loginSubtitle: "Enter your credentials to access the admin panel",
    showPassword: "Show password",
    hidePassword: "Hide password",
    signOut: "Sign out",
  },
  nav: {
    dashboard: "Dashboard",
    users: "Users",
    drivers: "Drivers",
    shipments: "Shipments",
    disputes: "Disputes",
    escrow: "Escrow",
    offices: "Offices",
    revenue: "Revenue",
    settings: "Settings",
    menu: "Menu",
    searchPlaceholder: "Search users, shipments, drivers...",
    admin: "Administrator",
    myProfile: "My profile",
    accountSettings: "Account settings",
  },
  dashboard: {
    title: "Dashboard",
    totalUsers: "Total users",
    activeDrivers: "Active drivers",
    totalShipments: "Total shipments",
    totalRevenue: "Total revenue",
    pendingDisputes: "Pending disputes",
    escrowBalance: "Escrow balance",
  },
  users: { title: "Users" },
  drivers: { title: "Drivers" },
  shipments: { title: "Shipments" },
  disputes: { title: "Disputes" },
  escrow: { title: "Escrow" },
  offices: { title: "Offices" },
  revenue: { title: "Revenue" },
  settings: { title: "Settings" },
} as const;

type DeepStringMap<T> = {
  [K in keyof T]: T[K] extends object ? DeepStringMap<T[K]> : string;
};

export type TranslationKeys = DeepStringMap<typeof en>;
