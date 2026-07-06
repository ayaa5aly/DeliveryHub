'use client'

import React, { useState } from 'react'
import { UserPlus, X, User, Mail, Phone as PhoneIcon, Key, Truck, Hash, CheckCircle, AlertTriangle } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { useCaptainTranslations } from '@/features/captain/hooks/use-captain-translations'
import { selectCaptains } from '@/features/captain/store/selectors'
import { addCaptainToStore, updateCaptainStatusInStore } from '@/features/captain/store/data-slice'
import { addTeamCaptain, updateCaptainStatus } from '@/features/office/api'
import DataTable from '@/shared/ui/DataTable'
import Badge from '@/shared/ui/Badge'
import type { Captain } from '@/features/office/types'
import { useLocale } from 'next-intl'
import clsx from 'clsx'

const STATUS_MAP: Record<Captain['status'], { variant: 'green' | 'amber' | 'gray'; label: 'available' | 'busy' | 'offline' }> = {
  available: { variant: 'green', label: 'available' },
  busy:      { variant: 'amber', label: 'busy' },
  offline:   { variant: 'gray',  label: 'offline' },
}

function StatusCell({ captain, t }: { captain: Captain; t: any }) {
  const dispatch = useAppDispatch()
  const [updating, setUpdating] = useState(false)

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as Captain['status']
    setUpdating(true)
    try {
      await updateCaptainStatus(captain.id, newStatus)
      dispatch(updateCaptainStatusInStore({ id: captain.id, status: newStatus }))
    } catch (err) {
      console.error("Failed to update status", err)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {updating ? (
        <div className="h-3.5 w-3.5 rounded-full border-2 border-t-transparent border-blue-500 animate-spin shrink-0" />
      ) : (
        <span className={clsx(
          "h-2 w-2 rounded-full shrink-0",
          captain.status === 'available' && "bg-emerald-500",
          captain.status === 'busy' && "bg-amber-500",
          captain.status === 'offline' && "bg-zinc-500"
        )} />
      )}
      <select
        value={captain.status}
        disabled={updating}
        onChange={handleStatusChange}
        className="bg-transparent border-none text-xs font-semibold text-[var(--color-text-main)] hover:bg-[var(--color-bg-muted)] rounded px-1.5 py-0.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="available" className="bg-[var(--color-bg-card)] text-[var(--color-text-main)]">{t('available')}</option>
        <option value="busy" className="bg-[var(--color-bg-card)] text-[var(--color-text-main)]">{t('busy')}</option>
        <option value="offline" className="bg-[var(--color-bg-card)] text-[var(--color-text-main)]">{t('offline')}</option>
      </select>
    </div>
  )
}

