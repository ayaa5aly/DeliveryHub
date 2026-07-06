'use client'
import { useState, useMemo } from 'react'
import { useAppSelector } from '@/store/hooks'
import { useCaptainTranslations } from '@/features/captain/hooks/use-captain-translations'
import { selectOffers } from '@/features/captain/store/selectors'
import DataTable          from '@/shared/ui/DataTable'
import Badge              from '@/shared/ui/Badge'
import type { ProviderOffer } from '@/features/offers/types'
import { useLocale } from 'next-intl'
import { Search, Filter } from 'lucide-react'

const STATUS_BADGE: Record<ProviderOffer['status'], { variant: 'blue' | 'green' | 'red' | 'amber' | 'gray'; label: 'pendingResponse' | 'accepted' | 'rejected' | 'expired' }> = {
  pending:  { variant: 'amber', label: 'pendingResponse' },
  accepted: { variant: 'green', label: 'accepted' },
  rejected: { variant: 'red',   label: 'rejected' },
  expired:  { variant: 'gray',  label: 'expired' },
}

export default function Offers() {
  const t = useCaptainTranslations()
  const locale = useLocale()
  const offers = useAppSelector(selectOffers) || []

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredOffers = useMemo(() => {
    return offers.filter((o) => {
      const matchesSearch = o.requestId.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [offers, searchTerm, statusFilter])

  const columns = [
    {
      key: 'requestId',
      header: t('request_col'),
      render: (o: ProviderOffer) => (
        <span className="font-semibold text-[var(--color-text-main)]">
          {o.requestId}
        </span>
      )
    },
    {
      key: 'quoteEGP',
      header: t('yourQuote'),
      render: (o: ProviderOffer) => `EGP ${o.quoteEGP}`
    },
    {
      key: 'createdAt',
      header: t('date_col'),
      render: (o: ProviderOffer) => {
        if (!o.createdAt) return '-';
        return new Date(o.createdAt).toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      }
    },
    {
      key: 'status',
      header: t('status_col'),
      render: (o: ProviderOffer) => {
        const s = STATUS_BADGE[o.status]
        return <Badge variant={s.variant}>{t(s.label)}</Badge>
      },
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-[2px]">
        <h1 className="text-[22px] font-extrabold text-[var(--color-text-main)] mb-1">
          {t('offers_title')}
        </h1>
        <p className="text-[13px] text-[var(--color-text-sub)]">
          {t('offers_sub')}
        </p>
      </div>

      {/* Premium Filter and Search Panel */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute top-2.5 left-3 rtl:left-auto rtl:right-3 h-4 w-4 text-[var(--dh-text-muted)]" />
          <input
            type="text"
            className="w-full bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-lg pl-9 pr-4 rtl:pl-4 rtl:pr-9 py-2 text-[var(--color-text-main)] placeholder-[var(--dh-text-muted)] text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            placeholder={t('search_shipment')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div className="relative min-w-[180px]">
          <Filter className="absolute top-2.5 left-3 rtl:left-auto rtl:right-3 h-4 w-4 text-[var(--dh-text-muted)] pointer-events-none" />
          <select
            className="w-full bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-lg pl-9 pr-4 rtl:pl-4 rtl:pr-9 py-2 text-[var(--color-text-main)] text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">{t('filter_all')}</option>
            <option value="pending">{t('pendingResponse')}</option>
            <option value="accepted">{t('accepted')}</option>
            <option value="rejected">{t('rejected')}</option>
            <option value="expired">{t('expired')}</option>
          </select>
        </div>
      </div>

      <DataTable columns={columns} data={filteredOffers} keyField="id" />
    </div>
  )
}
