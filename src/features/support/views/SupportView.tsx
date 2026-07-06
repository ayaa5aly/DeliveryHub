"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supportTicketSchema } from "@/lib/validation/common";
import { z } from "zod";
import { Headphones, Mail, Phone, MessageSquare, Plus, X } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { createTicket, getTickets } from "@/features/support";
import { getCurrentUser } from "@/features/auth/api";

type TicketFormValues = z.infer<typeof supportTicketSchema>;

export default function SupportView() {
  const t = useTranslations("customer.support");
  const validation = useTranslations("validation");
  const commonT = useTranslations("common");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [userRole, setUserRole] = useState<string>("customer");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submittingTicket, setSubmittingTicket] = useState(false);

  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        if (user && user.role) {
          setUserRole(user.role);
        }
      })
      .catch(console.error);
  }, []);

  const loadTickets = () => {
    setLoadingTickets(true);
    getTickets()
      .then((data) => {
        setTickets(data);
        setLoadingTickets(false);
      })
      .catch((err) => {
        console.error("Failed to load tickets:", err);
        setLoadingTickets(false);
      });
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TicketFormValues>({
    resolver: zodResolver(supportTicketSchema),
    defaultValues: { subject: "", category: "other", shipmentId: "", message: "" },
  });

  const getCategoriesForRole = () => {
    if (userRole === "driver") {
      return [
        { value: "app_issue", label: isRTL ? "مشكلة في التطبيق" : "App Issue" },
        { value: "payment", label: isRTL ? "مستحقات المحفظة" : "Wallet & Payments" },
        { value: "accident", label: isRTL ? "حادث أو ظرف طارئ" : "Accident or Emergency" },
        { value: "customer_issue", label: isRTL ? "مشكلة مع العميل" : "Issue with Customer" },
        { value: "other", label: isRTL ? "أخرى" : "Other" },
      ];
    }
    if (userRole === "office") {
      return [
        { value: "billing", label: isRTL ? "الفواتير والعمولات" : "Billing & Commissions" },
        { value: "driver_issue", label: isRTL ? "مشكلة مع سائق" : "Issue with Driver" },
        { value: "system_issue", label: isRTL ? "مشكلة في النظام" : "System Issue" },
        { value: "other", label: isRTL ? "أخرى" : "Other" },
      ];
    }
    // customer
    return [
      { value: "delay", label: isRTL ? "تأخير الشحنة" : "Shipment Delay" },
      { value: "billing", label: isRTL ? "مشكلة في الدفع" : "Payment Issue" },
      { value: "damage", label: isRTL ? "شحنة تالفة" : "Damaged Shipment" },
      { value: "other", label: isRTL ? "أخرى" : "Other" },
    ];
  };

  const handleCreateTicket = async (data: TicketFormValues) => {
    setSubmittingTicket(true);
    setSubmitError(null);
    try {
      const ticket = await createTicket({
        subject: data.subject,
        category: data.category,
        message: data.message,
        shipmentId: data.shipmentId,
      });
      setTickets((prev) => [ticket, ...prev]);
      reset();
      setShowCreateModal(false);
      // Notify live chat component to refresh open tickets
      window.dispatchEvent(new Event("support-tickets-updated"));
    } catch (err: any) {
      console.error("Failed to create support ticket:", err);
      setSubmitError(err.message || "Failed to create support ticket");
    } finally {
      setSubmittingTicket(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-zinc-100 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold tracking-tight">{t("title")}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <div className="md:col-span-1 bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between min-h-[220px] shadow-sm">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
              <Headphones className="h-4.5 w-4.5" />
              <span>{t("contactUs")}</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed mt-1">
              {t("contactDescription")}
            </p>

            <div className="flex flex-col gap-2.5 mt-2 text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <Phone className="h-3.5 w-3.5 text-zinc-500" />
                <span>{t("hotline")}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <Mail className="h-3.5 w-3.5 text-zinc-500" />
                <span>mohamedzohair547@gmail.com</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => window.dispatchEvent(new Event("open-live-chat"))}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-bold bg-zinc-950 border border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900 transition-all focus:outline-none mt-4"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{t("startChat")}</span>
          </button>
        </div>

        <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                {t("tickets")}
              </h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1 text-[10px] font-bold text-blue-500 hover:text-blue-400"
              >
                <Plus className="h-3 w-3" />
                <span>{t("createTicket")}</span>
              </button>
            </div>

            <div className="flex flex-col gap-3.5">
              {loadingTickets ? (
                <div className="text-center py-4 text-xs text-zinc-500">{commonT("loading")}</div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-4 text-xs text-zinc-500">
                  {isRTL ? "لا توجد تذاكر دعم حالية" : "No support tickets found"}
                </div>
              ) : (
                tickets.map((tkt) => {
                  const isOpen = tkt.status === "open";

                  return (
                    <div
                      key={tkt.id}
                      className="flex items-center justify-between border-b border-zinc-855 pb-3 last:border-none last:pb-0"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-zinc-200">
                          {tkt.subject}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-medium">
                          ID: {tkt.id} {tkt.shipmentId ? `• ${t("shipmentId")}: ${tkt.shipmentId}` : ""} • {tkt.createdAt ? new Date(tkt.createdAt).toLocaleDateString() : tkt.date}
                        </span>
                      </div>

                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          isOpen
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        }`}
                      >
                        {isOpen ? t("open") : t("resolved")}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full p-6 shadow-2xl relative flex flex-col gap-4 text-zinc-100">
            <button
              onClick={() => {
                setShowCreateModal(false);
                setSubmitError(null);
                reset();
              }}
              className="absolute right-4 top-4 p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-base font-bold text-zinc-100">{t("createTitle")}</h2>
            <p className="text-xs text-zinc-400">
              {t("createSubtitle")}
            </p>

            {submitError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit(handleCreateTicket)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400">{t("subject")}</label>
                <input
                  type="text"
                  {...register("subject")}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors"
                  placeholder={t("subjectPlaceholder")}
                />
                {errors.subject && (
                  <span className="text-[11px] text-red-400 font-medium">
                    {validation(errors.subject.message as never)}
                  </span>
                )}
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400">{t("category")}</label>
                <select
                  {...register("category")}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-zinc-700 transition-colors cursor-pointer"
                >
                  {getCategoriesForRole().map((cat) => (
                    <option key={cat.value} value={cat.value} className="bg-zinc-900 text-zinc-200">
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400">
                  {t("shipmentId")} ({isRTL ? "اختياري" : "Optional"})
                </label>
                <input
                  type="text"
                  {...register("shipmentId")}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors"
                  placeholder={t("shipmentIdPlaceholder")}
                />
                {errors.shipmentId && (
                  <span className="text-[11px] text-red-400 font-medium">
                    {validation(errors.shipmentId.message as never)}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400">{t("messageDetails")}</label>
                <textarea
                  {...register("message")}
                  rows={4}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors resize-none"
                  placeholder={t("messagePlaceholder")}
                />
                {errors.message && (
                  <span className="text-[11px] text-red-400 font-medium">
                    {validation(errors.message.message as never)}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={submittingTicket}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold py-2.5 rounded-lg text-xs transition-all duration-200 shadow-md focus:outline-none"
              >
                {submittingTicket ? commonT("loading") : t("submitTicket")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
