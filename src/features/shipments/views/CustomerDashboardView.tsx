"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, Package, Plus, Star, Wallet } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { mockCustomer, mockShipments } from "@/constants/mock-data";
import ShipmentCard from "../components/shipment-card";
import StatCard from "@/shared/ui/StatCard";
import { getCustomerProfile } from "@/features/profile";
import { getShipments } from "@/features/shipments/api";
import type { Shipment } from "@/features/shipments/types";
import { getWallet } from "@/features/wallet/api";
import { getReviews } from "@/features/reviews/api";
import { getCurrentUser } from "@/features/auth/api";

import { useState, useEffect } from "react";

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <div className="h-7 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-3/4" />
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-1/2" />
        </div>
        <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-32 shrink-0" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-[var(--dh-bg-card)] border border-[var(--dh-border)] rounded-xl p-5 flex flex-col justify-between" >
            <div className="flex justify-between items-start">
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-20" />
              <div className="h-8 w-8 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="space-y-2 mt-2">
              <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-12" />
              <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-24" />
            </div>
          </div>
        ))}
      </div>

      {/* Shipments List Skeleton */}
      <div className="flex flex-col gap-4.5 mt-2">
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-36" />
        <div className="flex flex-col gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-[var(--dh-bg-card)] border border-[var(--dh-border)] rounded-xl p-5 flex flex-col justify-between" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CustomerDashboardView() {
  const t = useTranslations("customer.dashboard");
  const locale = useLocale();
  const router = useRouter();
  const [formattedDate, setFormattedDate] = useState("");
  const [customerName, setCustomerName] = useState(mockCustomer.name.split(" ")[0]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [walletBalance, setWalletBalance] = useState("EGP 0");
  const [averageRating, setAverageRating] = useState("5.0");
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const activeShipments = shipments.filter(
    (shipment) =>
      shipment.status === "in_transit" ||
      shipment.status === "captain_assignment" ||
      shipment.status === "pending_offers"
  );

  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        if (!user.isVerified) {
          router.replace(`/verify-otp?phone=${user.phone}`);
          return;
        }
        if ((user.role as string) === "customer" || user.role === "admin") {
          setAuthorized(true);
        } else if ((user.role as string) === "driver" || (user.role as string) === "office") {
          router.replace("/captain-dashboard");
        } else {
          router.replace("/login");
        }
        setCheckingAuth(false);
      })
      .catch((err) => {
        console.error("Unauthorized access to customer dashboard:", err);
        router.replace("/login");
        setCheckingAuth(false);
      });
  }, [router]);

  useEffect(() => {
    const today = new Date();
    setFormattedDate(
      today.toLocaleDateString(
        locale === "ar" ? "ar-EG" : "en-US",
        {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      )
    );
  }, [locale]);

  useEffect(() => {
    if (!authorized) return;

    Promise.all([
      getCustomerProfile().then(data => data.name).catch(() => mockCustomer.name),
      getShipments().catch(err => {
        console.error("Failed to load shipments, using mock:", err);
        return mockShipments;
      }),
      getWallet().then(w => `EGP ${w.balance}`).catch(err => {
        console.error("Failed to load wallet, using mock:", err);
        return "EGP 320";
      }),
      getReviews().then(res => {
        return res && typeof res.averageRating === "number" ? res.averageRating.toFixed(1) : "5.0";
      }).catch(err => {
        console.error("Failed to load reviews, using mock:", err);
        return "4.6";
      })
    ]).then(([name, loadedShipments, balance, ratingVal]) => {
      if (name) {
        setCustomerName(name.split(" ")[0]);
      }
      setShipments(loadedShipments);
      setWalletBalance(balance);
      setAverageRating(ratingVal);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [authorized]);

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--dh-bg-app)] text-[var(--dh-text-sub)] text-sm font-semibold animate-pulse">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-t-[var(--dh-brand)] border-[var(--dh-border)] animate-spin" />
          <span>{locale === 'ar' ? 'جاري التحقق من الصلاحيات...' : 'Verifying permissions...'}</span>
        </div>
      </div>
    );
  }

  if (!authorized || loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex flex-col gap-8 text-[var(--dh-text-main)] max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--dh-text-main)]">
            {t("greeting", { name: customerName })}
          </h1>
          <p className="text-xs text-[var(--dh-text-muted)] font-semibold">{formattedDate}</p>
        </div>

        <Link
          href="/shipments/new"
          className="flex items-center gap-2 px-4.5 py-2.5 rounded-lg text-xs font-bold bg-[var(--dh-brand)] hover:bg-[var(--dh-brand-hover)] text-white transition-all duration-200 shadow-md focus:outline-none hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>{t("newShipment")}</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t("totalShipped")}
          value={shipments.length.toString()}
          icon={Package}
          description={t("totalShippedDescription")}
          colorClass="text-[var(--dh-text-main)]"
          iconColorClass="text-[var(--dh-text-sub)] bg-[var(--dh-bg-muted)] border-[var(--dh-border)]"
        />
        <StatCard
          title={t("activeNow")}
          value={activeShipments.length.toString()}
          icon={Clock}
          description={t("activeNowDescription")}
          colorClass="text-[var(--dh-brand)]"
          iconColorClass="text-[var(--dh-brand)] bg-[var(--dh-brand-subtle)] border-[var(--dh-brand)]/20"
        />
        <StatCard
          title={t("walletBalance")}
          value={walletBalance}
          icon={Wallet}
          description={t("walletDescription")}
          colorClass="text-[var(--dh-success)]"
          iconColorClass="text-[var(--dh-success)] bg-[var(--dh-success)]/10 border-[var(--dh-success)]/20"
          href="/wallet"
        />
        <StatCard
          title={t("averageRating")}
          value={`${averageRating} ★`}
          icon={Star}
          description={t("ratingDescription")}
          colorClass="text-[var(--dh-accent)]"
          iconColorClass="text-[var(--dh-accent)] bg-[var(--dh-accent)]/10 border-[var(--dh-accent)]/20"
          href="/reviews"
        />
      </div>

      <div className="flex flex-col gap-4.5 mt-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--dh-text-muted)]">
          {t("activeShipments")}
        </h2>

        {activeShipments.length > 0 ? (
          <div className="flex flex-col gap-4">
            {activeShipments.map((shipment) => (
              <ShipmentCard key={shipment.id} shipment={shipment} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-[var(--dh-bg-card)] border border-[var(--dh-border)] border-dashed rounded-xl text-center shadow-sm">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-[var(--dh-brand-subtle)] text-[var(--dh-brand)] mb-4">
              <Package className="h-6 w-6 stroke-[1.5]" />
            </div>
            <h3 className="text-sm font-bold text-[var(--dh-text-main)] mb-1">
              {locale === "ar" ? "لا توجد شحنات نشطة حالياً" : "No active shipments"}
            </h3>
            <p className="text-xs text-[var(--dh-text-muted)] max-w-sm mb-4">
              {t("noActive")}
            </p>
            <Link
              href="/shipments/new"
              className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-lg text-xs font-bold bg-[var(--dh-brand)] hover:bg-[var(--dh-brand-hover)] text-white transition-all duration-200 shadow-md focus:outline-none hover:-translate-y-0.5"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>{t("requestShipment")}</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
