'use client'

import clsx from 'clsx'
import {
  LayoutDashboard, Inbox, Gavel, CheckCircle, Truck, Map,
  Coins, Wallet, Users, MapPin, BarChart2, Star,
  UserCircle, ShieldCheck, Ship, LogOut, X, Settings, Bell, Headphones
} from 'lucide-react'
import { useNotifications } from '@/shared/providers/socket-notification-provider'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout } from '@/features/auth/api'
import { setActiveScreen, setSidebarOpen } from '@/features/captain/store/dashboard-slice'
import {
  selectAccountType,
  selectActiveScreen,
  selectProfile,
  selectSidebarOpen,
  selectRequests,
  selectOrders,
} from '@/features/captain/store/selectors'
import { useCaptainTranslations } from '@/features/captain/hooks/use-captain-translations'
import type { ScreenId } from '@/features/captain/types'
import { DelixLogo } from '@/shared/ui/DelixLogo'

interface NavEntry {
  id: ScreenId | 'notifications'
  labelKey: string
  icon: React.ComponentType<any>
  badge?: number
  officeOnly?: boolean
}

const NAV_ITEMS: NavEntry[] = [
  { id: 'overview', labelKey: 'nav_overview', icon: LayoutDashboard },
  { id: 'requests', labelKey: 'nav_requests', icon: Inbox },
  { id: 'offers', labelKey: 'nav_offers', icon: Gavel },
  { id: 'orders', labelKey: 'nav_orders', icon: CheckCircle },
  { id: 'deliveries', labelKey: 'nav_deliveries', icon: Truck, officeOnly: true },
  { id: 'tracking', labelKey: 'nav_tracking', icon: Map, officeOnly: true },
  { id: 'notifications', labelKey: 'nav_notifications', icon: Bell },
]

const FINANCE_ITEMS: NavEntry[] = [
  { id: 'earnings', labelKey: 'nav_earnings', icon: Coins },
  { id: 'wallet', labelKey: 'nav_wallet', icon: Wallet },
]

const TEAM_ITEMS: NavEntry[] = [
  { id: 'team', labelKey: 'nav_team', icon: Users, officeOnly: true },
  { id: 'captain-tracking', labelKey: 'nav_captainTracking', icon: MapPin, officeOnly: true },
  { id: 'performance', labelKey: 'nav_performance', icon: BarChart2, officeOnly: true },
]

const ACCOUNT_ITEMS: NavEntry[] = [
  { id: 'profile', labelKey: 'nav_profile', icon: Settings },
  { id: 'ratings', labelKey: 'nav_ratings', icon: Star },
  { id: 'verification', labelKey: 'nav_verification', icon: ShieldCheck },
  { id: 'support', labelKey: 'nav_support', icon: Headphones },
]

