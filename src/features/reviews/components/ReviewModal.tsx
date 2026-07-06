
"use client";

import { useState } from "react";
import { X } from "lucide-react";
import RatingStars from "./RatingStars";
import { createReview } from "../api";
import { useNotifications } from "@/shared/providers/socket-notification-provider";
import { useTranslations } from "next-intl";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
  shipmentId: string;
  trackingNumber: string;
  revieweeId: string;
  revieweeType: "Driver" | "Office";
  revieweeName: string;
}

export default function ReviewModal({
  isOpen,
  onClose,
  onSubmitSuccess,
  shipmentId,
  trackingNumber,
  revieweeId,
  revieweeType,
  revieweeName,
}: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { triggerLocalToast } = useNotifications();
  const t = useTranslations();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createReview({
        shipmentId,
        revieweeType,
        revieweeId,
        rating,
        comment: comment.trim(),
      });
      triggerLocalToast(
        t("customer.reviews.reviewSubmittedTitle"),
        t("customer.reviews.reviewSubmittedMessage"),
        "success"
      );
      onSubmitSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      triggerLocalToast(
        t("customer.reviews.reviewFailedTitle"),
        err.response?.data?.message || t("customer.reviews.reviewFailedMessage"),
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl max-w-md w-full shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <h3 className="text-sm font-bold text-[var(--color-text-main)] uppercase tracking-wider">
            {t("customer.reviews.modalTitle")} #{trackingNumber}
          </h3>
          <button
            onClick={onClose}
            className="text-[var(--color-text-sub)] hover:text-[var(--color-text-main)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div>
            <label className="text-[10px] text-[var(--dh-text-muted)] font-bold uppercase tracking-wider block mb-1">
              {t("customer.reviews.reviewing")} {revieweeType === "Office" ? t("customer.reviews.office") : t("customer.reviews.driver")}
            </label>
            <div className="text-sm font-semibold text-[var(--color-text-main)] bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-lg px-3 py-2">
              {revieweeName}
            </div>
          </div>

          <div>
            <label className="text-[10px] text-[var(--dh-text-muted)] font-bold uppercase tracking-wider block mb-2">
              {t("customer.reviews.yourRating")}
            </label>
            <RatingStars
              rating={rating}
              interactive={true}
              onChange={setRating}
              size={28}
            />
          </div>

          <div>
            <label className="text-[10px] text-[var(--dh-text-muted)] font-bold uppercase tracking-wider block mb-1.5">
              {t("customer.reviews.commentLabel")}
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("customer.reviews.commentPlaceholder")}
              maxLength={500}
              className="w-full text-xs bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-lg p-3 text-[var(--color-text-main)] placeholder-[var(--dh-text-muted)] focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 justify-end mt-2 pt-2 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[var(--color-text-sub)] hover:text-[var(--color-text-main)] transition-colors focus:outline-none"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-zinc-950 disabled:opacity-50 transition-all focus:outline-none shadow-sm"
            >
              {isSubmitting ? t("customer.reviews.submitting") : t("customer.reviews.submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
