import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Spinner from "@/components/ui/Spinner";
import { useTranslation } from "@/i18n";
import { fetchShipments } from "@/store/slices/shipmentsSlice";
import type { AppDispatch, RootState } from "@/store";

export default function Shipments() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { items, isLoading } = useSelector((state: RootState) => state.shipments);

  useEffect(() => {
    dispatch(fetchShipments());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-100">{t("shipments.title")}</h1>
      {isLoading ? (
        <Spinner size="lg" className="text-blue-500" />
      ) : (
        <p className="text-zinc-500">{items.length ? `${items.length} shipments` : t("common.noData")}</p>
      )}
    </div>
  );
}
