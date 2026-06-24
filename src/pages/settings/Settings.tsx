import { useUI } from "@/hooks/useUI";
import { useTranslation } from "@/i18n";

export default function Settings() {
  const { t } = useTranslation();
  const { theme, locale, setTheme, setLocale } = useUI();

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold text-zinc-100">{t("settings.title")}</h1>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-200">Theme</p>
            <p className="text-xs text-zinc-500">Current: {theme}</p>
          </div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="px-4 py-2 rounded-lg bg-zinc-800 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            Toggle theme
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-200">Language</p>
            <p className="text-xs text-zinc-500">Current: {locale === "en" ? "English" : "العربية"}</p>
          </div>
          <button
            onClick={() => setLocale(locale === "en" ? "ar" : "en")}
            className="px-4 py-2 rounded-lg bg-zinc-800 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            Switch language
          </button>
        </div>
      </div>
    </div>
  );
}
