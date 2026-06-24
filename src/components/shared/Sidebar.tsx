import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Truck,
  Package,
  AlertTriangle,
  Lock,
  Building2,
  DollarSign,
  Settings,
  Ship,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const { t } = useTranslation();

  const menuItems = [
    { label: t("nav.dashboard"), href: "/dashboard", icon: LayoutDashboard },
    { label: t("nav.users"), href: "/users", icon: Users },
    { label: t("nav.drivers"), href: "/drivers", icon: Truck },
    { label: t("nav.shipments"), href: "/shipments", icon: Package },
    { label: t("nav.disputes"), href: "/disputes", icon: AlertTriangle },
    { label: t("nav.escrow"), href: "/escrow", icon: Lock },
    { label: t("nav.offices"), href: "/offices", icon: Building2 },
    { label: t("nav.revenue"), href: "/revenue", icon: DollarSign },
    { label: t("nav.settings"), href: "/settings", icon: Settings },
  ];

  return (
    <aside
      className={cn(
        "flex flex-col w-64 h-screen bg-zinc-950 border-r border-zinc-800 text-zinc-400 p-4 shrink-0 justify-between",
        className,
      )}
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 px-3 py-2 text-blue-500 font-bold text-xl">
          <Ship className="h-6 w-6 stroke-[2.5]" />
          <span>DeliveryHub</span>
        </div>

        <nav className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-3 mb-2">
            {t("nav.menu")}
          </span>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:text-zinc-200 hover:bg-zinc-900",
                    isActive
                      ? "bg-blue-600/10 text-blue-500 hover:bg-blue-600/15 hover:text-blue-400"
                      : "text-zinc-400",
                  )
                }
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="px-3 text-xs text-zinc-600">
        <p>© 2026 DeliveryHub</p>
      </div>
    </aside>
  );
}