export default function TeamCaptains() {
  const t = useCaptainTranslations()
  const dispatch = useAppDispatch()
  const captains = useAppSelector(selectCaptains)
  const locale = useLocale()
  const isRTL = locale === 'ar'

  // Modal State
  const [isOpen, setIsOpen] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [vehicleType, setVehicleType] = useState<'motorcycle' | 'car' | 'van' | 'truck'>('motorcycle')
  const [plateNumber, setPlateNumber] = useState('')

  // Action Status
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [tempPassword, setTempPassword] = useState('')
  const [successCaptain, setSuccessCaptain] = useState<Captain | null>(null)

  const handleOpen = () => {
    setIsOpen(true)
    setErrorMsg('')
    setTempPassword('')
    setSuccessCaptain(null)
    setFullName('')
    setEmail('')
    setPhone('')
    setPassword('')
    setVehicleType('motorcycle')
    setPlateNumber('')
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setTempPassword('')
    setSuccessCaptain(null)

    // Validation
    if (!fullName || !email || !phone || !plateNumber) {
      setErrorMsg(t('fillRequiredFields'))
      return
    }

    const phonePattern = /^01[0125][0-9]{8}$/
    if (!phonePattern.test(phone)) {
      setErrorMsg(t('invalidPhone'))
      return
    }

    setSubmitting(true)
    try {
      const response = await addTeamCaptain({
        fullName,
        email,
        phone,
        password: password || undefined,
        vehicleType,
        plateNumber,
      })

      dispatch(addCaptainToStore(response.captain))
      setSuccessCaptain(response.captain)
      if (response.temporaryPassword) {
        setTempPassword(response.temporaryPassword)
      }
    } catch (err: any) {
      console.error(err)
      const msg = err?.response?.data?.message || err?.message || t('addCaptainError')
      setErrorMsg(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const columns = [
    { key: 'name',   header: t('captain_col'), render: (c: Captain) => (
        <div className="flex items-center gap-2">
          <span className={clsx(
            "h-2 w-2 rounded-full shrink-0",
            c.status === 'available' && "bg-emerald-500",
            c.status === 'busy' && "bg-amber-500",
            c.status === 'offline' && "bg-zinc-500"
          )} />
          <span className="font-semibold text-[var(--color-text-main)]">{c.name}</span>
        </div>
      )
    },
    { key: 'phone',  header: t('phone_col') },
    { key: 'status', header: t('status_col'), render: (c: Captain) => <StatusCell captain={c} t={t} /> },
  ]

  return (
    <div className="relative">
      <div className="flex items-start justify-between mb-[22px]">
        <div>
          <h1 className="text-[22px] font-extrabold text-[var(--color-text-main)] mb-1">{t('team_title')}</h1>
          <p className="text-[13px] text-[var(--color-text-sub)]">{t('team_sub')}</p>
        </div>
        <button
          onClick={handleOpen}
          className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all shadow-md focus:outline-none"
        >
          <UserPlus size={14} />
          {t('addCaptain')}
        </button>
      </div>

      <DataTable columns={columns} data={captains} keyField="id" />

      {/* Modern Add Captain Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-muted)]/20">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-main)]">
                {t('addCaptainTitle')}
              </h2>
              <button
                onClick={handleClose}
                className="p-1 rounded-lg text-[var(--dh-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-muted)] transition-colors focus:outline-none"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <div className="p-6 overflow-y-auto flex-1">
              {successCaptain ? (
                // Success screen
                <div className="flex flex-col items-center text-center py-6 gap-4">
                  <div className="h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[var(--color-text-main)]">
                      {t('captainRegisteredSuccess')}
                    </h3>
                    <p className="text-xs text-[var(--color-text-sub)] mt-1 max-w-[260px] mx-auto">
                      {t('captainAddedToList', { name: successCaptain.name })}
                    </p>
                  </div>

                  {tempPassword && (
                    <div className="w-full bg-[var(--color-bg-muted)]/60 border border-[var(--color-border)] p-4 rounded-xl flex flex-col gap-1.5 mt-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--dh-text-muted)]">
                        {t('tempPasswordLabel')}
                      </span>
                      <span className="text-sm font-mono font-bold text-blue-500 bg-[var(--color-bg-card)] border border-[var(--color-border)] py-2 px-3 rounded-lg select-all">
                        {tempPassword}
                      </span>
                      <span className="text-[10px] text-[var(--dh-text-muted)]">
                        {t('tempPasswordHint')}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={handleClose}
                    className="w-full mt-4 py-2.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md focus:outline-none"
                  >
                    {t('closeConfirmation')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {errorMsg && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Full Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[var(--color-text-sub)]">
                      {t('fullNameLabel')} *
                    </label>
                    <div className="relative">
                      <User className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--dh-text-muted)]" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={t('fullNamePlaceholder')}
                        className="w-full bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-lg ps-9 pe-4 py-2.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[var(--color-text-sub)]">
                      {t('emailLabel')} *
                    </label>
                    <div className="relative">
                      <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--dh-text-muted)]" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-lg ps-9 pe-4 py-2.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[var(--color-text-sub)]">
                      {t('phoneLabel')} *
                    </label>
                    <div className="relative">
                      <PhoneIcon className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--dh-text-muted)]" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 01012345678"
                        className="w-full bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-lg ps-9 pe-4 py-2.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[var(--color-text-sub)] flex items-center justify-between">
                      <span>{t('passwordLabel')}</span>
                      <span className="text-[10px] text-[var(--dh-text-muted)] font-normal">
                        ({t('passwordOptionalHint')})
                      </span>
                    </label>
                    <div className="relative">
                      <Key className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--dh-text-muted)]" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t('passwordPlaceholder')}
                        className="w-full bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-lg ps-9 pe-4 py-2.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Vehicle Type */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[var(--color-text-sub)]">
                        {t('vehicleTypeLabel')} *
                      </label>
                      <div className="relative">
                        <Truck className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--dh-text-muted)] pointer-events-none" />
                        <select
                          value={vehicleType}
                          onChange={(e) => setVehicleType(e.target.value as any)}
                          className="w-full bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-lg ps-9 pe-4 py-2.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-blue-500 appearance-none transition-colors"
                        >
                          <option value="motorcycle" className="bg-[var(--color-bg-card)] text-[var(--color-text-main)]">{t('vehicleMotorcycle')}</option>
                          <option value="car" className="bg-[var(--color-bg-card)] text-[var(--color-text-main)]">{t('vehicleCar')}</option>
                          <option value="van" className="bg-[var(--color-bg-card)] text-[var(--color-text-main)]">{t('vehicleVan')}</option>
                          <option value="truck" className="bg-[var(--color-bg-card)] text-[var(--color-text-main)]">{t('vehicleTruck')}</option>
                        </select>
                      </div>
                    </div>

                    {/* Plate Number */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[var(--color-text-sub)]">
                        {t('plateNumberLabel')} *
                      </label>
                      <div className="relative">
                        <Hash className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--dh-text-muted)]" />
                        <input
                          type="text"
                          required
                          value={plateNumber}
                          onChange={(e) => setPlateNumber(e.target.value)}
                          placeholder={t('plateNumberPlaceholder')}
                          className="w-full bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-lg ps-9 pe-4 py-2.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 transition-all shadow-md focus:outline-none mt-2 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="h-3.5 w-3.5 rounded-full border-2 border-t-white border-blue-800 animate-spin" />
                        <span>{t('addingCaptain')}</span>
                      </>
                    ) : (
                      <span>{t('registerCaptainBtn')}</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
