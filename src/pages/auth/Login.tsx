import { useEffect, useState, type FormEvent } from "react";
import { useDispatch } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import { Ship } from "lucide-react";
import PasswordInput from "@/components/auth/PasswordInput";
import Spinner from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n";
import { login } from "@/store/slices/authSlice";
import type { AppDispatch } from "@/store";

export default function Login() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, isAuthenticated, dismissError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(from);
    }
  }, [isAuthenticated, router, from]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    dismissError();
    try {
      await dispatch(
        login({ email: email.trim(), password, rememberMe }),
      ).unwrap();
      router.replace(from);
    } catch {
      // Error is surfaced through auth slice state.
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8 text-blue-500">
          <Ship className="h-8 w-8" />
          <span className="text-2xl font-bold">DeliveryHub</span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-zinc-100 mb-1">{t("auth.login")}</h1>
          <p className="text-sm text-zinc-500 mb-6">{t("auth.loginSubtitle")}</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-zinc-300">{t("auth.email")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <PasswordInput
              label={t("auth.password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-zinc-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-zinc-600"
                />
                {t("auth.rememberMe")}
              </label>
              <button type="button" className="text-sm text-blue-500 hover:underline">
                {t("auth.forgotPassword")}
              </button>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
            >
              {isLoading && <Spinner size="sm" />}
              {t("auth.signIn")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
