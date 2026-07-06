"use client";

import { useEffect, useState } from "react";
import { Truck, Check, Wallet, CheckCircle, Info } from "lucide-react";
import { Notification, NotificationType } from "../types";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { getNotifications, markAsRead, markAllAsRead } from "../api"; // عدّل المسار حسب مكان الملف عندك
import { useNotifications } from "@/shared/providers/socket-notification-provider";
import { usePathname } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setActiveScreen } from "@/features/captain/store/dashboard-slice";

interface ExtNotification extends Notification {
  captainName?: string;
  shipmentDate?: string;
  rawRelatedShipment?: any;
  rawType?: string;
}

export default function NotificationsView() {
  const t = useTranslations("customer.notifications");
  const locale = useLocale();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { socket, unreadCount: socketUnread, decrementUnread, resetUnread } = useNotifications();

  const [notifications, setNotifications] = useState<ExtNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isProviderDashboard = pathname.includes("captain-dashboard");

  const mapBackendTypeToFrontend = (type: string): NotificationType => {
    if (type === "picked_up" || type === "in_transit" || type === "captain_assigned") return "pickup";
    if (type === "offer_accepted") return "offer";
    if (type === "offers_received" || type === "offer_received" || type === "new_shipment") return "received";
    if (type === "delivered") return "delivered";
    return "info";
  };

  const formatNotification = (n: any): ExtNotification => {
    const shipmentObj = n.relatedShipment;
    
    return {
      id: n._id || n.id,
      title: n.title,
      message: n.message,
      time: new Date(n.createdAt).toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        day: 'numeric',
        month: 'short'
      }),
      type: mapBackendTypeToFrontend(n.type),
      rawType: n.type,
      isRead: n.isRead,
      shipmentId: typeof shipmentObj === 'object' && shipmentObj ? shipmentObj._id || shipmentObj.id : n.relatedShipment,
      captainName: typeof shipmentObj === 'object' && shipmentObj?.captain?.fullName ? shipmentObj.captain.fullName : undefined,
      shipmentDate: typeof shipmentObj === 'object' && shipmentObj?.createdAt
        ? new Date(shipmentObj.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })
        : undefined,
      rawRelatedShipment: shipmentObj,
    };
  };

  const getTranslatedContent = (item: ExtNotification) => {
    const shipmentObj = item.rawRelatedShipment || {};
    const trackingNo = typeof shipmentObj === 'object' && shipmentObj ? shipmentObj.trackingNumber : undefined;
    const cleanTrackingNo = trackingNo || item.shipmentId || "";
    const captainName = item.captainName || (locale === 'ar' ? 'كابتن' : 'Captain');

    // Handle tracking states with dynamic, variable messages & titles from translation keys
    if (item.rawType === "picked_up") {
      try {
        return {
          title: t("pickedUpTitle") || item.title,
          message: t("pickupMessage")
            ? t("pickupMessage")
                .replace("Karim M.", captainName)
                .replace("كريم م.", captainName)
                .replace("SC-00412", cleanTrackingNo)
            : item.message,
        };
      } catch (e) {
        return { title: item.title, message: item.message };
      }
    }
    if (item.rawType === "in_transit") {
      try {
        return {
          title: t("inTransitTitle") || item.title,
          message: t("inTransitMessage", { trackingNo: cleanTrackingNo }),
        };
      } catch (e) {
        return { title: item.title, message: item.message };
      }
    }
    if (item.rawType === "captain_assigned" || item.rawType === "offer_accepted") {
      try {
        return {
          title: t("offerAcceptedTitle") || item.title,
          message: t("offerAcceptedMessage", { captain: captainName, trackingNo: cleanTrackingNo }),
        };
      } catch (e) {
        return { title: item.title, message: item.message };
      }
    }
    if (item.rawType === "delivered") {
      try {
        return {
          title: t("deliveredTitleDynamic") || item.title,
          message: t("deliveredMessageDynamic", { trackingNo: cleanTrackingNo }),
        };
      } catch (e) {
        return { title: item.title, message: item.message };
      }
    }
    if (item.rawType === "cancelled") {
      try {
        return {
          title: t("cancelledTitle") || item.title,
          message: t("cancelledMessage", { trackingNo: cleanTrackingNo }),
        };
      } catch (e) {
        return { title: item.title, message: item.message };
      }
    }

    // Fallback to parsed/original structures
    switch (item.type) {
      case "received": {
        const priceMatch = item.message.match(/EGP\s*(\d+)/i) || item.message.match(/(\d+)\s*EGP/i);
        const price = priceMatch ? priceMatch[1] : "";
        
        let providerName = "";
        const providerMatch = item.message.match(/^(.+?)\s+(?:sent|submitted|created)\s+/i);
        if (providerMatch && !item.message.toLowerCase().startsWith("you ")) {
          providerName = providerMatch[1];
        }

        const isOffer = item.message.toLowerCase().includes("offer");
        
        if (isOffer && price) {
          try {
            if (providerName) {
              return {
                title: t("newOfferTitle") || item.title,
                message: t("newOfferMessageWithProvider", {
                  provider: providerName,
                  price: price,
                  trackingNo: cleanTrackingNo
                }),
              };
            } else {
              return {
                title: t("newOfferTitle") || item.title,
                message: t("newOfferMessageNoProvider", {
                  price: price,
                  trackingNo: cleanTrackingNo
                }),
              };
            }
          } catch (e) {
            return { title: item.title, message: item.message };
          }
        }

        try {
          return {
            title: t("receivedTitle") || item.title,
            message: t("receivedMessage")
              ? t("receivedMessage").replace("SC-00412", cleanTrackingNo)
              : item.message,
          };
        } catch (e) {
          return { title: item.title, message: item.message };
        }
      }
      default:
        return {
          title: item.title,
          message: item.message,
        };
    }
  };

  // Real-time socket updates for Notifications page
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notif: any) => {
      console.log("NotificationsView: Real-time notification received:", notif);
      const formatted = formatNotification(notif);
      setNotifications((prev) => [formatted, ...prev]);
    };

    socket.on("newNotification", handleNewNotification);
    return () => {
      socket.off("newNotification", handleNewNotification);
    };
  }, [socket, locale]);

  useEffect(() => {
    let isMounted = true;

    async function fetchNotifications() {
      try {
        setIsLoading(true);
        setError(null);
        console.log("NotificationsView: Calling getNotifications...");
        const data = await getNotifications();
        console.log("NotificationsView: Received data:", data);
        if (isMounted) {
          const formatted = (data || []).map((n: any) => formatNotification(n));
          console.log("NotificationsView: Formatted notifications:", formatted);
          setNotifications(formatted);
        }
      } catch (err) {
        console.error("NotificationsView: Error in fetchNotifications:", err);
        if (isMounted) {
          setError(locale === 'ar' ? "حدث خطأ في تحميل الإشعارات، حاول مرة أخرى." : "Error loading notifications, please try again.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchNotifications();

    return () => {
      isMounted = false;
    };
  }, [locale]);

  const handleMarkRead = async (id: string) => {
    const target = notifications.find((n) => n.id === id);
    if (!target || target.isRead) return;

    // optimistic update
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif,
      ),
    );

    decrementUnread();

    try {
      await markAsRead(id);
    } catch (err) {
      // rollback لو الطلب فشل
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, isRead: false } : notif,
        ),
      );
      // rollback global unread count
      // We can let the user's next action sync this or keep it optimistic.
    }
  };

  const handleMarkAllRead = async () => {
    const previous = notifications;

    // optimistic update
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, isRead: true })),
    );

    resetUnread();

    try {
      await markAllAsRead();
    } catch (err) {
      // rollback لو الطلب فشل
      setNotifications(previous);
      // rollback global unread count
      // We can let the user's next action sync this or keep it optimistic.
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleViewDetails = (item: any, e: React.MouseEvent) => {
    e.stopPropagation();
    handleMarkRead(item.id);

    if (isProviderDashboard) {
      e.preventDefault();
      // Navigate inside Captain/Office dashboard
      if (item.type === "received") {
        dispatch(setActiveScreen("requests"));
      } else {
        dispatch(setActiveScreen("orders"));
      }
    }
  };

  const getTypeConfig = (type: NotificationType) => {
    switch (type) {
      case "pickup":
        return {
          icon: Truck,
          borderColor: "border-s-4 border-s-blue-500",
          iconColor: "text-blue-500 bg-blue-500/10 border-blue-500/20 dark:bg-blue-500/10 dark:border-blue-500/20",
          glowColor: "rgba(59, 130, 246, 0.05)",
        };
      case "offer":
        return {
          icon: Check,
          borderColor: "border-s-4 border-s-emerald-500",
          iconColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 dark:bg-emerald-500/10 dark:border-emerald-500/20",
          glowColor: "rgba(16, 185, 129, 0.05)",
        };
      case "received":
        return {
          icon: Wallet,
          borderColor: "border-s-4 border-s-amber-500",
          iconColor: "text-amber-500 bg-amber-500/10 border-amber-500/20 dark:bg-amber-500/10 dark:border-amber-500/20",
          glowColor: "rgba(245, 158, 11, 0.05)",
        };
      case "delivered":
        return {
          icon: CheckCircle,
          borderColor: "border-s-4 border-s-emerald-600",
          iconColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 dark:bg-emerald-500/10 dark:border-emerald-500/20",
          glowColor: "rgba(16, 185, 129, 0.05)",
        };
      default:
        return {
          icon: Info,
          borderColor: "border-s-4 border-s-zinc-500",
          iconColor: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20 dark:bg-zinc-500/10 dark:border-zinc-500/20",
          glowColor: "rgba(113, 113, 122, 0.05)",
        };
    }
  };

  const isRTL = locale === 'ar';

  return (
    <div className={cn("flex flex-col gap-6 text-[var(--dh-text-main)] max-w-2xl mx-auto", isRTL && "text-right")}>
      <div className={cn("flex items-center justify-between border-b border-[var(--dh-border)] pb-4", isRTL && "flex-row-reverse")}>
        <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
          <h1 className="text-lg font-extrabold tracking-tight">{t("title")}</h1>
          {unreadCount > 0 && (
            <span className="bg-red-500/10 border border-red-500/20 text-red-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-[0_2px_8px_rgba(239,68,68,0.1)] animate-pulse">
              {t("newCount", { count: unreadCount })}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-bold text-[var(--dh-brand)] hover:text-[var(--dh-brand-light)] focus:outline-none transition-colors duration-200 hover:underline"
          >
            {t("markAll")}
          </button>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-[var(--dh-bg-card)]/50 border border-[var(--dh-border)] rounded-xl p-5 h-[90px] animate-pulse"
            />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <p className="text-sm text-[var(--dh-danger)] text-center py-8">{error}</p>
      )}

      {!isLoading && !error && notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="p-4 bg-[var(--dh-bg-muted)]/30 rounded-2xl border border-[var(--dh-border)]/40 text-[var(--dh-text-muted)]">
            <CheckCircle className="h-8 w-8 opacity-40" />
          </div>
          <p className="text-xs text-[var(--dh-text-sub)] max-w-xs leading-relaxed font-semibold">
            {t("empty")}
          </p>
        </div>
      )}

      {!isLoading && !error && notifications.length > 0 && (
        <div className="flex flex-col gap-4">
          {notifications.map((item) => {
            const config = getTypeConfig(item.type);
            const Icon = config.icon;
            const { title, message } = getTranslatedContent(item);

            const glowStyle = item.isRead
              ? {}
              : {
                  background: `linear-gradient(to ${isRTL ? 'left' : 'right'}, ${config.glowColor}, transparent)`,
                };

            return (
              <div
                key={item.id}
                onClick={() => handleMarkRead(item.id)}
                style={glowStyle}
                className={cn(
                  "group relative bg-[var(--dh-bg-card)]/60 backdrop-blur-md border border-[var(--dh-border)] rounded-e-2xl rounded-s-md p-5 flex gap-4 items-start shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer",
                  config.borderColor,
                  isRTL && "flex-row-reverse",
                  item.isRead
                    ? "opacity-60 hover:bg-[var(--dh-bg-muted)]/40"
                    : "hover:bg-[var(--dh-bg-muted)]/10"
                )}
              >
                {/* Icon Squircle Wrapper */}
                <div
                  className={cn(
                    "p-3 rounded-2xl border shrink-0 flex items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-[var(--dh-shadow-sm)]",
                    config.iconColor
                  )}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>

                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <div className={cn("flex justify-between items-baseline gap-4", isRTL && "flex-row-reverse")}>
                    <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                      <span className="text-xs font-extrabold text-[var(--dh-text-main)] group-hover:text-[var(--dh-brand-light)] transition-colors">
                        {title}
                      </span>
                      {!item.isRead && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--dh-brand)] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--dh-brand)]"></span>
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[var(--dh-text-dim)] shrink-0 font-bold tracking-tight">
                      {item.time}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--dh-text-sub)] mt-1.5 leading-relaxed font-semibold">
                    {message}
                  </p>

                  {item.type !== "received" && (item.captainName || item.shipmentDate) && (
                    <div className={cn(
                      "mt-4 pt-3 border-t border-[var(--dh-border)]/50 flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-[var(--dh-text-sub)]",
                      isRTL && "flex-row-reverse"
                    )}>
                      {item.captainName && (
                        <div className={cn(
                          "flex items-center gap-1.5 bg-[var(--dh-bg-muted)]/50 px-2.5 py-1 rounded-lg border border-[var(--dh-border)]/30",
                          isRTL && "flex-row-reverse"
                        )}>
                          <span className="text-[var(--dh-text-muted)] font-bold">{locale === 'ar' ? 'الكابتن:' : 'Captain:'}</span>
                          <span className="text-[var(--dh-brand-light)] font-extrabold">{item.captainName}</span>
                        </div>
                      )}
                      {item.shipmentDate && (
                        <div className={cn(
                          "flex items-center gap-1.5 bg-[var(--dh-bg-muted)]/50 px-2.5 py-1 rounded-lg border border-[var(--dh-border)]/30",
                          isRTL && "flex-row-reverse"
                        )}>
                          <span className="text-[var(--dh-text-muted)] font-bold">{locale === 'ar' ? 'تاريخ الشحن:' : 'Date:'}</span>
                          <span className="text-[var(--dh-text-main)] font-extrabold">{item.shipmentDate}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {item.shipmentId && (
                    <div className={cn("mt-4 flex items-center", isRTL && "justify-end")}>
                      <Link
                        href={item.type === "received" ? `/offers/${item.shipmentId}` : `/tracking/${item.shipmentId}`}
                        onClick={(e) => handleViewDetails(item, e)}
                        className={cn(
                          "group/btn flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold bg-[var(--dh-bg-muted)]/80 text-[var(--dh-brand)] hover:bg-[var(--dh-brand)] hover:text-white transition-all duration-200 border border-[var(--dh-border)] hover:border-transparent shadow-sm hover:shadow-[0_4px_12px_rgba(59,130,246,0.15)]",
                          isRTL && "flex-row-reverse"
                        )}
                      >
                        <span>
                          {item.type === "received"
                            ? t("viewOffers")
                            : t("viewDetails")}
                        </span>
                        <span className="transition-transform group-hover/btn:translate-x-0.5 rtl:group-hover/btn:-translate-x-0.5 font-bold">
                          {locale === 'ar' ? '←' : '→'}
                        </span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
