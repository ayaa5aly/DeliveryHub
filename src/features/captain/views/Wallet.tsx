'use client'

import { useState, useMemo } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { useCaptainTranslations } from '@/features/captain/hooks/use-captain-translations'
import { useLocale } from 'next-intl'
import { selectWallet, selectAccountType } from '@/features/captain/store/selectors'
import { fetchCaptainDashboard } from '@/features/captain/store/data-slice'
import { topUp, withdraw } from '@/features/wallet/api'
import Card from '@/shared/ui/Card'
import type { WalletTransaction } from '@/features/wallet/types'
import { Plus, ArrowUpRight, ArrowDownLeft, Wallet as WalletIcon, X } from 'lucide-react'

export default function Wallet() {
  const t = useCaptainTranslations()
  const dispatch = useAppDispatch()
  
  const wallet = useAppSelector(selectWallet)
  const accountType = useAppSelector(selectAccountType)

  const locale = useLocale()
  const isRTL = locale === 'ar'

  // Modals state
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)

  // Forms state
  const [depositAmount, setDepositAmount] = useState('')
  const [depositMethod, setDepositMethod] = useState('visa')
  const [depositPhone, setDepositPhone] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawDest, setWithdrawDest] = useState('')

  // UI state
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const trans = {
    totalAdded: t('totalAddedLabel'),
    totalPulled: t('totalPulledLabel'),
    depositTitle: t('depositTitle'),
    withdrawTitle: t('withdrawTitle'),
    amountLabel: t('amountLabel'),
    methodLabel: t('methodLabel'),
    destinationLabel: t('destinationLabel'),
    cancelBtn: t('cancel'),
    confirmBtn: t('confirmBtn'),
    insufficient: t('insufficientFunds'),
    minAmount: t('minAmountError'),
    loading: t('processing'),
    depositSuccess: t('depositSuccess'),
    withdrawSuccess: t('withdrawSuccessNotice'),
  }

  // Memoized sum of money added and pulled
  const totalAdded = useMemo(() => {
    return (wallet.transactions || [])
      .filter((tx) => tx.type === 'credit')
      .reduce((sum, tx) => sum + tx.amountEGP, 0)
  }, [wallet.transactions])

  const totalPulled = useMemo(() => {
    return (wallet.transactions || [])
      .filter((tx) => tx.type === 'debit')
      .reduce((sum, tx) => sum + tx.amountEGP, 0)
  }, [wallet.transactions])

  // Handlers
  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    const amt = parseFloat(depositAmount)
    if (isNaN(amt) || amt < 10) {
      setErrorMessage(trans.minAmount)
      return
    }

    setLoading(true)
    try {
      const response = await topUp({
        amount: amt,
        paymentMethod: depositMethod,
        phone: depositPhone || '01023456789',
        firstName: 'Captain',
        lastName: 'User',
        email: 'captain@deliverhub.com',
      })

      if (response?.redirectUrl) {
        window.location.href = response.redirectUrl
        return
      }

      // Success callback
      dispatch(fetchCaptainDashboard(accountType))
      setShowDepositModal(false)
      setDepositAmount('')
      setDepositPhone('')
    } catch (err: any) {
      console.error(err)
      setErrorMessage(err.message || 'Deposit failed')
    } finally {
      setLoading(false)
    }
  }

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    const amt = parseFloat(withdrawAmount)
    if (isNaN(amt) || amt < 10) {
      setErrorMessage(trans.minAmount)
      return
    }
    if (amt > wallet.balanceEGP) {
      setErrorMessage(trans.insufficient)
      return
    }

    setLoading(true)
    try {
      await withdraw({
        amount: amt,
        destination: withdrawDest || 'Vodafone Cash Wallet',
      })

      dispatch(fetchCaptainDashboard(accountType))
      setShowWithdrawModal(false)
      setWithdrawAmount('')
      setWithdrawDest('')
    } catch (err: any) {
      console.error(err)
      setErrorMessage(err.message || 'Withdrawal failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="mb-[22px]">
        <h1 className="text-[22px] font-extrabold text-[var(--color-text-main)] mb-1">{t('wallet_title')}</h1>
        <p className="text-[13px] text-[var(--color-text-sub)]">{t('wallet_sub')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Wallet Main Card */}
        <div dir="ltr" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)', color: '#ffffff' }} className="lg:col-span-3 rounded-[16px] p-6 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-white/10 rounded-xl">
              <WalletIcon className="h-7 w-7 text-blue-300" />
            </div>
            <div>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)' }} className="text-[12px] mb-1">{t('availableBalance')}</p>
              <h2 style={{ color: '#ffffff' }} className="text-[32px] font-extrabold leading-none">EGP {wallet.balanceEGP.toLocaleString()}.00</h2>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <button 
              onClick={() => {
                setErrorMessage('')
                setShowDepositModal(true)
              }}
              className="flex-1 md:flex-initial px-5 py-2.5 bg-blue-600 text-white text-[13px] font-bold rounded-xl hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-900/40"
            >
              <Plus className="h-4 w-4" />
              <span>{t('depositTopupBtn')}</span>
            </button>
            <button 
              onClick={() => {
                setErrorMessage('')
                setShowWithdrawModal(true)
              }}
              className="flex-1 md:flex-initial px-5 py-2.5 bg-white text-[#0F172A] text-[13px] font-bold rounded-xl hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-md"
            >
              <ArrowUpRight className="h-4 w-4" />
              <span>{t('withdrawPullBtn')}</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[16px] p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <WalletIcon className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="text-[11px] text-[var(--color-text-sub)] uppercase tracking-wider font-semibold">{t('availableBalance')}</p>
            <p className="text-[18px] font-extrabold text-[var(--color-text-main)] mt-0.5">EGP {wallet.balanceEGP.toLocaleString()}.00</p>
          </div>
        </div>

        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[16px] p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-emerald-500/10 rounded-xl">
            <ArrowDownLeft className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-[11px] text-[var(--color-text-sub)] uppercase tracking-wider font-semibold">{trans.totalAdded}</p>
            <p className="text-[18px] font-extrabold text-emerald-500 mt-0.5">EGP {totalAdded.toLocaleString()}.00</p>
          </div>
        </div>

        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[16px] p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-red-500/10 rounded-xl">
            <ArrowUpRight className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <p className="text-[11px] text-[var(--color-text-sub)] uppercase tracking-wider font-semibold">{trans.totalPulled}</p>
            <p className="text-[18px] font-extrabold text-red-500 mt-0.5">EGP {totalPulled.toLocaleString()}.00</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Transactions */}
        <Card>
          <p className="text-[15px] font-bold text-[var(--color-text-main)] mb-4">{t('recentTransactions')}</p>
          <div className="flex flex-col divide-y divide-[var(--color-border)]">
            {(wallet.transactions || []).length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--color-text-sub)]">
                {t('noTransactionsFound')}
              </div>
            ) : (
              wallet.transactions.map((tx: WalletTransaction) => (
                <div key={tx.id} className="flex justify-between items-center py-3.5 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors px-1">
                  <div>
                    <p className="text-[13px] font-medium text-[var(--color-text-main)]">{tx.description}</p>
                    <p className="text-[11px] text-[var(--color-text-sub)] mt-0.5">{tx.date}</p>
                  </div>
                  <span className={`text-[13px] font-extrabold ${tx.type === 'credit' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {tx.type === 'credit' ? '+' : '-'} EGP {tx.amountEGP.toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* DEPOSIT MODAL */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[20px] max-w-md w-full shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-[var(--color-border)] flex justify-between items-center">
              <h3 className="text-base font-bold text-[var(--color-text-main)]">{trans.depositTitle}</h3>
              <button 
                onClick={() => setShowDepositModal(false)}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[var(--color-text-sub)] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleDepositSubmit} className="p-5 space-y-4">
              {errorMessage && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-lg">
                  {errorMessage}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[var(--color-text-sub)] uppercase tracking-wider mb-2">
                  {trans.amountLabel}
                </label>
                <input 
                  type="number"
                  required
                  min="10"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g. 500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text-sub)] uppercase tracking-wider mb-2">
                  {trans.methodLabel}
                </label>
                <select
                  value={depositMethod}
                  onChange={(e) => setDepositMethod(e.target.value)}
                  className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="visa">{t('visaCard')}</option>
                  <option value="mastercard">{t('mastercard')}</option>
                  <option value="vodafone_cash">{t('vodafoneCash')}</option>
                </select>
              </div>

              {depositMethod === 'vodafone_cash' && (
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-sub)] uppercase tracking-wider mb-2">
                    {t('vodafoneCashPhone')}
                  </label>
                  <input 
                    type="tel"
                    required
                    pattern="01[0-2,5][0-9]{8}"
                    value={depositPhone}
                    onChange={(e) => setDepositPhone(e.target.value)}
                    className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="e.g. 01012345678"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="flex-1 py-3 border border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/5 text-sm font-semibold rounded-xl transition-all"
                >
                  {trans.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50"
                >
                  {loading ? trans.loading : trans.confirmBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WITHDRAW MODAL */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[20px] max-w-md w-full shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-[var(--color-border)] flex justify-between items-center">
              <h3 className="text-base font-bold text-[var(--color-text-main)]">{trans.withdrawTitle}</h3>
              <button 
                onClick={() => setShowWithdrawModal(false)}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[var(--color-text-sub)] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleWithdrawSubmit} className="p-5 space-y-4">
              {errorMessage && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-lg">
                  {errorMessage}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[var(--color-text-sub)] uppercase tracking-wider mb-2">
                  {trans.amountLabel}
                </label>
                <input 
                  type="number"
                  required
                  min="10"
                  max={wallet.balanceEGP}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g. 200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text-sub)] uppercase tracking-wider mb-2">
                  {trans.destinationLabel}
                </label>
                <input 
                  type="text"
                  required
                  value={withdrawDest}
                  onChange={(e) => setWithdrawDest(e.target.value)}
                  className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder={t('withdrawDestPlaceholder')}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 py-3 border border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/5 text-sm font-semibold rounded-xl transition-all"
                >
                  {trans.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50"
                >
                  {loading ? trans.loading : trans.confirmBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
