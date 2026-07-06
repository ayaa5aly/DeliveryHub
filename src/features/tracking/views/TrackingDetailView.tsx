"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Phone, MessageSquare, Ship, Navigation } from "lucide-react";
import { mockShipments, mockOffers } from "@/constants/mock-data";
import TrackingTimeline from "../components/tracking-timeline";
import { useTranslations, useLocale } from "next-intl";
import { getShipmentById } from "@/features/shipments/api";
import { getOffersForShipment } from "@/features/offers/api";
import { getTrackingDetails } from "@/features/tracking/api";
import type { Shipment } from "@/features/shipments/types";
import type { Offer } from "@/features/offers/types";
import type { TrackingMilestone } from "../types";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/shared/ui/MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-[380px] w-full bg-zinc-950 flex items-center justify-center text-xs text-zinc-500 font-semibold border border-zinc-800 rounded-xl">
      Loading Live Tracking Map...
    </div>
  ),
});

interface TrackingDetailViewProps {
  id: string;
  offerId: string | null;
}

export default function TrackingDetailView({ id, offerId }: TrackingDetailViewProps) {
  const t = useTranslations("customer.tracking");
  const locale = useLocale();

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [captainCoords, setCaptainCoords] = useState<[number, number] | undefined>(undefined);
  const [trackingDetails, setTrackingDetails] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      getShipmentById(id).catch((err) => {
        console.error("Failed to fetch shipment details, checking mock fallback:", err);
        const mock = mockShipments.find(
          (s) =>
            s.id.toLowerCase() === id.toLowerCase() ||
            s.trackingNumber.toLowerCase() === id.toLowerCase()
        );
        if (mock) return mock;
        setError(t("notFound") || "Shipment not found");
        return null;
      }),
      getOffersForShipment(id).catch((err) => {
        console.error("Failed to fetch offers, using mock fallback:", err);
        return mockOffers;
      }),
    ]).then(([loadedShipment, loadedOffers]) => {
      if (loadedShipment) {
        setShipment(loadedShipment);
        setOffers(loadedOffers);
      }
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (!shipment?.id) return;

    const fetchLiveLocation = async () => {
      try {
        const details = await getTrackingDetails(shipment.id);
        if (details) {
          setTrackingDetails(details);
          if (details.currentLocation?.coords) {
            const [lng, lat] = details.currentLocation.coords;
            if (!isNaN(lat) && !isNaN(lng)) {
              setCaptainCoords([lat, lng]);
            }
          }

          setShipment((prev) => {
            if (!prev) return null;
            if (prev.status === details.status && prev.deliveryProgressPercent === details.progressPercent) {
              return prev;
            }
            return {
              ...prev,
              status: details.status || prev.status,
              deliveryProgressPercent: typeof details.progressPercent === 'number' ? details.progressPercent : prev.deliveryProgressPercent,
            };
          });
        }
      } catch (err) {
        console.error("Failed to fetch live location:", err);
      }
    };

    fetchLiveLocation();

    const inProgressStatuses = ["picked_up", "in_transit", "out_for_delivery"];
    if (inProgressStatuses.includes(shipment.status)) {
      const interval = setInterval(fetchLiveLocation, 5000);
      return () => clearInterval(interval);
    }
  }, [shipment?.id, shipment?.status]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-zinc-400 text-sm font-semibold">
        <span>{t("loading") || "Loading tracking details..."}</span>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-zinc-400 text-sm font-semibold gap-4">
        <span>{error || t("notFound") || "Shipment not found"}</span>
        <Link
          href="/tracking"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors shadow-md"
        >
          {locale === "ar" ? "العودة للتتبع" : "Back to Tracking"}
        </Link>
      </div>
    );
  }

  const captain = shipment.captain;
  const selectedOffer = offers.find((o) => o.id === offerId);
  const displayProvider = captain
    ? {
        name: captain.name,
        rating: captain.rating !== undefined ? captain.rating : 5.0,
        avatarUrl:
          captain.avatar &&
          (captain.avatar.startsWith("http") ||
            captain.avatar.startsWith("/") ||
            captain.avatar.startsWith("data:"))
            ? captain.avatar
            : null,
        initials: captain.name
          ? captain.name
              .split(" ")
              .map((w: string) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
          : "?",
        role: t("captain"),
        phone: captain.phone,
      }
    : selectedOffer
    ? {
        name: selectedOffer.providerName,
        rating: selectedOffer.providerRating,
        avatarUrl:
          selectedOffer.providerAvatar &&
          (selectedOffer.providerAvatar.startsWith("http") ||
            selectedOffer.providerAvatar.startsWith("/") ||
            selectedOffer.providerAvatar.startsWith("data:"))
            ? selectedOffer.providerAvatar
            : null,
        initials: selectedOffer.providerName
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2),
        role: selectedOffer.providerType === "office" ? t("office") : t("captain"),
        phone: undefined,
      }
    : null;

  const getStatus = (isCompleted: boolean, isActive: boolean): "completed" | "active" | "pending" => {
    if (isCompleted) return "completed";
    if (isActive) return "active";
    return "pending";
  };

  const formatMilestoneTime = (timestamp?: string) => {
    if (!timestamp) return undefined;
    const date = new Date(timestamp);
    return date.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
      month: "short",
      day: "numeric",
    }) + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMilestoneTime = (status: string, fallbackText?: string) => {
    if (!trackingDetails?.milestones) return fallbackText;
    const milestone = trackingDetails.milestones.find((m: any) => m.status === status);
    return milestone ? formatMilestoneTime(milestone.timestamp) : fallbackText;
  };

  const milestones: TrackingMilestone[] = [
    {
      step: 1,
      title: t("shipmentCreated") || "Shipment created",
      timestamp: shipment.createdAt ? formatMilestoneTime(shipment.createdAt) : "Just now",
      status: getStatus(true, shipment.status === "pending_offers"),
    },
    {
      step: 2,
      title: t("offerAccepted") || "Offer accepted",
      timestamp: getMilestoneTime("assigned", shipment.status !== "pending_offers" ? "Completed" : undefined),
      status: getStatus(shipment.status !== "pending_offers", shipment.status === "captain_assignment"),
    },
    {
      step: 3,
      title: t("packagePickedUp") || "Package picked up",
      timestamp: getMilestoneTime("picked_up", ["picked_up", "in_transit", "out_for_delivery", "delivered"].includes(shipment.status) ? "Completed" : undefined),
      status: getStatus(
        ["picked_up", "in_transit", "out_for_delivery", "delivered"].includes(shipment.status),
        shipment.status === "picked_up"
      ),
    },
    {
      step: 4,
      title: t("inTransit") || "In transit",
      timestamp: getMilestoneTime("in_transit", ["in_transit", "out_for_delivery", "delivered"].includes(shipment.status) ? "Completed" : undefined),
      status: getStatus(
        ["in_transit", "out_for_delivery", "delivered"].includes(shipment.status),
        ["in_transit", "out_for_delivery"].includes(shipment.status)
      ),
    },
    {
      step: 5,
      title: t("delivered") || "Delivered",
      timestamp: getMilestoneTime("delivered", shipment.status === "delivered" ? "Completed" : undefined),
      status: getStatus(
        shipment.status === "delivered",
        shipment.status === "delivered"
      ),
    },
  ];

  const parseCoords = (coords?: [number, number]): [number, number] | undefined => {
    if (!coords || coords.length < 2 || isNaN(coords[0]) || isNaN(coords[1])) return undefined;
    return [coords[1], coords[0]];
  };

  const parsedPickup = parseCoords(shipment.pickupCoords);
  const parsedDelivery = parseCoords(shipment.deliveryCoords);

  const computedEtaText = shipment.etaDescription || (() => {
    const distance = shipment.distanceKm || 0;
    const speed = shipment.deliverySpeed || "standard";
    if (speed === "scheduled") {
      return locale === "ar" ? "حسب الموعد المحدّد" : "As scheduled";
    }
    if (speed === "express") {
      if (distance < 50) return locale === "ar" ? "ساعة إلى ساعتين" : "1–2 hours";
      if (distance < 150) return locale === "ar" ? "ساعتان إلى 3 ساعات" : "2–3 hours";
      if (distance < 300) return locale === "ar" ? "4 إلى 5 ساعات" : "4–5 hours";
      return locale === "ar" ? "6 إلى 8 ساعات" : "6–8 hours";
    } else {
      if (distance < 50) return locale === "ar" ? "3 إلى 4 ساعات" : "3–4 hours";
      if (distance < 150) return locale === "ar" ? "5 إلى 6 ساعات" : "5–6 hours";
      if (distance < 300) return locale === "ar" ? "يوم واحد" : "1 day";
      return locale === "ar" ? "يومين" : "2 days";
    }
  })();

  return (
    <div className="flex flex-col gap-6 text-zinc-100 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
        <Link
          href="/dashboard"
          className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">
            {t("title")}
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            {t("subtitle")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7 flex flex-col gap-2 relative">
          <div className="flex justify-between items-center text-xs font-semibold text-zinc-500 mb-1">
            <span>{locale === 'ar' ? 'خريطة التتبع المباشر' : 'Live Tracking Map'}</span>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 bg-zinc-950/80 border border-zinc-850 px-2 py-0.5 rounded text-[10px] font-bold text-zinc-300 uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                {t("live")}
              </span>
              <span className="bg-zinc-950/80 border border-zinc-850 px-2 py-0.5 rounded text-[10px] font-bold text-zinc-300 uppercase tracking-wider">
                {locale === "ar" ? "الوصول المتوقع: " : "Estimated arrival: "} {computedEtaText}
              </span>
            </div>
          </div>
          <MapView
            pickupCoords={parsedPickup}
            deliveryCoords={parsedDelivery}
            captainCoords={captainCoords}
            zoom={13}
            height="380px"
          />
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-md flex-1 flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                <div className="flex flex-col">
                  <span className="text-base font-bold text-zinc-100">
                    {shipment.trackingNumber}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-medium">
                    {shipment.pickupAddress.split(",")[0]} {locale === 'ar' ? '⬅' : '➔'} {shipment.deliveryAddress.split(",")[0]}
                  </span>
                </div>
                <Ship className="h-5 w-5 text-blue-500" />
              </div>

              <TrackingTimeline 
                milestones={milestones} 
                progressPercent={shipment.deliveryProgressPercent}
              />
            </div>

            {displayProvider && (
              <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="shrink-0">
                    {displayProvider.avatarUrl ? (
                      <img
                        src={displayProvider.avatarUrl}
                        alt={displayProvider.name}
                        className="h-10 w-10 rounded-full object-cover border-2 border-amber-500/30"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-amber-600/10 text-amber-400 font-bold border border-amber-500/20 text-xs">
                        {displayProvider.initials}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-200">
                      {displayProvider.name}
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-amber-400 text-xs">★</span>
                      <span className="text-[10px] text-zinc-500 font-semibold">
                        {displayProvider.rating?.toFixed(1)} ({displayProvider.role})
                      </span>
                    </div>
                  </div>
                </div>

                 <div className="flex gap-2">
                  {displayProvider.phone ? (
                    <a
                      href={`tel:${displayProvider.phone}`}
                      aria-label={t("callProvider")}
                      className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-emerald-400 hover:bg-zinc-800 transition-colors focus:outline-none flex items-center justify-center"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                  ) : (
                    <button
                      disabled
                      aria-label={t("callProvider")}
                      className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-600 cursor-not-allowed focus:outline-none flex items-center justify-center"
                    >
                      <Phone className="h-4 w-4" />
                    </button>
                  )}
                  {displayProvider.phone ? (
                    <a
                      href={`https://wa.me/${(() => {
                        const cleaned = displayProvider.phone.replace(/\D/g, "");
                        if (cleaned.startsWith("01") && cleaned.length === 11) {
                          return "20" + cleaned.slice(1);
                        }
                        return cleaned;
                      })()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t("messageProvider")}
                      className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-blue-400 hover:bg-zinc-800 transition-colors focus:outline-none flex items-center justify-center"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </a>
                  ) : (
                    <button
                      disabled
                      aria-label={t("messageProvider")}
                      className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-600 cursor-not-allowed focus:outline-none flex items-center justify-center"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
