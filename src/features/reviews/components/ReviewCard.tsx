import RatingStars from "./RatingStars";
import type { Review } from "../types";

interface ReviewCardProps {
  review: Review;
  displayMode?: "reviewer" | "reviewee";
}

export default function ReviewCard({
  review,
  displayMode = "reviewee",
}: ReviewCardProps) {
  const name =
    displayMode === "reviewee"
      ? review.reviewee?.fullName || "Office/Driver"
      : review.reviewer?.fullName || "Customer";

  const trackingNumber = review.shipment?.trackingNumber || "N/A";
  const dateStr = review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "";

  return (
    <div className="flex flex-col gap-2.5 border-b border-[var(--color-border)] pb-4.5 last:border-none last:pb-0">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-bold text-[var(--color-text-main)]">{name}</span>
          <span className="text-[10px] text-[var(--color-text-sub)] font-medium">
            Shipment ID: <strong className="text-[var(--color-text-main)]">{trackingNumber}</strong>
            {displayMode === "reviewee" && (
              <span className="text-[var(--dh-text-muted)]"> • {review.revieweeType === "Office" ? "Office" : "Driver"}</span>
            )}
          </span>
        </div>
        <span className="text-[10px] text-[var(--dh-text-muted)] font-medium">{dateStr}</span>
      </div>

      <RatingStars rating={review.rating} size={14} />

      {review.comment && (
        <p className="text-xs text-[var(--color-text-sub)] leading-relaxed italic bg-[var(--color-bg-muted)] border-s-2 border-emerald-500 ps-2.5 pe-1 py-1.5 rounded-e-md">
          &ldquo;{review.comment}&rdquo;
        </p>
      )}
    </div>
  );
}