export default function Sidebar() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const accountType = useAppSelector(selectAccountType)
  const activeScreen = useAppSelector(selectActiveScreen)
  const sidebarOpen = useAppSelector(selectSidebarOpen)
  const profile = useAppSelector(selectProfile)
  const requests = useAppSelector(selectRequests) || []
  const orders = useAppSelector(selectOrders) || []
  const locale = useLocale()
  const t = useCaptainTranslations()
  const { unreadCount } = useNotifications()
  const isOffice = accountType === 'office'
  const isRTL = locale === 'ar'

  const dynamicBadges: Record<ScreenId | 'notifications', number> = {
    overview: 0,
    requests: requests.length,
    offers: 0,
    orders: orders.filter((o: any) => {
      const status = o.rawStatus || o.status;
      return status !== 'delivered' && status !== 'cancelled';
    }).length,
    deliveries: 0,
    tracking: 0,
    earnings: 0,
    wallet: 0,
    team: 0,
    'captain-tracking': 0,
    performance: 0,
    ratings: 0,
    verification: 0,
    profile: 0,
    support: 0,
    notifications: unreadCount,
  }

  const navigate = (id: ScreenId) => {
    dispatch(setActiveScreen(id))
    dispatch(setSidebarOpen(false))
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (e) {
      console.error('Logout error from sidebar:', e)
    }
    router.push('/login')
  }

  const renderItem = (item: NavEntry) => {
    if (item.officeOnly && !isOffice) return null
    const active = activeScreen === item.id
    const Icon = item.icon
    const badgeVal = dynamicBadges[item.id]
    return (
      <button
        key={item.id}
        onClick={() => navigate(item.id)}
        className={clsx(
          'flex w-full items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 hover:text-[var(--dh-text-main)] hover:bg-[var(--dh-bg-muted)] group',
          active
            ? 'bg-[var(--dh-brand-subtle)] text-[var(--dh-brand)] hover:bg-[var(--dh-brand-subtle)]'
            : 'text-[var(--dh-text-sub)]'
        )}
      >
        <div className="flex items-center gap-3">
          <Icon
            className={clsx(
              'h-4 w-4 transition-transform duration-300 group-hover:scale-105 shrink-0',
              active ? 'text-[var(--dh-brand)]' : 'text-[var(--dh-text-sub)]'
            )}
          />
          <span>{t(item.labelKey)}</span>
        </div>
        {badgeVal > 0 && (
          <span className={clsx(
            "flex items-center justify-center h-5 w-5 rounded-full text-white text-[10px] font-bold shrink-0",
            item.id === 'notifications' ? 'bg-[var(--dh-danger)]' : 'bg-[var(--dh-brand)]'
          )}>
            {badgeVal}
          </span>
        )}
      </button>
    )
  }

  const renderSection = (labelKey: string, items: NavEntry[], showSection = true) => {
    if (!showSection) return null
    const visibleItems = items.filter(i => !i.officeOnly || isOffice)
    if (visibleItems.length === 0) return null
    return (
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-bold text-[var(--dh-text-dim)] uppercase tracking-wider px-3 mb-1 mt-3 text-start">
          {t(labelKey)}
        </p>
        {items.map(renderItem)}
      </div>
    )
  }

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => dispatch(setSidebarOpen(false))}
        />
      )}

      <aside
        className={clsx(
          'fixed md:static top-0 h-screen w-[252px] shrink-0 bg-[var(--dh-bg-card)] border-r border-[var(--dh-border)] text-[var(--dh-text-sub)] p-4 flex flex-col justify-between z-50 transition-transform duration-300',
          isRTL ? 'right-0 border-l border-r-0' : 'left-0',
          sidebarOpen ? 'translate-x-0' : isRTL ? 'translate-x-full md:translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        <div className="flex flex-col gap-5 overflow-y-auto flex-1">
          {/* Brand Logo */}
          <div className="flex items-center justify-between gap-2 px-3 py-2">
            <DelixLogo className="h-8" />
            <button
              onClick={() => dispatch(setSidebarOpen(false))}
              className="md:hidden text-[var(--dh-text-sub)] hover:text-[var(--dh-text-main)]"
            >
              <X size={16} />
            </button>
          </div>

          {/* Account Type Header */}
          <div className="px-3 text-start">
            <span className={clsx(
              'text-[10px] font-bold px-2 py-[2px] rounded-full',
              isOffice ? 'bg-[var(--dh-brand-subtle)] text-[var(--dh-brand)] border border-[var(--dh-brand)]/20' : 'bg-orange-50 text-[var(--dh-accent)] border border-[var(--dh-accent)]/20',
            )}>
              {t(isOffice ? 'accountType_office' : 'accountType_captain')}
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-3">
            {renderSection('nav_shipmentOps', NAV_ITEMS)}
            {renderSection('nav_finance', FINANCE_ITEMS)}
            {renderSection('nav_team_mgmt', TEAM_ITEMS, isOffice)}
            {renderSection('nav_account', ACCOUNT_ITEMS)}
          </nav>
        </div>

        {/* Footer / Copyright or secondary info */}
        <div className="px-3 text-[11px] text-[var(--dh-text-dim)] mt-4 border-t border-[var(--dh-border)] pt-3 text-center">
          <p>{t('copyrightLabel')}</p>
        </div>
      </aside>
    </>
  )
}
