import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Spinner from "@/components/ui/Spinner";
import { useTranslation } from "@/i18n";
import { fetchDisputes } from "@/store/slices/disputesSlice";
import type { AppDispatch, RootState } from "@/store";

export default function Disputes() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { items, isLoading } = useSelector((state: RootState) => state.disputes);

  useEffect(() => {
    dispatch(fetchDisputes());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-100">{t("disputes.title")}</h1>
      {isLoading ? (
        <Spinner size="lg" className="text-blue-500" />
      ) : (
        <p className="text-zinc-500">{items.length ? `${items.length} disputes` : t("common.noData")}</p>
      )}
    </div>
  );
}
