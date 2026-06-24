import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Spinner from "@/components/ui/Spinner";
import { useTranslation } from "@/i18n";
import { fetchRevenue } from "@/store/slices/revenueSlice";
import type { AppDispatch, RootState } from "@/store";

export default function Revenue() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { summary, records, isLoading } = useSelector((state: RootState) => state.revenue);

  useEffect(() => {
    dispatch(fetchRevenue());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-100">{t("revenue.title")}</h1>
      {isLoading ? (
        <Spinner size="lg" className="text-blue-500" />
      ) : summary ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-xs text-zinc-500 uppercase">Total revenue</p>
            <p className="text-2xl font-bold text-zinc-100 mt-1">
              {summary.totalRevenue.toLocaleString()} {t("common.currency")}
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-xs text-zinc-500 uppercase">Platform fee</p>
            <p className="text-2xl font-bold text-zinc-100 mt-1">
              {summary.platformFee.toLocaleString()} {t("common.currency")}
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-xs text-zinc-500 uppercase">Growth</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{summary.growthRate}%</p>
          </div>
        </div>
      ) : (
        <p className="text-zinc-500">{records.length ? `${records.length} records` : t("common.noData")}</p>
      )}
    </div>
  );
}
