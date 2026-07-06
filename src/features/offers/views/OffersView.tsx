"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, ArrowUpDown, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { mockOffers, mockShipments } from "@/constants/mock-data";
import OfferCard from "../components/offer-card";
import { useTranslations } from "next-intl";
import { getOffersForShipment, acceptOffer } from "../api";
import { getShipmentById } from "@/features/shipments/api";
import type { Offer } from "../types";
import type { Shipment } from "@/features/shipments/types";

interface OffersViewProps {
  shipmentId: string;
}

export default function OffersView({ shipmentId }: OffersViewProps) {
  const t = useTranslations("customer.offers");
  const router = useRouter();

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedOfferId, setSelectedOfferId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    Promise.all([
      getShipmentById(shipmentId).catch((err) => {
        console.error("Failed to load shipment, using mock:", err);
        return mockShipments.find((s) => s.id === shipmentId) || mockShipments[0];
      }),
      getOffersForShipment(shipmentId).catch((err) => {
        console.error("Failed to load offers, using mock:", err);
        return mockOffers;
      }),
    ]).then(([loadedShipment, loadedOffers]) => {
      setShipment(loadedShipment);
      setOffers(loadedOffers);
      if (loadedOffers && loadedOffers.length > 0) {
        setSelectedOfferId(loadedOffers[0].id);
      }
      setLoading(false);
    });
  }, [shipmentId]);

  const handleConfirmOffer = async () => {
    if (!selectedOfferId || !shipment) return;
    setConfirming(true);
    try {
      await acceptOffer(selectedOfferId);
      router.push(`/tracking/${shipment.id}?offerId=${selectedOfferId}`);
    } catch (err) {
      console.error("Failed to accept offer:", err);
      // Fallback redirection in dev environment
      router.push(`/tracking/${shipment.id}?offerId=${selectedOfferId}`);
    } finally {
      setConfirming(false);
    }
  };

  const getSpeedLabel = (val: string) => {
    switch (val) {
      case "standard":
        return t("standard");
      case "express":
        return t("express");
      case "scheduled":
        return t("scheduled");
      default:
        return val;
    }
  };

  if (loading || !shipment) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-zinc-400 text-sm font-semibold">
        <span>{t("loading") || "Loading offers..."}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-[var(--dh-text-main)] max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--dh-border)] pb-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="p-1 rounded-lg text-[var(--dh-text-muted)] hover:text-[var(--dh-text-main)] hover:bg-[var(--dh-bg-muted)] transition-colors mr-1"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-xl font-bold tracking-tight text-[var(--dh-text-main)]">
              {t("received", { count: offers.length })}
            </h1>
            <span className="text-[var(--dh-text-dim)] font-bold">•</span>
            <span className="text-sm font-semibold text-blue-500">
              {shipment.trackingNumber}
            </span>
          </div>
          <p className="text-xs text-[var(--dh-text-sub)] ml-8 font-medium">
            {shipment.pickupAddress ? shipment.pickupAddress.split(",")[0] : ""} ➔ {shipment.deliveryAddress ? shipment.deliveryAddress.split(",")[0] : ""} • {shipment.weight}kg • {getSpeedLabel(shipment.deliverySpeed)}
          </p>
        </div>

        <button
          onClick={handleConfirmOffer}
          disabled={confirming || !selectedOfferId}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all duration-200 shadow-md focus:outline-none disabled:bg-blue-800"
        >
          <CheckCircle className="h-4 w-4" />
          <span>{confirming ? t("confirming") : t("accept")}</span>
        </button>
      </div>

      <div className="flex justify-end gap-2.5">
        <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[var(--dh-bg-card)] border border-[var(--dh-border)] text-[var(--dh-text-sub)] hover:border-[var(--dh-text-muted)] hover:bg-[var(--dh-bg-muted)] transition-all focus:outline-none">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>{t("filter")}</span>
        </button>
        <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[var(--dh-bg-card)] border border-[var(--dh-border)] text-[var(--dh-text-sub)] hover:border-[var(--dh-text-muted)] hover:bg-[var(--dh-bg-muted)] transition-all focus:outline-none">
          <ArrowUpDown className="h-3.5 w-3.5" />
          <span>{t("sortPrice")}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
        {offers.map((offer) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            isSelected={selectedOfferId === offer.id}
            onSelect={() => setSelectedOfferId(offer.id)}
          />
        ))}
      </div>
    </div>
  );
}
