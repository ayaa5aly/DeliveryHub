'use client'

import React, { useState, useEffect } from 'react'
import clsx from 'clsx'
import { Menu, ChevronDown, User as UserIcon, LogOut, Settings, Bell } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  toggleOnline, toggleSidebar, setActiveScreen, setOnlineState,
} from '@/features/captain/store/dashboard-slice'
import {
  selectActiveScreen,
  selectIsOnline,
  selectOrders,
  selectAccountType,
} from '@/features/captain/store/selectors'
import { useCaptainTranslations } from '@/features/captain/hooks/use-captain-translations'
import { LocaleToggle } from '@/shared/ui/locale-toggle'
import { ThemeToggle } from '@/shared/ui/theme-toggle'
import type { ScreenId } from '@/features/captain/types'
import { getCurrentUser, logout } from '@/features/auth/api'
import type { User } from '@/features/auth/types'
import { useNotifications } from '@/shared/providers/socket-notification-provider'
import { updateDriverAvailability, updateOfficeAvailability } from '@/features/office'

const SCREEN_TITLE_KEY: Record<ScreenId, string> = {
  'overview':         'screen_overview',
  'requests':         'screen_requests',
  'offers':           'screen_offers',
  'orders':           'screen_orders',
  'deliveries':       'screen_deliveries',
  'tracking':         'screen_tracking',
  'earnings':         'screen_earnings',
  'wallet':           'screen_wallet',
  'team':             'screen_team',
  'captain-tracking': 'screen_captain-tracking',
  'performance':      'screen_performance',
  'ratings':          'screen_ratings',
  'verification':     'screen_verification',
  'profile':          'screen_profile',
  'support':          'screen_support',
  'notifications':    'nav_notifications',
}

