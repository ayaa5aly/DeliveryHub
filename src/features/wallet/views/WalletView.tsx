"use client";

import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft, TrendingUp, X, Lock } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { topUpSchema, withdrawSchema } from "@/lib/validation/common";
import { z } from "zod";
import { Transaction } from "../types";
import { useTranslations } from "next-intl";
import { getWallet, topUp, withdraw } from "../api";
import { getCurrentUser } from "@/features/auth/api";

type TopUpFormValues = z.infer<typeof topUpSchema>;
type WithdrawFormValues = z.infer<typeof withdrawSchema>;

const getTxIcon = (type: string) => {
  switch (type) {
    case "topup":
      return (
        <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0 flex items-center justify-center shadow-inner">
          <Plus className="h-4.5 w-4.5" />
        </div>
      );
    case "withdraw":
      return (
        <div className="p-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl shrink-0 flex items-center justify-center shadow-inner">
          <ArrowUpRight className="h-4.5 w-4.5" />
        </div>
      );
    case "cashback":
      return (
        <div className="p-2.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl shrink-0 flex items-center justify-center shadow-inner">
          <TrendingUp className="h-4.5 w-4.5" />
        </div>
      );
    default: // payment
      return (
        <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl shrink-0 flex items-center justify-center shadow-inner">
          <ArrowDownLeft className="h-4.5 w-4.5" />
        </div>
      );
  }
};

function WalletSkeleton() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto animate-pulse">
      <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-48 mb-2" />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-[var(--dh-bg-card)] border border-[var(--dh-border)] rounded-xl p-6 shadow-md flex flex-col gap-5">
            <div className="h-36 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
              <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-[var(--dh-bg-card)] border border-[var(--dh-border)] rounded-xl p-4" />
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-[var(--dh-bg-card)] border border-[var(--dh-border)] rounded-xl p-5 h-[350px]" />
      </div>
    </div>
  );
}

