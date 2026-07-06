"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Search, ArrowLeft, ArrowRight, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { useNotifications } from "@/shared/providers/socket-notification-provider";

import { getReviews } from "../api";
import type { MyReviewsData, PendingReview } from "../types";
import RatingStars from "../components/RatingStars";
import ReviewCard from "../components/ReviewCard";
import PendingReviewCard from "../components/PendingReviewCard";
import ReviewModal from "../components/ReviewModal";

export default function ReviewsView() {
  const t = useTranslations("customer.reviews");
  const { triggerLocalToast } = useNotifications();
  
  const [data, setData] = useState<MyReviewsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & Pagination states
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal states
  const [selectedPending, setSelectedPending] = useState<PendingReview | null>(null);

  const fetchReviews = async () => {
    try {
      const res = await getReviews();
      setData(res);
    } catch (err: any) {
      console.error(err);
      triggerLocalToast("Error", "Failed to load reviews history.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-zinc-400 text-xs">
        Loading reviews...
      </div>
    );
  }

  const reviewsList = data?.reviews || [];
  const pendingList = data?.pendingReviewsList || [];

  // Filter reviews based on search query
  const filteredReviews = reviewsList.filter((rev) => {
    const q = searchQuery.toLowerCase();
    const tracking = rev.shipment?.trackingNumber?.toLowerCase() || "";
    const name = rev.reviewee?.fullName?.toLowerCase() || "";
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
    <div className="flex flex-col gap-6 text-[var(--color-text-main)] max-w-4xl mx-auto p-1">
      <h1 className="text-xl font-bold tracking-tight">{t("title")}</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5 flex items-center justify-between shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] text-[var(--dh-text-muted)] font-bold uppercase tracking-wider">
              {t("average")}
            </span>
            <span className="text-3xl font-extrabold text-amber-400 mt-1" dir="ltr">
              {data?.averageRating ? `${data.averageRating.toFixed(1)} / 5` : "0.0 / 5"}
            </span>
          </div>
          <RatingStars rating={Math.round(data?.averageRating || 0)} size={18} />
        </div>

        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5 flex items-center justify-between shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] text-[var(--dh-text-muted)] font-bold uppercase tracking-wider">
              {t("pending")}
            </span>
            <span className="text-3xl font-extrabold text-blue-500 mt-1">
              {data?.pendingReviews || 0}
            </span>
          </div>
          <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Layout Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pending Reviews Section */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--dh-text-muted)] border-b border-[var(--color-border)] pb-3">
            {t("pending")}
          </h2>

          <div className="flex flex-col gap-3">
            {pendingList.length === 0 ? (
              <div className="bg-[var(--color-bg-card)]/50 border border-[var(--color-border)]/80 rounded-xl p-6 text-center flex flex-col items-center gap-2">
                <CheckCircle className="h-8 w-8 text-[var(--dh-text-muted)]" />
                <span className="text-xs text-[var(--color-text-sub)] font-medium">All caught up! No pending shipments to review.</span>
              </div>
            ) : (
              pendingList.map((pending) => (
                <PendingReviewCard
                  key={pending._id}
                  pending={pending}
                  onReviewClick={(p) => setSelectedPending(p)}
                />
              ))
            )}
          </div>
        </div>

        {/* History Section */}
        <div className="lg:col-span-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--dh-text-muted)]">
              {t("history")}
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
                placeholder="Search history..."
                className="w-full text-[11px] bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-lg pl-8 pr-3 py-1.5 text-[var(--color-text-main)] placeholder-[var(--dh-text-muted)] focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-5 min-h-[250px]">
            {paginatedReviews.length === 0 ? (
              <div className="text-center py-12 text-[var(--dh-text-muted)] text-xs font-medium">
                No review history found.
              </div>
            ) : (
              paginatedReviews.map((rev) => (
                <ReviewCard key={rev._id} review={rev} displayMode="reviewee" />
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4 mt-2">
              <span className="text-[10px] text-[var(--dh-text-muted)] font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-sub)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-muted)] disabled:opacity-30 disabled:hover:bg-transparent transition-colors focus:outline-none"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-sub)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-muted)] disabled:opacity-30 disabled:hover:bg-transparent transition-colors focus:outline-none"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Dialog/Modal */}
      {selectedPending && (
        <ReviewModal
          isOpen={!!selectedPending}
          onClose={() => setSelectedPending(null)}
          onSubmitSuccess={fetchReviews}
          shipmentId={selectedPending._id}
          trackingNumber={selectedPending.trackingNumber}
          revieweeId={selectedPending.revieweeId}
          revieweeType={selectedPending.revieweeType}
          revieweeName={selectedPending.revieweeName}
        />
      )}
    </div>
  );
}
