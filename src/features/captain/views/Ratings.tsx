"use client";

import { useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { useCaptainTranslations } from "@/features/captain/hooks/use-captain-translations";
import { selectRating } from "@/features/captain/store/selectors";
import { Search, ArrowLeft, ArrowRight } from "lucide-react";
import RatingSummary from "@/features/reviews/components/RatingSummary";
import ReviewCard from "@/features/reviews/components/ReviewCard";

export default function Ratings() {
  const t = useCaptainTranslations();
  const ratingData = useAppSelector(selectRating);

  // Search & Pagination states
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const reviewsList = ratingData?.reviews || [];
  const averageRating = ratingData?.averageRating || 0;
  const totalReviews = ratingData?.ratingsCount || 0;

  // Filter reviews based on search query
  const filteredReviews = reviewsList.filter((rev) => {
    const q = searchQuery.toLowerCase();
    const tracking = rev.shipment?.trackingNumber?.toLowerCase() || "";
    const name = rev.reviewer?.fullName?.toLowerCase() || "";
    const comment = rev.comment?.toLowerCase() || "";
    return tracking.includes(q) || name.includes(q) || comment.includes(q);
  });

  // Pagination math
  const totalItems = filteredReviews.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-extrabold text-[var(--color-text-main)] mb-1">
          {t("ratings_title")}
        </h1>
        <p className="text-[13px] text-[var(--color-text-sub)]">
          {t("ratings_sub")}
        </p>
      </div>

      {/* Rating Breakdown & Analytics */}
      <RatingSummary
        reviews={reviewsList}
        averageRating={averageRating}
        totalReviews={totalReviews}
      />

      {/* Customer Reviews List */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--dh-text-muted)]">
            {t("customerReviews")}
          </h2>

          {/* Search Input */}
          <div className="relative max-w-xs w-full">
            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[var(--dh-text-muted)]">
              <Search className="h-3.5 w-3.5" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={t("searchReviewsPlaceholder")}
              className="w-full text-[11px] bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-lg pl-8 pr-3 py-1.5 text-[var(--color-text-main)] placeholder-[var(--dh-text-muted)] focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* List of Reviews */}
        <div className="flex flex-col gap-5 min-h-[200px]">
          {paginatedReviews.length === 0 ? (
            <div className="text-center py-12 text-[var(--dh-text-muted)] text-xs font-medium">
              {t("noReviewsFound")}
            </div>
          ) : (
            paginatedReviews.map((rev) => (
              <ReviewCard key={rev._id} review={rev} displayMode="reviewer" />
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4 mt-2">
            <span className="text-[10px] text-[var(--dh-text-muted)] font-medium">
              {t("pageOf", { current: currentPage, total: totalPages })}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--dh-text-sub)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-muted)] disabled:opacity-30 disabled:hover:bg-transparent transition-colors focus:outline-none"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--dh-text-sub)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-muted)] disabled:opacity-30 disabled:hover:bg-transparent transition-colors focus:outline-none"
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
