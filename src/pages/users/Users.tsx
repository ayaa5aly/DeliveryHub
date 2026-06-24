import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Spinner from "@/components/ui/Spinner";
import { useTranslation } from "@/i18n";
import { fetchUsers } from "@/store/slices/usersSlice";
import type { AppDispatch, RootState } from "@/store";

export default function Users() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { items, isLoading } = useSelector((state: RootState) => state.users);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-100">{t("users.title")}</h1>
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" className="text-blue-500" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-zinc-500">{t("common.noData")}</p>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-left">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((user) => (
                <tr key={user.id} className="border-b border-zinc-800/50 text-zinc-300">
                  <td className="px-4 py-3">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3 capitalize">{user.role}</td>
                  <td className="px-4 py-3 capitalize">{user.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
