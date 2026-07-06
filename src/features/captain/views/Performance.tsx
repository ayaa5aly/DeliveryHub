"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectCaptains } from "@/features/captain/store/selectors";
import { getCaptainPerformance } from "@/features/office/api";
import { useCaptainTranslations } from "@/features/captain/hooks/use-captain-translations";
import { RatingStars } from "@/features/reviews";
import Card from "@/shared/ui/Card";
import Badge from "@/shared/ui/Badge";
import { useLocale } from "next-intl";
import {
  Search,
  Award,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Coins,
  Star,
  Users,
} from "lucide-react";

interface CaptainPerformanceData {
  id: string;
  name: string;
  status: "available" | "busy" | "offline";
  completedDeliveries: number;
  activeDeliveries: number;
  cancelledDeliveries: number;
  totalEarnings: number;
  averageRating: number | null;
  ratingsCount: number;
}

export default function Performance() {
  const t = useCaptainTranslations();
  const locale = useLocale();
  const isRTL = locale === "ar";
  const captains = useAppSelector(selectCaptains) || [];

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [performanceList, setPerformanceList] = useState<CaptainPerformanceData[]>([]);

  useEffect(() => {
    async function fetchAllPerformance() {
      if (!captains || captains.length === 0) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const promises = captains.map(async (c) => {
          try {
            const data = await getCaptainPerformance(c.id);
            return {
              id: c.id,
              name: c.name,
              status: c.status as any,
              completedDeliveries: data?.completedDeliveries ?? 0,
              activeDeliveries: data?.activeDeliveries ?? 0,
              cancelledDeliveries: data?.cancelledDeliveries ?? 0,
              totalEarnings: data?.totalEarnings ?? 0,
              averageRating: data?.averageRating ?? null,
              ratingsCount: data?.ratingsCount ?? 0,
            };
          } catch (err) {
            console.error(`Failed to fetch performance for captain ${c.name}:`, err);
            return {
              id: c.id,
              name: c.name,
              status: c.status as any,
              completedDeliveries: 0,
              activeDeliveries: 0,
              cancelledDeliveries: 0,
              totalEarnings: 0,
              averageRating: null,
              ratingsCount: 0,
            };
          }
        });

        const results = await Promise.all(promises);
        setPerformanceList(results);
      } catch (err) {
        console.error("Failed to load performance list:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAllPerformance();
  }, [captains]);

  // Filtered List
  const filteredList = performanceList.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Aggregated Office Stats
  const totalCompleted = performanceList.reduce((sum, p) => sum + p.completedDeliveries, 0);
  const totalActive = performanceList.reduce((sum, p) => sum + p.activeDeliveries, 0);
  const totalEarnings = performanceList.reduce((sum, p) => sum + p.totalEarnings, 0);

  // Find Top Performer
  const topPerformer =
    performanceList.length > 0
      ? [...performanceList].sort((a, b) => b.completedDeliveries - a.completedDeliveries)[0]
      : null;

  return (
    <div className="flex flex-col gap-6 text-[var(--color-text-main)] max-w-6xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-main)]">
            {t("performance_title")}
          </h1>
          <p className="text-xs text-[var(--color-text-sub)] font-semibold mt-0.5">
            {t("performance_sub")}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--dh-text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchCaptainNamePlaceholder")}
            className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg ps-9 pe-4 py-2 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Fleet Aggregated Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Captains */}
        <div className="relative group overflow-hidden bg-gradient-to-br from-[var(--color-bg-card)]/90 to-[var(--color-bg-muted)]/90 border border-[var(--color-border)]/80 hover:border-blue-500/30 rounded-2xl p-5 transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] transform hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all duration-300" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/5 border border-blue-500/20 text-blue-400 rounded-xl">
              <Users size={22} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {t("fleetBadge")}
            </span>
          </div>
          <div>
            <span className="text-xs text-[var(--color-text-sub)] font-semibold uppercase tracking-wider block">
              {t("totalCaptainsLabel")}
            </span>
            <span className="text-3xl font-extrabold text-white tracking-tight mt-1.5 block">
              {performanceList.length}
            </span>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-[var(--dh-text-muted)]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                {performanceList.filter((p) => p.status !== "offline").length}{" "}
                {t("activeNow")}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Completed Trips */}
        <div className="relative group overflow-hidden bg-gradient-to-br from-[var(--color-bg-card)]/90 to-[var(--color-bg-muted)]/90 border border-[var(--color-border)]/80 hover:border-emerald-500/30 rounded-2xl p-5 transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] transform hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-300" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <CheckCircle2 size={22} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              98% {t("successLabel")}
            </span>
          </div>
          <div>
            <span className="text-xs text-[var(--color-text-sub)] font-semibold uppercase tracking-wider block">
              {t("completedTripsLabel")}
            </span>
            <span className="text-3xl font-extrabold text-white tracking-tight mt-1.5 block">
              {totalCompleted}
            </span>
            <div className="mt-3 text-xs text-[var(--dh-text-muted)]">
              <span>{t("successfullyDeliveredSub")}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Active Trips */}
        <div className="relative group overflow-hidden bg-gradient-to-br from-[var(--color-bg-card)]/90 to-[var(--color-bg-muted)]/90 border border-[var(--color-border)]/80 hover:border-amber-500/30 rounded-2xl p-5 transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)] transform hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all duration-300" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-gradient-to-br from-amber-500/20 to-amber-600/5 border border-amber-500/20 text-amber-400 rounded-xl">
              <TrendingUp size={22} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
              {t("liveBadge")}
            </span>
          </div>
          <div>
            <span className="text-xs text-[var(--color-text-sub)] font-semibold uppercase tracking-wider block">
              {t("activeTripsLabel")}
            </span>
            <span className="text-3xl font-extrabold text-white tracking-tight mt-1.5 block">
              {totalActive}
            </span>
            <div className="mt-3 text-xs text-[var(--dh-text-muted)] flex items-center gap-1">
              <span>{t("currentlyInTransitSub")}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Total Earnings */}
        <div className="relative group overflow-hidden bg-gradient-to-br from-[var(--color-bg-card)]/90 to-[var(--color-bg-muted)]/90 border border-[var(--color-border)]/80 hover:border-purple-500/30 rounded-2xl p-5 transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] transform hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all duration-300" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/5 border border-purple-500/20 text-purple-400 rounded-xl">
              <Coins size={22} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              EGP
            </span>
          </div>
          <div>
            <span className="text-xs text-[var(--color-text-sub)] font-semibold uppercase tracking-wider block">
              {t("grossFleetEarningsLabel")}
            </span>
            <span className="text-3xl font-extrabold text-white tracking-tight mt-1.5 block">
              EGP {totalEarnings.toLocaleString()}
            </span>
            <div className="mt-3 text-xs text-[var(--dh-text-muted)]">
              <span>
                {t("averagePerCaptain")}
                EGP {Math.round(totalEarnings / (performanceList.length || 1)).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performer Card */}
      {topPerformer && topPerformer.completedDeliveries > 0 && (
        <Card className="relative overflow-hidden bg-gradient-to-r from-amber-500/10 via-[var(--color-bg-card)]/20 to-[var(--color-bg-card)]/50 border-amber-500/20 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-2xl animate-pulse">
              <Award size={26} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text-main)]">
                {t("topPerformer")}
              </h3>
              <p className="text-xs text-[var(--color-text-sub)] mt-1">
                {t("topPerformerWeekMsg", { name: topPerformer.name, count: topPerformer.completedDeliveries })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5 self-stretch sm:self-auto justify-center">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-amber-400">
              {topPerformer.averageRating ? topPerformer.averageRating.toFixed(1) : "5.0"}
            </span>
          </div>
        </Card>
      )}

      {/* Main Grid / Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 bg-[var(--color-bg-card)]/10 border border-[var(--color-border)] rounded-2xl">
          <div className="h-8 w-8 rounded-full border-2 border-t-blue-500 border-[var(--color-border)] animate-spin mb-3" />
          <span className="text-xs text-[var(--dh-text-muted)] font-semibold">
            {t("loadingPerformanceReports")}
          </span>
        </div>
      ) : filteredList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredList.map((captain) => (
            <Card
              key={captain.id}
              className="bg-[var(--color-bg-card)]/30 hover:bg-[var(--color-bg-card)]/40 border-[var(--color-border)] hover:border-blue-500/30 transition-all duration-200 p-5 rounded-2xl flex flex-col gap-4 shadow-md group"
            >
              {/* Header: Profile, Name, Status */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-sm">
                    {captain.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--color-text-main)] group-hover:text-white transition-colors">
                      {captain.name}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1">
                      {captain.averageRating !== null ? (
                        <>
                          <RatingStars rating={Math.round(captain.averageRating)} size={11} />
                          <span className="text-[10px] font-bold text-[var(--color-text-sub)]">
                            {captain.averageRating.toFixed(1)}
                          </span>
                        </>
                      ) : (
                        <span className="text-[10px] text-[var(--dh-text-muted)] font-medium">
                          {t("noRatings")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Badge
                  variant={
                    captain.status === "available"
                      ? "green"
                      : captain.status === "busy"
                      ? "amber"
                      : "gray"
                  }
                  className="capitalize font-bold text-[9px] px-2 py-0.5 rounded-full"
                >
                  {t(captain.status)}
                </Badge>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 bg-[var(--color-bg-muted)]/40 border border-[var(--color-border)] p-3 rounded-xl">
                <div className="text-center">
                  <span className="text-[9px] text-[var(--dh-text-muted)] font-bold uppercase tracking-wider block">
                    {t("doneStat")}
                  </span>
                  <span className="text-sm font-bold text-emerald-400 mt-1 block">
                    {captain.completedDeliveries}
                  </span>
                </div>
                <div className="text-center border-x border-[var(--color-border)]">
                  <span className="text-[9px] text-[var(--dh-text-muted)] font-bold uppercase tracking-wider block">
                    {t("activeStat")}
                  </span>
                  <span className="text-sm font-bold text-blue-400 mt-1 block">
                    {captain.activeDeliveries}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-[9px] text-[var(--dh-text-muted)] font-bold uppercase tracking-wider block">
                    {t("failedStat")}
                  </span>
                  <span className="text-sm font-bold text-red-400 mt-1 block">
                    {captain.cancelledDeliveries}
                  </span>
                </div>
              </div>

              {/* Earnings & Ratings Summary footer */}
              <div className="flex justify-between items-center pt-2 border-t border-[var(--color-border)] text-xs">
                <div className="flex flex-col">
                  <span className="text-[9px] text-[var(--dh-text-muted)] font-semibold">
                    {t("captainEarningsLabel")}
                  </span>
                  <span className="font-bold text-[var(--color-text-main)] mt-0.5">
                    EGP {captain.totalEarnings.toLocaleString()}
                  </span>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-[9px] text-[var(--dh-text-muted)] font-semibold">
                    {t("reviewsCountLabel")}
                  </span>
                  <span className="font-bold text-[var(--color-text-sub)] mt-0.5">
                    {t("reviewsSuffix", { count: captain.ratingsCount })}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-16 bg-[var(--color-bg-card)]/10 border border-[var(--color-border)] rounded-2xl">
          <AlertCircle className="h-8 w-8 text-[var(--dh-text-muted)] mb-2" />
          <p className="text-xs text-[var(--dh-text-muted)]">
            {t("noCaptainsFoundMsg")}
          </p>
        </div>
      )}
    </div>
  );
}