export default function Topbar() {
  const dispatch     = useAppDispatch()
  const router       = useRouter()
  const activeScreen = useAppSelector(selectActiveScreen)
  const isOnline     = useAppSelector(selectIsOnline)
  const orders       = useAppSelector(selectOrders) || []
  const accountType  = useAppSelector(selectAccountType)
  const locale       = useLocale()
  const t            = useCaptainTranslations()
  const { unreadCount } = useNotifications()
  const isRTL        = locale === 'ar'

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchUser = () => {
      getCurrentUser()
        .then((data) => setUser(data))
        .catch((err) => console.error("Error fetching user in Captain Topbar:", err));
    };

    fetchUser();

    window.addEventListener("profile-updated", fetchUser);
    return () => {
      window.removeEventListener("profile-updated", fetchUser);
    };
  }, []);

  const hasActiveOrder = orders.some((order: any) => {
    const status = order.rawStatus || order.status
    return status !== 'delivered' && status !== 'cancelled' && status !== 'pending_offers'
  })
  const isCaptain = user?.role === 'driver' || accountType === 'captain'
  const isBusy = isOnline && isCaptain && hasActiveOrder

  const handleToggleOnline = async () => {
    if (!user || isBusy) return
    const nextOnline = !isOnline
    dispatch(toggleOnline())
    try {
      if (user.role === 'office') {
        await updateOfficeAvailability(nextOnline ? 'available' : 'offline')
      } else {
        await updateDriverAvailability(nextOnline ? 'available' : 'offline')
      }
    } catch (err) {
      console.error("Failed to update status in DB:", err)
      dispatch(setOnlineState(!nextOnline))
    }
  }

  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
  }

  const getLocalizedRole = (role: string) => {
    if (role === "customer") return "Customer"
    if (role === "driver") return locale === 'ar' ? 'كابتن' : 'Captain'
    if (role === "office") return locale === 'ar' ? 'مكتب شحن' : 'Shipping Office'
    return role
  }

  const titleKey = SCREEN_TITLE_KEY[activeScreen] ?? 'screen_overview'

  let statusText = isOnline ? t('online') : t('offline')
  let statusClass = isOnline
    ? 'bg-[var(--dh-success-glow)] border border-[var(--dh-success)]/20 text-[var(--dh-success)]'
    : 'bg-[var(--dh-bg-card)] border border-[var(--dh-border)] text-[var(--dh-text-sub)] hover:text-[var(--dh-text-main)]'
  let indicatorClass = isOnline ? 'bg-[var(--dh-success)] animate-pulse' : 'bg-[var(--dh-text-muted)]'

  if (isBusy) {
    statusText = t('busy')
    statusClass = 'bg-[var(--dh-warning-glow)] border border-[var(--dh-warning)]/20 text-[var(--dh-warning)] cursor-not-allowed'
    indicatorClass = 'bg-[var(--dh-warning)]'
  }

  return (
    <header className="h-16 flex items-center justify-between px-6 gap-4 border-b bg-[var(--dh-bg-topbar)] border-[var(--dh-border)] text-[var(--dh-text-main)]">
      {/* Left section: Hamburger menu & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-1.5 rounded-lg text-[var(--dh-text-sub)] hover:text-[var(--dh-text-main)] hover:bg-[var(--dh-bg-muted)] md:hidden transition-colors focus:outline-none shrink-0"
        >
          <Menu className="h-5 w-5" />
        </button>

        <h1 className="text-sm md:text-base font-bold text-[var(--dh-text-main)]">
          {t(titleKey)}
        </h1>
      </div>

      {/* Right section: Toggles, status pill, notification, profile */}
      <div className="flex items-center gap-4">
        {/* Localization & Theme controls */}
        <div className="hidden lg:flex items-center gap-2">
          <ThemeToggle className="border-[var(--dh-border)] bg-[var(--dh-bg-card)] dark:bg-[var(--dh-bg-card)]" />
          <LocaleToggle className="border-[var(--dh-border)] bg-[var(--dh-bg-card)] dark:bg-[var(--dh-bg-card)]" />
        </div>

        {/* Online/Offline status pill */}
        <button
          onClick={handleToggleOnline}
          disabled={isBusy}
          className={clsx(
            'flex items-center gap-2 px-3 py-[5px] rounded-full text-[12px] font-semibold transition-colors',
            statusClass
          )}
        >
          <span className={clsx('w-2 h-2 rounded-full', indicatorClass)} />
          <span>{statusText}</span>
        </button>

        {/* Notification bell */}
        <button
          onClick={() => dispatch(setActiveScreen('notifications'))}
          className="relative p-2 rounded-lg text-[var(--dh-text-sub)] hover:text-[var(--dh-text-main)] hover:bg-[var(--dh-bg-muted)] transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--dh-danger)] text-[9px] font-black text-white ring-2 ring-[var(--dh-bg-topbar)]">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-[var(--dh-border)]" />

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[var(--dh-bg-muted)] transition-colors focus:outline-none"
          >
            {/* Avatar badge */}
            <div className="flex items-center justify-center h-8 w-8 rounded-full overflow-hidden bg-[var(--dh-brand)] text-white font-bold text-xs shrink-0 shadow-[0_2px_8px_var(--dh-brand-glow)]">
              {user && user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : user ? (
                getInitials(user.name)
              ) : (
                "..."
              )}
            </div>
            <div className="hidden sm:flex flex-col items-start text-start">
              <span className="text-sm font-semibold leading-tight text-[var(--dh-text-main)]">
                {user ? user.name : t("loadingUser")}
              </span>
              <span className="text-[10px] text-[var(--dh-text-muted)]">
                {user ? getLocalizedRole(user.role) : "..."}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-[var(--dh-text-muted)] transition-transform duration-200" style={{ transform: dropdownOpen ? "rotate(180deg)" : "none" }} />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <>
              {/* Overlay blocker to close */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              <div className={clsx(
                "absolute mt-2 w-48 bg-[var(--dh-bg-card)] border border-[var(--dh-border)] rounded-xl shadow-xl py-1 z-20",
                isRTL ? "left-0" : "right-0"
              )}>
                <button
                  onClick={() => {
                    setDropdownOpen(false)
                    dispatch(setActiveScreen('profile'))
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--dh-text-sub)] hover:bg-[var(--dh-bg-muted)] hover:text-[var(--dh-text-main)] transition-colors text-start"
                >
                  <UserIcon className="h-4 w-4 text-[var(--dh-text-muted)]" />
                  <span>{t("myProfileLink")}</span>
                </button>
                <button
                  onClick={() => {
                    setDropdownOpen(false)
                    dispatch(setActiveScreen('profile'))
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--dh-text-sub)] hover:bg-[var(--dh-bg-muted)] hover:text-[var(--dh-text-main)] transition-colors text-start"
                >
                  <Settings className="h-4 w-4 text-[var(--dh-text-muted)]" />
                  <span>{t("accountSettingsLink")}</span>
                </button>
                <hr className="border-[var(--dh-border)] my-1" />
                <button
                  onClick={async () => {
                    setDropdownOpen(false)
                    try {
                      await logout()
                    } catch (e) {
                      console.error("Sign out error:", e)
                    }
                    router.push("/login")
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--dh-danger)] hover:bg-[var(--dh-danger-subtle)] hover:text-[var(--dh-danger)] transition-colors text-start"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t("signOutLink")}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
