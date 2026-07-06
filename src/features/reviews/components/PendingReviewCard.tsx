import { Star } from "lucide-react";
import type { PendingReview } from "../types";

interface PendingReviewCardProps {
  pending: PendingReview;
  onReviewClick: (pending: PendingReview) => void;
}

export default function PendingReviewCard({
  pending,
  onReviewClick,
}: PendingReviewCardProps) {
  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-4.5 flex items-center justify-between shadow-sm hover:border-[var(--dh-brand-light)] transition-colors">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-bold text-[var(--color-text-main)]">
          Shipment {pending.trackingNumber}
        </span>
        <span className="text-[10px] text-[var(--color-text-sub)] font-medium">
          Delivered to you • Target: <strong className="text-[var(--color-text-main)]">{pending.revieweeName}</strong> ({pending.revieweeType === "Office" ? "Office" : "Driver"})
        </span>
      </div>

      <button
        onClick={() => onReviewClick(pending)}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-zinc-950 transition-all focus:outline-none shadow-sm"
      >
        <Star className="h-3.5 w-3.5 fill-current" />
        <span>Review</span>
      </button>
    </div>
  );
}
