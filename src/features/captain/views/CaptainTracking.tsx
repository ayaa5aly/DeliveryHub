'use client'

import { useState, useEffect } from 'react'
import { useCaptainTranslations } from '@/features/captain/hooks/use-captain-translations'
import Card from '@/shared/ui/Card'
import { getTeamCaptains, getCaptainTracking } from '@/features/captain/api'
import type { Captain } from '@/features/office/types'
import dynamic from 'next/dynamic'
import { MapPin, Phone, RefreshCw, Search, Shield, Truck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocale } from 'next-intl'

const MapView = dynamic(() => import("@/shared/ui/MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-[450px] w-full bg-[var(--color-bg-muted)] flex items-center justify-center text-sm text-[var(--color-text-sub)] font-semibold border border-[var(--color-border)] rounded-xl">
      Loading Fleet Radar Map / جاري تحميل خريطة الأسطول...
    </div>
  ),
})

export default function CaptainTracking() {
  const t = useCaptainTranslations()
  const locale = useLocale()
  const [captains, setCaptains] = useState<Captain[]>([])
  const [selectedCaptain, setSelectedCaptain] = useState<Captain | null>(null)
  const [trackingDetails, setTrackingDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'offline' | 'busy'>('all')

  const fetchCaptains = async () => {
    try {
      const list = await getTeamCaptains()
      setCaptains(list)
    } catch (err) {
      console.error("Failed to load captains:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCaptains()
    const interval = setInterval(fetchCaptains, 15000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!selectedCaptain) {
      setTrackingDetails(null)
      return
    }

    const fetchDetails = async () => {
      try {
        const details = await getCaptainTracking(selectedCaptain.id)
        setTrackingDetails(details)
      } catch (err) {
        console.error("Failed to fetch tracking details:", err)
      }
    }

    fetchDetails()
    const interval = setInterval(fetchDetails, 8000)
    return () => clearInterval(interval)
  }, [selectedCaptain])

  const filteredCaptains = captains.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.phone.includes(searchQuery)
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getCoordinates = (coords?: [number, number]): [number, number] | undefined => {
    if (!coords || coords.length < 2 || isNaN(coords[0]) || isNaN(coords[1])) return undefined
    return [coords[1], coords[0]]
  }

  const activeShipment = trackingDetails?.activeShipmentTracking?.shipment
  const pickupCoords = getCoordinates(activeShipment?.pickupCoords)
  const deliveryCoords = getCoordinates(activeShipment?.deliveryCoords)
  const captainCoords = getCoordinates(trackingDetails?.lastKnownLocation?.coords)

  return (
    <div className="flex flex-col gap-6 text-[var(--color-text-main)]">
      <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-4">
        <div>
          <h1 className="text-[22px] font-extrabold text-[var(--color-text-main)] mb-1">
            {t('captainTracking_title')}
          </h1>
          <p className="text-[13px] text-[var(--color-text-sub)]">
            {t('captainTracking_sub')}
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true)
            fetchCaptains()
          }}
          className="p-2 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-sub)] hover:text-[var(--color-text-main)] transition-colors"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Side: Captains List */}
        <div className="lg:col-span-4 flex flex-col gap-4 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-4 min-h-[500px]">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--dh-text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchCaptainPlaceholder')}
              className="w-full bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-lg ps-9 pe-4 py-2.5 text-xs text-[var(--color-text-main)] placeholder-[var(--dh-text-muted)] focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-4 gap-1 p-0.5 bg-[var(--color-bg-muted)] rounded-lg border border-[var(--color-border)] text-[10px] font-bold">
            {(['all', 'available', 'busy', 'offline'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={cn(
                  "py-1.5 rounded text-center capitalize transition-colors",
                  statusFilter === filter
                    ? "bg-[var(--color-bg-card)] text-blue-500 shadow-sm"
                    : "text-[var(--dh-text-muted)] hover:text-[var(--color-text-sub)]"
                )}
              >
                {filter === 'all' && t('allFilter')}
                {filter === 'available' && t('onlineFilter')}
                {filter === 'busy' && t('busyFilter')}
                {filter === 'offline' && t('offlineFilter')}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto max-h-[380px] flex flex-col gap-2 pr-1">
            {filteredCaptains.length === 0 ? (
              <div className="text-center py-8 text-xs text-[var(--dh-text-muted)]">
                {t('noCaptainsFound')}
              </div>
            ) : (
              filteredCaptains.map((captain) => (
                <button
                  key={captain.id}
                  onClick={() => setSelectedCaptain(captain)}
                  className={cn(
                    "w-full text-left rtl:text-right p-3 rounded-lg border transition-all duration-200 flex items-center justify-between gap-3",
                    selectedCaptain?.id === captain.id
                      ? "bg-blue-600/10 border-blue-500"
                      : "bg-[var(--color-bg-card)] border-[var(--color-border)] hover:bg-[var(--color-bg-muted)] hover:border-[var(--color-border)]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-9 w-9 rounded-full bg-[var(--color-bg-muted)] border border-[var(--color-border)] flex items-center justify-center font-bold text-xs text-[var(--color-text-main)]">
                        {captain.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className={cn(
                        "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--color-bg-card)] shadow-sm",
                        captain.status === 'available' && "bg-emerald-500",
                        captain.status === 'busy' && "bg-amber-500",
                        captain.status === 'offline' && "bg-zinc-600"
                      )} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[var(--color-text-main)]">{captain.name}</span>
                      <span className="text-[10px] text-[var(--color-text-sub)] font-medium flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3 text-[var(--dh-text-muted)]" /> {captain.phone}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={cn(
                      "text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded tracking-wider",
                      captain.status === 'available' && "text-emerald-500 bg-emerald-500/10",
                      captain.status === 'busy' && "text-amber-500 bg-amber-500/10",
                      captain.status === 'offline' && "text-zinc-500 bg-zinc-500/10"
                    )}>
                      {captain.status}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Detailed Info & Map */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {selectedCaptain ? (
            <div className="flex flex-col gap-4">
              <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Truck className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[var(--color-text-main)]">{selectedCaptain.name}</span>
                      <span className="text-xs text-[var(--color-text-sub)] mt-0.5 flex items-center gap-1.5">
                        <Shield className="h-3.5 w-3.5 text-[var(--dh-text-muted)]" />
                        {activeShipment 
                          ? `${t('activeOrderLabel')}: ${activeShipment.trackingNumber}`
                          : t('noActiveShipmentLabel')}
                      </span>
                    </div>
                  </div>
                  {activeShipment && (
                    <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20 tracking-wider">
                      {activeShipment.status}
                    </span>
                  )}
                </div>

                {activeShipment && (
                  <div className="text-[11px] bg-[var(--color-bg-muted)] p-2.5 rounded-lg border border-[var(--color-border)] flex flex-col gap-1 text-[var(--color-text-sub)]">
                    <div>
                      <span className="font-bold text-[var(--dh-text-muted)]">{t('pickup')}:</span> {activeShipment.pickupAddress}
                    </div>
                    <div className="mt-0.5">
                      <span className="font-bold text-[var(--dh-text-muted)]">{t('dropoff')}:</span> {activeShipment.deliveryAddress}
                    </div>
                  </div>
                )}
              </div>

              <MapView
                pickupCoords={pickupCoords}
                deliveryCoords={deliveryCoords}
                captainCoords={captainCoords}
                zoom={13}
                height="400px"
              />
            </div>
          ) : (
            <Card className="flex-1 flex flex-col items-center justify-center text-center p-8 border-dashed min-h-[450px]">
              <div className="h-14 w-14 rounded-full bg-[var(--color-bg-muted)] border border-[var(--color-border)] flex items-center justify-center text-2xl mb-4 shadow-sm">
                📡
              </div>
              <h3 className="text-sm font-bold text-[var(--color-text-main)] mb-1">
                {t('selectCaptainTitle')}
              </h3>
              <p className="text-xs text-[var(--color-text-sub)] max-w-xs leading-relaxed">
                {t('selectCaptainDesc')}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
