import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Spinner from "@/components/ui/Spinner";
import { useTranslation } from "@/i18n";
import { fetchEscrow } from "@/store/slices/escrowSlice";
import type { AppDispatch, RootState } from "@/store";

export default function Escrow() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { items, totalHeld, isLoading } = useSelector((state: RootState) => state.escrow);

  useEffect(() => {
    dispatch(fetchEscrow());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-100">{t("escrow.title")}</h1>
      {isLoading ? (
        <Spinner size="lg" className="text-blue-500" />
      ) : (
        <div className="space-y-2">
          <p className="text-zinc-400">
            Total held: {totalHeld.toLocaleString()} {t("common.currency")}
          </p>
          <p className="text-zinc-500">{items.length ? `${items.length} transactions` : t("common.noData")}</p>
        </div>
      )}
    </div>
  );
}
