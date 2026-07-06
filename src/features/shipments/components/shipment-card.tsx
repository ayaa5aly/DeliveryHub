"use client";

import Link from "next/link";
import { Eye, Navigation } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import type { Shipment, ShipmentStatus } from "@/features/shipments/types";

interface ShipmentCardProps {
  shipment: Shipment;
}

export default function ShipmentCard({ shipment }: ShipmentCardProps) {
  const t = useTranslations("customer.shipments");
  const locale = useLocale();
  const {
    id,
    trackingNumber,
    pickupAddress,
    deliveryAddress,
    status,
    captain,
    pickedUpTime,
    deliveryProgressPercent = 0,
    etaDescription,
  } = shipment;

  const statusStyles: Record<ShipmentStatus, string> = {
    in_transit: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/30",
    captain_assignment: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/30",
    delivered: "bg-green-50 text-green-700 border-green-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/30",
    pending_offers: "bg-slate-50 text-slate-700 border-slate-100 dark:bg-zinc-800/40 dark:text-zinc-400 dark:border-zinc-700/30",
    picked_up: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/30",
    out_for_delivery: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/30",
    cancelled: "bg-red-50 text-red-700 border-red-100 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/30",
  };

  const statusLabels: Record<ShipmentStatus, string> = {
    in_transit: t("inTransit"),
    captain_assignment: captain ? t("captainAssigned") : t("captainAssignment"),
    delivered: t("delivered"),
    pending_offers: t("pendingOffers"),
    picked_up: t("offerAccepted"),
    out_for_delivery: t("outForDelivery"),
    cancelled: t("cancelled"),
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "9:00 AM";
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return timeStr;
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="bg-[var(--dh-bg-card)] border border-[var(--dh-border)] hover:border-[var(--dh-brand)] transition-all duration-300 rounded-xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[var(--dh-text-muted)]">
              {trackingNumber}
            </span>
            <span className="text-[var(--dh-border)]">·</span>
            <div className="flex items-center gap-1.5 text-[var(--dh-text-main)] font-semibold text-base">
              <span>{pickupAddress.split(",")[0]}</span>
              <span className="text-[var(--dh-text-muted)] font-normal">{locale === 'ar' ? '←' : '→'}</span>
              <span>{deliveryAddress.split(",")[0]}</span>
            </div>
          </div>
          <div className="text-xs text-[var(--dh-text-sub)]">
            {status === "captain_assignment" && !captain ? (
              <span className="text-[var(--dh-text-muted)] font-medium">
                Nour Logistics · {t("awaitingCaptain")}
              </span>
            ) : (
              <div className="flex items-center gap-2.5">
                {/* Captain/Office avatar */}
                <div className="shrink-0">
                  {captain?.avatar ? (
                    <img
                      src={captain.avatar}
                      alt={captain.name}
                      className="h-9 w-9 rounded-full object-cover border-2 border-[var(--dh-border)]"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-[var(--dh-brand-subtle)] border border-[var(--dh-brand)]/30 flex items-center justify-center text-[var(--dh-brand)] font-bold text-xs">
                      {captain?.name
                        ? captain.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
                        : "?"}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-[var(--dh-text-main)] text-xs">
                    {captain?.name || t("unassigned")}
                  </span>
                  <span className="text-[10px] text-[var(--dh-text-muted)]">
                    {t("eta", { time: etaDescription || t("etaDuration") })}
                  </span>
                  {captain?.phone && (
                    <span className="text-[10px] text-[var(--dh-text-muted)] flex items-center gap-1 font-medium">
                      📞 {captain.phone}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusStyles[status]}`}
          >
            {status === "in_transit" && (
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--dh-brand)] animate-pulse" />
            )}
            {status === "captain_assignment" && captain
              ? t("captainAssigned") ||
                (locale === "ar" ? "تم تعيين الكابتن" : "Captain Assigned")
              : statusLabels[status]}
          </span>
          {(status === "in_transit" || status === "picked_up" || status === "out_for_delivery" || (status === "captain_assignment" && captain)) && (
            <Link
              href={`/tracking/${id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--dh-bg-muted)] text-[var(--dh-text-sub)] border border-[var(--dh-border)] hover:bg-[var(--dh-bg-muted)]/80 transition-all duration-200"
            >
              <Navigation className="h-3.5 w-3.5 rotate-45" />
              {t("track")}
            </Link>
          )}
          {status === "pending_offers" && (
            <Link
              href={`/offers/${id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--dh-brand)] text-white hover:bg-[var(--dh-brand-hover)] transition-all duration-200"
            >
              <Eye className="h-3.5 w-3.5" />
              {t("viewOffers")}
            </Link>
          )}
        </div>
      </div>

      {status === "in_transit" && (
        <div className="flex flex-col gap-2 mt-1">
          <div className="h-1.5 w-full bg-[var(--dh-bg-muted)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--dh-brand)] rounded-full transition-all duration-500"
              style={{ width: `${deliveryProgressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-[var(--dh-text-muted)] mt-1 font-medium">
            <span>{t("pickedUp", { time: formatTime(pickedUpTime) })}</span>
            <span className="text-[var(--dh-brand)] font-semibold">
              {t("delivering", { progress: deliveryProgressPercent })}
            </span>
            <span>
              {t("eta", { time: etaDescription || t("etaDuration") })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
