import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Spinner from "@/components/ui/Spinner";
import { useTranslation } from "@/i18n";
import { fetchDrivers } from "@/store/slices/driversSlice";
import type { AppDispatch, RootState } from "@/store";

export default function Drivers() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { items, isLoading } = useSelector((state: RootState) => state.drivers);

  useEffect(() => {
    dispatch(fetchDrivers());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-100">{t("drivers.title")}</h1>
      {isLoading ? (
        <Spinner size="lg" className="text-blue-500" />
      ) : (
        <p className="text-zinc-500">{items.length ? `${items.length} drivers` : t("common.noData")}</p>
      )}
    </div>
  );
}