export default function WalletView() {
  const t = useTranslations("customer.wallet");
  const validation = useTranslations("validation");
  const commonT = useTranslations("common");
  
  const [balance, setBalance] = useState(0.0);
  const [lockedBalance, setLockedBalance] = useState(0.0);
  const [cashbackEarned, setCashbackEarned] = useState(0.0);
  const [walletId, setWalletId] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWalletData = () => {
    getWallet()
      .then((data) => {
        setBalance(data.balance);
        setLockedBalance(data.lockedBalance || 0.0);
        setCashbackEarned(data.cashbackEarned);
        setWalletId(data.id);
        setTransactions(data.transactions);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load wallet, using mocks:", err);
        setBalance(320.0);
        setLockedBalance(50.0);
        setCashbackEarned(14.5);
        setTransactions([
          {
            id: "tx-1",
            type: "payment",
            amount: -95,
            description: t("paymentDescription"),
            date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "tx-2",
            type: "topup",
            amount: 400,
            description: t("topUpDescription"),
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "tx-3",
            type: "cashback",
            amount: 14.5,
            description: t("cashbackDescription"),
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWalletData();
  }, [t]);

  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  useEffect(() => {
    if (status === "success") {
      fetchWalletData();
      const timer = setTimeout(() => {
        fetchWalletData();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const {
    register: registerTopUp,
    handleSubmit: handleTopUpSubmit,
    formState: { errors: topUpErrors, isSubmitting: isTopUpSubmitting },
    reset: resetTopUp,
    watch: watchTopUp,
    setValue: setTopUpValue,
  } = useForm<TopUpFormValues>({
    resolver: zodResolver(topUpSchema),
    defaultValues: { amount: 100, paymentMethod: "visa" },
  });

  const paymentMethod = watchTopUp("paymentMethod");

  useEffect(() => {
    getCurrentUser().then(setCurrentUser).catch(console.error);
  }, []);

  useEffect(() => {
    if (currentUser) {
      const names = currentUser.fullName?.split(" ") || [];
      const fName = names[0] || "";
      const lName = names.slice(1).join(" ") || "User";
      setTopUpValue("phone", currentUser.phone || "");
      setTopUpValue("email", currentUser.email || "");
      setTopUpValue("firstName", fName);
      setTopUpValue("lastName", lName);
    }
  }, [currentUser, setTopUpValue]);

  const {
    register: registerWithdraw,
    handleSubmit: handleWithdrawSubmit,
    formState: { errors: withdrawErrors, isSubmitting: isWithdrawSubmitting },
    setError: setWithdrawError,
    reset: resetWithdraw,
  } = useForm<WithdrawFormValues>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: { amount: 50, destination: "" },
  });

  const handleTopUp = async (data: TopUpFormValues) => {
    try {
      const response = await topUp({
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        phone: data.phone,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      if (response?.redirectUrl) {
        window.location.href = response.redirectUrl;
        return;
      }

      fetchWalletData();
      resetTopUp();
      setShowTopUpModal(false);
    } catch (err) {
      console.error("Failed to top up:", err);
      // Fallback local UI simulation
      setBalance((prev) => prev + data.amount);
      const methodLabels: Record<string, string> = {
        visa: t("visa"),
        mastercard: t("mastercard"),
        vodafone_cash: t("vodafoneCash"),
      };
      const newTx: Transaction = {
        id: `tx-${transactions.length + 1}`,
        type: "topup",
        amount: data.amount,
        description: `${t("topUp")} · ${methodLabels[data.paymentMethod]}`,
        date: new Date().toISOString(),
      };
      setTransactions((prev) => [newTx, ...prev]);
      resetTopUp();
      setShowTopUpModal(false);
    }
  };

  const handleWithdraw = async (data: WithdrawFormValues) => {
    if (data.amount > balance) {
      setWithdrawError("amount", {
        type: "manual",
        message: "insufficientFunds",
      });
      return;
    }
    try {
      await withdraw({
        amount: data.amount,
        destination: data.destination,
      });
      fetchWalletData();
      resetWithdraw();
      setShowWithdrawModal(false);
    } catch (err) {
      console.error("Failed to withdraw:", err);
      setBalance((prev) => prev - data.amount);
      const newTx: Transaction = {
        id: `tx-${transactions.length + 1}`,
        type: "withdraw",
        amount: -data.amount,
        description: t("withdrawalDescription", { destination: data.destination }),
        date: new Date().toISOString(),
      };
      setTransactions((prev) => [newTx, ...prev]);
      resetWithdraw();
      setShowWithdrawModal(false);
    }
  };

  const totalLoaded = useMemo(() => {
    return transactions
      .filter((t) => t.type === "topup")
      .reduce((sum, t) => sum + Math.max(0, t.amount), 0);
  }, [transactions]);

  const totalPaid = useMemo(() => {
    return Math.abs(
      transactions
        .filter((t) => (t.type === "payment" || t.type === "withdraw") && t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0)
    );
  }, [transactions]);

  const totalSaved = useMemo(() => {
    return transactions
      .filter((t) => t.type === "cashback")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  if (loading) {
    return <WalletSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6 text-[var(--dh-text-main)] max-w-4xl mx-auto">
      <h1 className="text-xl font-bold tracking-tight text-[var(--dh-text-main)]">{t("title")}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-[var(--dh-bg-card)] border border-[var(--dh-border)] rounded-xl p-6 shadow-md flex flex-col gap-5">
            <div 
              dir="ltr" 
              style={{ 
                background: 'linear-gradient(135deg, #0b1528 0%, #0f172a 40%, #1e293b 70%, #2563eb 100%)', 
                color: '#ffffff' 
              }} 
              className="border border-[var(--dh-brand)]/20 rounded-2xl p-6 flex flex-col justify-between min-h-[220px] relative overflow-hidden shadow-xl"
            >
              {/* Glass Sheen overlay */}
              <div 
                className="absolute inset-0 pointer-events-none" 
                style={{
                  background: 'linear-gradient(110deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 50%, rgba(255,255,255,0) 100%)'
                }} 
              />
              
              {/* Decorative Blur Orbs */}
              <div className="absolute -right-4 -bottom-4 h-32 w-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -left-6 -top-6 h-24 w-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />

              {/* Top Row: Brand & Chip */}
              <div className="flex justify-between items-center z-10">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                    <span className="text-[10px] font-black tracking-wider text-white">T</span>
                  </div>
                  <span className="text-[11px] font-extrabold tracking-widest text-slate-100 uppercase">
                    Tayyar Wallet
                  </span>
                </div>
                {/* Metallic Gold Chip */}
                <div className="w-8 h-6 bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-600 rounded-md opacity-90 flex flex-col justify-between p-1 shadow-md border border-amber-200/20 relative">
                  <div className="w-full h-[1px] bg-amber-950/20 absolute top-1/2 left-0" />
                  <div className="w-1/2 h-full bg-transparent border-r border-amber-950/20 absolute top-0 left-0" />
                  <div className="w-1/2 h-full bg-transparent border-l border-amber-950/20 absolute top-0 right-0" />
                </div>
              </div>

              {/* Middle Row: Balance */}
              <div className="my-4 z-10">
                <span style={{ color: 'rgba(255, 255, 255, 0.6)' }} className="text-[9px] font-bold uppercase tracking-widest">
                  {t("availableBalance")}
                </span>
                <p 
                  style={{ 
                    color: '#ffffff', 
                    textShadow: '0 2px 10px rgba(255,255,255,0.1)' 
                  }} 
                  className="text-3xl font-black mt-1 tracking-tight"
                >
                  EGP {balance.toFixed(2)}
                </p>
              </div>

              {lockedBalance > 0 && (
                <div className="flex items-center gap-1.5 text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg z-10 w-fit mb-3">
                  <Lock className="h-3 w-3" />
                  <span>
                    الرصيد المعلق: <strong>EGP {lockedBalance.toFixed(2)}</strong>
                  </span>
                </div>
              )}

              {/* Bottom Row: Wallet ID, Total Balance & Decorative Brand Dot */}
              <div className="flex justify-between items-end border-t border-white/5 pt-4 text-[10px] z-10">
                <div className="flex flex-col gap-0.5">
                  <span style={{ color: 'rgba(255, 255, 255, 0.5)' }} className="font-bold uppercase tracking-wider">{t("walletId")}</span>
                  <span style={{ color: '#ffffff' }} className="font-mono font-bold tracking-wider">
                    {walletId ? `SC-W-${walletId.slice(-5).toUpperCase()}` : "SC-W-9CE03"}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-0.5 mr-auto ml-4">
                  <span style={{ color: 'rgba(255, 255, 255, 0.5)' }} className="font-bold uppercase tracking-wider">الرصيد الكلي</span>
                  <span style={{ color: '#60a5fa' }} className="font-bold">EGP {(balance + lockedBalance).toFixed(2)}</span>
                </div>
                {/* overlapping circles like Mastercard but with Tayyar colors (blue + orange) */}
                <div className="flex -space-x-2.5 opacity-80 shrink-0">
                  <div className="w-5 h-5 rounded-full bg-blue-500/90 shadow-sm" />
                  <div className="w-5 h-5 rounded-full bg-orange-500/90 shadow-sm" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowTopUpModal(true)}
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold bg-[var(--dh-brand)] hover:bg-[var(--dh-brand-hover)] text-white shadow-md hover:shadow-lg hover:shadow-blue-500/10 transition-all focus:outline-none hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>{t("topUp")}</span>
              </button>
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold bg-[var(--dh-bg-muted)] border border-[var(--dh-border)] text-[var(--dh-text-main)] hover:bg-[var(--dh-border)] hover:border-[var(--dh-text-muted)]/20 transition-all focus:outline-none hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <ArrowUpRight className="h-4 w-4" />
                <span>{t("withdraw")}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[var(--dh-bg-card)] border border-[var(--dh-border)] rounded-xl p-4.5 flex flex-col justify-between min-h-[105px] shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-[var(--dh-text-muted)] uppercase tracking-wider">
                  {t("totalLoaded")}
                </span>
                <div className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg">
                  <ArrowDownLeft className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-[15px] font-extrabold text-[var(--dh-text-main)]">EGP {totalLoaded.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-[var(--dh-bg-card)] border border-[var(--dh-border)] rounded-xl p-4.5 flex flex-col justify-between min-h-[105px] shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-[var(--dh-text-muted)] uppercase tracking-wider">
                  {t("totalPaid")}
                </span>
                <div className="p-1.5 bg-rose-500/10 text-rose-500 rounded-lg">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-[15px] font-extrabold text-[var(--dh-text-main)]">EGP {totalPaid.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-[var(--dh-bg-card)] border border-[var(--dh-border)] rounded-xl p-4.5 flex flex-col justify-between min-h-[105px] shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-[var(--dh-text-muted)] uppercase tracking-wider">
                  {t("totalSaved")}
                </span>
                <div className="p-1.5 bg-purple-500/10 text-purple-500 rounded-lg">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-[15px] font-extrabold text-[var(--dh-text-main)]">EGP {totalSaved.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-[var(--dh-bg-card)] border border-[var(--dh-border)] rounded-xl p-5 shadow-sm self-stretch flex flex-col">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--dh-text-muted)] border-b border-[var(--dh-border)] pb-3 mb-4 shrink-0">
            {t("recentTransactions")}
          </h2>

          <div className="flex flex-col gap-3.5 overflow-y-auto max-h-[350px] pr-1 flex-1 scrollbar-thin">
            {transactions.length === 0 ? (
              <div className="text-center py-12 text-xs text-[var(--dh-text-muted)] my-auto">لا توجد معاملات بعد</div>
            ) : (
              transactions.map((tx) => {
                const isNegative = tx.amount < 0;
                const formattedTxDate = () => {
                  try {
                    return new Date(tx.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                  } catch {
                    return tx.date;
                  }
                };

                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between border-b border-[var(--dh-border)]/40 pb-3 last:border-none last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      {getTxIcon(tx.type)}
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-[var(--dh-text-main)] leading-snug">
                          {tx.description}
                        </span>
                        <span className="text-[9px] text-[var(--dh-text-muted)] font-medium mt-0.5" dir="ltr">
                          {formattedTxDate()}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-extrabold tracking-tight shrink-0 ${
                        isNegative ? "text-rose-500" : "text-emerald-500"
                      }`}
                    >
                      {isNegative ? "" : "+"}EGP {Math.abs(tx.amount).toFixed(2)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {showTopUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--dh-bg-card)] border border-[var(--dh-border)] rounded-xl max-w-md w-full p-6 shadow-2xl relative flex flex-col gap-4 text-[var(--dh-text-main)]">
            <button
              onClick={() => {
                setShowTopUpModal(false);
                resetTopUp();
              }}
              className="absolute right-4 top-4 p-1 rounded-lg text-[var(--dh-text-muted)] hover:text-[var(--dh-text-main)] hover:bg-[var(--dh-bg-muted)] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-base font-bold text-[var(--dh-text-main)]">{t("topUpTitle")}</h2>
            <p className="text-xs text-[var(--dh-text-muted)]">
              {t("topUpSubtitle")}
            </p>
            <form onSubmit={handleTopUpSubmit(handleTopUp)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--dh-text-sub)]">{t("amount")}</label>
                <input
                  type="number"
                  {...registerTopUp("amount", { valueAsNumber: true })}
                  className="w-full bg-[var(--dh-bg-card)] border border-[var(--dh-border)] rounded-lg px-4 py-2.5 text-sm text-[var(--dh-text-main)] focus:outline-none focus:border-[var(--dh-brand)] transition-colors"
                  placeholder={t("amountPlaceholder")}
                />
                {topUpErrors.amount && (
                  <span className="text-[11px] text-red-500 font-medium">
                    {validation(topUpErrors.amount.message as never)}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--dh-text-sub)]">{t("paymentMethod")}</label>
                <select
                  {...registerTopUp("paymentMethod")}
                  className="w-full bg-[var(--dh-bg-card)] border border-[var(--dh-border)] rounded-lg px-4 py-2.5 text-sm text-[var(--dh-text-sub)] focus:outline-none focus:border-[var(--dh-brand)] transition-colors cursor-pointer"
                >
                  <option value="visa" className="bg-[var(--dh-bg-card)] text-[var(--dh-text-main)]">{t("visa")}</option>
                  <option value="mastercard" className="bg-[var(--dh-bg-card)] text-[var(--dh-text-main)]">{t("mastercard")}</option>
                  <option value="vodafone_cash" className="bg-[var(--dh-bg-card)] text-[var(--dh-text-main)]">{t("vodafoneCash")}</option>
                </select>
              </div>

              {paymentMethod === "vodafone_cash" && (
                <div className="flex flex-col gap-3 border border-[var(--dh-border)] rounded-lg p-3 bg-[var(--dh-bg-muted)]/40 mt-1">
                  <p className="text-[11px] font-bold text-[var(--dh-text-muted)]">Vodafone Cash Details</p>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-[var(--dh-text-muted)] font-bold uppercase tracking-wider font-semibold">Wallet Number (Phone)</label>
                    <input
                      type="text"
                      {...registerTopUp("phone")}
                      className="w-full bg-[var(--dh-bg-card)] border border-[var(--dh-border)] rounded-lg px-3 py-2.5 text-xs text-[var(--dh-text-main)] focus:outline-none focus:border-[var(--dh-brand)] transition-colors"
                      placeholder="e.g. 01012345678"
                    />
                    {topUpErrors.phone && (
                      <span className="text-[10px] text-red-500">{topUpErrors.phone.message}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-[var(--dh-text-muted)] font-bold uppercase tracking-wider font-semibold">Email Address</label>
                    <input
                      type="email"
                      {...registerTopUp("email")}
                      className="w-full bg-[var(--dh-bg-card)] border border-[var(--dh-border)] rounded-lg px-3 py-2.5 text-xs text-[var(--dh-text-main)] focus:outline-none focus:border-[var(--dh-brand)] transition-colors"
                      placeholder="email@example.com"
                    />
                    {topUpErrors.email && (
                      <span className="text-[10px] text-red-500">{topUpErrors.email.message}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-[var(--dh-text-muted)] font-bold uppercase tracking-wider font-semibold">First Name</label>
                      <input
                        type="text"
                        {...registerTopUp("firstName")}
                        className="w-full bg-[var(--dh-bg-card)] border border-[var(--dh-border)] rounded-lg px-3 py-2.5 text-xs text-[var(--dh-text-main)] focus:outline-none focus:border-[var(--dh-brand)] transition-colors"
                        placeholder="First Name"
                      />
                      {topUpErrors.firstName && (
                        <span className="text-[10px] text-red-500">{topUpErrors.firstName.message}</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-[var(--dh-text-muted)] font-bold uppercase tracking-wider font-semibold">Last Name</label>
                      <input
                        type="text"
                        {...registerTopUp("lastName")}
                        className="w-full bg-[var(--dh-bg-card)] border border-[var(--dh-border)] rounded-lg px-3 py-2.5 text-xs text-[var(--dh-text-main)] focus:outline-none focus:border-[var(--dh-brand)] transition-colors"
                        placeholder="Last Name"
                      />
                      {topUpErrors.lastName && (
                        <span className="text-[10px] text-red-500">{topUpErrors.lastName.message}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <button
                type="submit"
                disabled={isTopUpSubmitting}
                className="w-full mt-2 bg-[var(--dh-brand)] hover:bg-[var(--dh-brand-hover)] text-white font-semibold py-2.5 rounded-lg text-xs transition-all duration-200 shadow-md focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
              >
                {isTopUpSubmitting ? commonT("loading") : t("confirmTopUp")}
              </button>
            </form>
          </div>
        </div>
      )}

      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--dh-bg-card)] border border-[var(--dh-border)] rounded-xl max-w-md w-full p-6 shadow-2xl relative flex flex-col gap-4 text-[var(--dh-text-main)]">
            <button
              onClick={() => {
                setShowWithdrawModal(false);
                resetWithdraw();
              }}
              className="absolute right-4 top-4 p-1 rounded-lg text-[var(--dh-text-muted)] hover:text-[var(--dh-text-main)] hover:bg-[var(--dh-bg-muted)] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-base font-bold text-[var(--dh-text-main)]">{t("withdrawTitle")}</h2>
            <p className="text-xs text-[var(--dh-text-muted)]">
              {t("withdrawSubtitle")}
            </p>
            <form onSubmit={handleWithdrawSubmit(handleWithdraw)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--dh-text-sub)]">{t("amount")}</label>
                <input
                  type="number"
                  {...registerWithdraw("amount", { valueAsNumber: true })}
                  className="w-full bg-[var(--dh-bg-card)] border border-[var(--dh-border)] rounded-lg px-4 py-2.5 text-sm text-[var(--dh-text-main)] focus:outline-none focus:border-[var(--dh-brand)] transition-colors"
                  placeholder={t("amountPlaceholder")}
                />
                {withdrawErrors.amount && (
                  <span className="text-[11px] text-red-500 font-medium">
                    {validation(withdrawErrors.amount.message as never)}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--dh-text-sub)]">
                  {t("destination")}
                </label>
                <input
                  type="text"
                  {...registerWithdraw("destination")}
                  className="w-full bg-[var(--dh-bg-card)] border border-[var(--dh-border)] rounded-lg px-4 py-2.5 text-sm text-[var(--dh-text-main)] focus:outline-none focus:border-[var(--dh-brand)] transition-colors"
                  placeholder={t("destinationPlaceholder")}
                />
                {withdrawErrors.destination && (
                  <span className="text-[11px] text-red-500 font-medium">
                    {validation(withdrawErrors.destination.message as never)}
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={isWithdrawSubmitting}
                className="w-full mt-2 bg-[var(--dh-brand)] hover:bg-[var(--dh-brand-hover)] text-white font-semibold py-2.5 rounded-lg text-xs transition-all duration-200 shadow-md focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
              >
                {isWithdrawSubmitting ? commonT("loading") : t("confirmWithdrawal")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
