import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Search,
  ChevronDown,
  User as UserIcon,
  LogOut,
  Settings,
  Menu,
  Sun,
  Moon,
  Languages,
} from "lucide-react";
import { useTranslation } from "@/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useUI } from "@/hooks/useUI";
import Avatar from "@/components/ui/Avatar";

interface TopbarProps {
  onMenuClick?: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const { theme, locale, setTheme, setLocale, toggleSidebar } = useUI();
  const router = useRouter();

  const displayName = user?.name ?? "Admin";

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-zinc-950 border-b border-zinc-800 text-zinc-100 gap-4">
      <button
        onClick={onMenuClick ?? toggleSidebar}
        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 lg:hidden transition-colors focus:outline-none shrink-0"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder={t("nav.searchPlaceholder")}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-1.5 text-sm text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <button
          onClick={() => setLocale(locale === "en" ? "ar" : "en")}
          className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
          aria-label="Toggle language"
        >
          <Languages className="h-4 w-4" />
        </button>

        <button className="relative p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-zinc-950" />
        </button>

        <div className="h-6 w-px bg-zinc-800" />

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-zinc-900 transition-colors focus:outline-none"
          >
            <Avatar name={displayName} src={user?.avatar} size="sm" />
            <div className="hidden sm:flex flex-col items-start text-left">
              <span className="text-sm font-semibold leading-tight text-zinc-200">
                {displayName}
              </span>
              <span className="text-[10px] text-zinc-500">{t("nav.admin")}</span>
            </div>
            <ChevronDown
              className="h-3.5 w-3.5 text-zinc-500 transition-transform duration-200"
              style={{ transform: dropdownOpen ? "rotate(180deg)" : "none" }}
            />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl py-1 z-20">
                <Link
                  href="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                >
                  <UserIcon className="h-4 w-4 text-zinc-500" />
                  <span>{t("nav.myProfile")}</span>
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                >
                  <Settings className="h-4 w-4 text-zinc-500" />
                  <span>{t("nav.accountSettings")}</span>
                </Link>
                <hr className="border-zinc-800 my-1" />
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    signOut();
                    router.push("/login");
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-zinc-800 hover:text-red-300 transition-colors text-left"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t("auth.signOut")}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
