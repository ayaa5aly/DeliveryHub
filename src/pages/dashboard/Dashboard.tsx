import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Users,
  Truck,
  Package,
  DollarSign,
  AlertTriangle,
  Lock,
} from "lucide-react";
import StatCard from "@/components/shared/StatCard";
import Spinner from "@/components/ui/Spinner";
import { useTranslation } from "@/i18n";
import { fetchDashboardStats } from "@/store/slices/dashboardSlice";
import type { AppDispatch, RootState } from "@/store";

export default function Dashboard() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { stats, isLoading } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" className="text-blue-500" />
      </div>
    );
  }

  const cards = [
    { title: t("dashboard.totalUsers"), value: stats.totalUsers, icon: Users, href: "/users" },
    { title: t("dashboard.activeDrivers"), value: stats.activeDrivers, icon: Truck, href: "/drivers" },
    { title: t("dashboard.totalShipments"), value: stats.totalShipments, icon: Package, href: "/shipments" },
    {
      title: t("dashboard.totalRevenue"),
      value: `${stats.totalRevenue.toLocaleString()} ${t("common.currency")}`,
      icon: DollarSign,
      href: "/revenue",
    },
    { title: t("dashboard.pendingDisputes"), value: stats.pendingDisputes, icon: AlertTriangle, href: "/disputes" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-100">{t("dashboard.title")}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map((card) => (
          <StatCard key={card.href} {...card} />
        ))}
        <StatCard
          title={t("dashboard.escrowBalance")}
          value={`${stats.escrowBalance.toLocaleString()} ${t("common.currency")}`}
          icon={Lock}
          href="/escrow"
        />
      </div>
    </div>
  );
}
