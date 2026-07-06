'use client'

import React, { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { updateProfile } from '@/features/captain/store/data-slice'
import { selectProfile, selectVerification, selectAccountType } from '@/features/captain/store/selectors'
import { useCaptainTranslations } from '@/features/captain/hooks/use-captain-translations'
import { getProviderProfile, updateProviderProfile, uploadAvatar } from '@/features/profile'
import { User, Phone, CheckCircle, Eye, Camera } from 'lucide-react'
import { useLocale } from 'next-intl'

export default function Profile() {
  const dispatch = useAppDispatch()
  const t = useCaptainTranslations()
  const profile = useAppSelector(selectProfile)
  const verification = useAppSelector(selectVerification)
  const accountType = useAppSelector(selectAccountType)
  const locale = useLocale()

  const [activeTab, setActiveTab] = useState<'info' | 'edit'>('info')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const [name, setName] = useState(profile.name)
  const [phone, setPhone] = useState(profile.phone)

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const res = await uploadAvatar(file)
      dispatch(updateProfile({ avatar: res.url }))
      window.dispatchEvent(new Event("profile-updated"))
      setSuccessMessage(t('avatarUpdatedSuccess'))
      setTimeout(() => setSuccessMessage(''), 4000)
    } catch (err) {
      console.error("Failed to upload avatar:", err)
    } finally {
      setIsUploading(false)
    }
  }

  useEffect(() => {
    getProviderProfile()
      .then((data) => {
        dispatch(updateProfile(data))
        setName(data.name)
        setPhone(data.phone)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to fetch provider profile:", err)
        setLoading(false)
      })
  }, [dispatch])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = await updateProviderProfile({ name, phone })
      dispatch(updateProfile(data))
      window.dispatchEvent(new Event("profile-updated"))
      setSuccessMessage(t('profileUpdatedSuccess'))
      setActiveTab('info')
      setTimeout(() => setSuccessMessage(''), 4000)
    } catch (err) {
      console.error("Failed to update profile:", err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-[var(--color-text-sub)] text-sm font-semibold">
        <div className="h-6 w-6 rounded-full border-2 border-t-blue-500 border-[var(--color-border)] animate-spin mr-2" />
        <span>{t('loadingProfile')}</span>
      </div>
    )
  }

  const avatarLetters = profile.name
    ? profile.name
        .split(' ')
        .map((w: string) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U'

  const isOffice = accountType === 'office'

  return (
    <div className="flex flex-col gap-6 text-[var(--color-text-main)] max-w-3xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">{t('profile_title')}</h1>
        <p className="text-xs text-[var(--color-text-sub)] mt-1">{t('profile_sub')}</p>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Side Profile Summary */}
        <div className="md:col-span-4 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-6 flex flex-col items-center text-center gap-4 shadow-sm">
          <div className="relative group">
            <input
              type="file"
              id="avatarInput"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
              disabled={isUploading}
            />
            <div
              className={`flex items-center justify-center h-20 w-20 rounded-full overflow-hidden border-4 border-[var(--color-border)] bg-[var(--color-bg-muted)] text-white font-extrabold text-2xl relative transition-all duration-200 group-hover:border-blue-500 ${
                isUploading ? 'animate-pulse opacity-60' : ''
              }`}
            >
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                avatarLetters
              )}
              
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full">
                {profile.avatar && (
                  <button
                    type="button"
                    onClick={() => setShowPreview(true)}
                    className="p-1.5 rounded-full bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-muted)] text-white transition-colors focus:outline-none"
                    title={t('viewPhoto')}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                )}
                <label
                  htmlFor="avatarInput"
                  className="p-1.5 rounded-full bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-muted)] text-white transition-colors cursor-pointer"
                  title={t('changePhoto')}
                >
                  <Camera className="h-4 w-4" />
                </label>
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-[var(--color-text-main)]">{profile.name}</span>
            <span className="text-[10px] text-[var(--dh-text-muted)] mt-1 uppercase tracking-wider font-bold">
              {t(isOffice ? 'accountType_office' : 'accountType_captain')}
            </span>
          </div>
          {verification.isVerified ? (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {t('verifiedBadge')}
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {t('notVerifiedBadge')}
            </span>
          )}
        </div>

        {/* Right Side Settings Tabs */}
        <div className="md:col-span-8 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-sm flex flex-col">
          {/* Tab Header Selector */}
          <div className="flex border-b border-[var(--color-border)] bg-[var(--color-bg-muted)]/40">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 focus:outline-none ${
                activeTab === 'info'
                  ? "border-blue-500 text-blue-500 bg-[var(--color-bg-muted)]/50"
                  : "border-transparent text-[var(--dh-text-muted)] hover:text-[var(--color-text-sub)]"
              }`}
            >
              {t('overviewTab')}
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 focus:outline-none ${
                activeTab === 'edit'
                  ? "border-blue-500 text-blue-500 bg-[var(--color-bg-muted)]/50"
                  : "border-transparent text-[var(--dh-text-muted)] hover:text-[var(--color-text-sub)]"
              }`}
            >
              {t('editTab')}
            </button>
          </div>

          {/* Tab Body Contents */}
          <div className="p-6">
            {activeTab === 'info' ? (
              <div className="flex flex-col gap-5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--dh-text-muted)]">
                  {t('accountDetailsTitle')}
                </h2>

                <div className="flex flex-col gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-[var(--dh-text-muted)] shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-[var(--dh-text-muted)] font-medium">{t('legalName')}</span>
                      <span className="text-[var(--color-text-main)] font-semibold mt-0.5">{profile.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-[var(--dh-text-muted)] shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-[var(--dh-text-muted)] font-medium">{t('contactNumber')}</span>
                      <span className="text-[var(--color-text-main)] font-semibold mt-0.5">{profile.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="flex flex-col gap-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--dh-text-muted)] mb-1">
                  {t('updateProfileTitle')}
                </h2>

                {/* Name Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[var(--color-text-sub)]">
                    {t('legalName')}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder={profile.name}
                  />
                </div>

                {/* Phone Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[var(--color-text-sub)]">
                    {t('contactNumber')}
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder={profile.phone}
                  />
                </div>

                {/* Save Button */}
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md focus:outline-none mt-2"
                >
                  {t('saveProfile')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {showPreview && profile.avatar && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
          onClick={() => setShowPreview(false)}
        >
          <div 
            className="relative max-w-lg w-full bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-2 overflow-hidden shadow-2xl flex flex-col items-center animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex justify-between items-center px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-bg-muted)]/40">
              <span className="text-xs font-bold text-[var(--color-text-main)]">{t('viewProfilePhotoTitle')}</span>
              <button 
                onClick={() => setShowPreview(false)}
                className="text-[var(--dh-text-muted)] hover:text-[var(--color-text-main)] text-xs font-bold px-2.5 py-1 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors focus:outline-none"
              >
                {t('closeBtn')}
              </button>
            </div>
            <div className="flex items-center justify-center p-6 w-full aspect-square bg-[var(--color-bg-muted)]/20">
              <img 
                src={profile.avatar} 
                alt={profile.name} 
                className="max-h-[60vh] max-w-full rounded-xl object-contain shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
