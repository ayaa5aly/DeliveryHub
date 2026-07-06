"use client";

import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { Offer } from "@/features/offers/types";

interface OfferCardProps {
  offer: Offer;
  isSelected: boolean;
  onSelect: () => void;
}

const descriptionKeys = {
  "offer-1": "description1",
  "offer-2": "description2",
  "offer-3": "description3",
  "offer-4": "description4",
} as const;

const durationKeys = {
  "offer-1": "duration1",
  "offer-2": "duration2",
  "offer-3": "duration3",
  "offer-4": "duration4",
} as const;

export default function OfferCard({ offer, isSelected, onSelect }: OfferCardProps) {
  const t = useTranslations("customer.offers");
  const {
    providerName,
    providerType,
    providerAvatar,
    providerRating,
    reviewCount,
    price,
    coverage,
    isBestValue,
  } = offer;

  const initials = providerName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isMockOffer = ["offer-1", "offer-2", "offer-3", "offer-4", "OFF-001", "OFF-002", "OFF-003"].includes(offer.id);

  const descriptionKey =
    descriptionKeys[offer.id as keyof typeof descriptionKeys] ?? "description1";
  const durationKey =
    durationKeys[offer.id as keyof typeof durationKeys] ?? "duration1";

  const displayDuration = isMockOffer ? t(durationKey) : offer.estDelivery;
  const displayDescription = isMockOffer ? t(descriptionKey) : offer.description;

  return (
    <div
      onClick={onSelect}
      className={cn(
        "relative flex flex-col justify-between bg-[var(--dh-bg-card)] border rounded-xl p-5 cursor-pointer transition-all duration-300 hover:border-[var(--dh-brand)] shadow-md",
        isSelected
          ? "border-[var(--dh-brand)] ring-2 ring-[var(--dh-brand-glow)] bg-[var(--dh-bg-card)]/90 shadow-[var(--dh-brand-glow)] shadow-xl"
          : "border-[var(--dh-border)]"
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {providerAvatar &&
            (providerAvatar.startsWith("http") ||
              providerAvatar.startsWith("/") ||
              providerAvatar.startsWith("data:")) ? (
              <img
                src={providerAvatar}
                alt={providerName}
                className={cn(
                  "h-10 w-10 rounded-lg object-cover shrink-0 border-2",
                  providerType === "office"
                    ? "border-emerald-500/30"
                    : "border-amber-500/30"
                )}
              />
            ) : (
              <div
                className={cn(
                  "flex items-center justify-center h-10 w-10 rounded-lg font-bold text-sm shrink-0",
                  providerType === "office"
                    ? "bg-emerald-600/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-amber-600/10 text-amber-400 border border-amber-500/20"
                )}
              >
                {initials}
              </div>
            )}

            <div className="flex flex-col">
              <span className="font-semibold text-[var(--dh-text-main)] text-sm leading-tight">
                {providerName}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="text-xs font-semibold text-amber-400">
                  {providerRating.toFixed(1)}
                </span>
                <span className="text-[10px] text-[var(--dh-text-muted)]">
                  ({t("reviews", { count: reviewCount })})
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 items-end">
            {isBestValue && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wider">
                {t("bestValue")}
              </span>
            )}
            {providerType === "captain" && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--dh-brand-subtle)] text-[var(--dh-brand)] border border-[var(--dh-border-brand)] uppercase tracking-wider">
                {t("captain")}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 border-y border-[var(--dh-border)] py-3.5 my-1 text-center">
          <div className="flex flex-col items-center">
            <span className="text-[var(--dh-brand)] font-bold text-base">EGP {price}</span>
            <span className="text-[10px] text-[var(--dh-text-muted)] font-semibold uppercase mt-0.5">
              {t("price")}
            </span>
          </div>
          <div className="flex flex-col items-center border-x border-[var(--dh-border)]">
            <span className="text-[var(--dh-text-main)] font-bold text-base">{displayDuration}</span>
            <span className="text-[10px] text-[var(--dh-text-muted)] font-semibold uppercase mt-0.5">
              {t("estimatedDelivery")}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span
              className={cn(
                "font-bold text-base",
                coverage === "insured" ? "text-[var(--dh-success)]" : "text-[var(--dh-text-muted)]"
              )}
            >
              {coverage === "insured" ? t("insured") : t("none")}
            </span>
            <span className="text-[10px] text-[var(--dh-text-muted)] font-semibold uppercase mt-0.5">
              {t("coverage")}
            </span>
          </div>
        </div>

        <p className="text-xs text-[var(--dh-text-sub)] leading-relaxed min-h-[32px]">
          {displayDescription}
        </p>
      </div>

      <button
        onClick={(event) => {
          event.stopPropagation();
          onSelect();
        }}
        className={cn(
          "w-full mt-4 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 focus:outline-none",
          isSelected
            ? "bg-[var(--dh-brand-subtle)] text-[var(--dh-brand)] border-[var(--dh-border-brand)] hover:bg-[var(--dh-brand-glow)]"
            : "bg-transparent text-[var(--dh-text-sub)] border-[var(--dh-border)] hover:border-[var(--dh-text-muted)] hover:text-[var(--dh-text-main)]"
        )}
      >
        {isSelected ? t("selectThis") : t("select")}
      </button>
    </div>
  );
}
