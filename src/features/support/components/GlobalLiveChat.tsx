"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, X, Headphones, ArrowLeft } from "lucide-react";
import { useLocale } from "next-intl";
import { getTickets, getTicketById, sendTicketMessage } from "../api";
import { useNotifications } from "@/shared/providers/socket-notification-provider";

interface ChatMessage {
  id: string;
  sender: "user" | "admin";
  text: string;
  time: string;
}

export default function GlobalLiveChat() {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const { socket } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const [openTickets, setOpenTickets] = useState<any[]>([]);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const t = {
    title: isRTL ? "محادثة الدعم المباشر" : "Live Support Chat",
    agentName: isRTL ? "خدمة عملاء طيار" : "Tayar Support Agent",
    agentStatus: isRTL ? "نشط الآن" : "Active now",
    placeholder: isRTL ? "اكتب رسالة هنا..." : "Type a message...",
    welcome: isRTL 
      ? "مرحبًا بك في دعم طيار المباشر! كيف يمكننا مساعدتك اليوم؟" 
      : "Hello! Welcome to Tayar Live Support. How can we help you today?",
    hotlinePrompt: isRTL
      ? "للحصول على دعم سريع، يمكنك أيضًا الاتصال بخطنا الساخن: 01063732212"
      : "For urgent inquiries, you can also reach our hotline: 01063732212",
    noTickets: isRTL
      ? "عذراً، يجب إنشاء تذكرة دعم أولاً من صفحة الدعم الفني للبدء بالمحادثة المباشرة مع الإدارة."
      : "You need to create a support ticket first from the Support page to start a live chat with the admin.",
    selectTicket: isRTL
      ? "اختر تذكرة الدعم التي ترغب بمناقشتها:"
      : "Select the support ticket you wish to discuss:",
    back: isRTL ? "رجوع" : "Back",
    ticketNo: isRTL ? "تذكرة رقم" : "Ticket No.",
    shipment: isRTL ? "الشحنة" : "Shipment",
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "delay": return isRTL ? "تأخير الشحنة" : "Shipment Delay";
      case "billing": return isRTL ? "مشكلة في الدفع" : "Payment Issue";
      case "damage": return isRTL ? "شحنة تالفة" : "Damaged Shipment";
      case "app_issue": return isRTL ? "مشكلة في التطبيق" : "App Issue";
      case "payment": return isRTL ? "مستحقات المحفظة" : "Wallet & Payments";
      case "accident": return isRTL ? "حادث أو ظرف طارئ" : "Accident or Emergency";
      case "customer_issue": return isRTL ? "مشكلة مع العميل" : "Issue with Customer";
      case "driver_issue": return isRTL ? "مشكلة مع سائق" : "Issue with Driver";
      case "system_issue": return isRTL ? "مشكلة في النظام" : "System Issue";
      default: return isRTL ? "أخرى" : "Other";
    }
  };

  // Custom events integration
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    const handleUpdate = () => loadTicketsData();

    window.addEventListener("open-live-chat", handleOpen);
    window.addEventListener("support-tickets-updated", handleUpdate);

    return () => {
      window.removeEventListener("open-live-chat", handleOpen);
      window.removeEventListener("support-tickets-updated", handleUpdate);
    };
  }, []);

  const loadTicketsData = async () => {
    try {
      const allTickets = await getTickets();
      const openTkts = allTickets.filter((tk) => tk.status === "open");
      setOpenTickets(openTkts);

      // If the currently selected ticket is resolved, reset it
      if (ticketId && !openTkts.some((tk) => tk.id === ticketId)) {
        setTicketId(null);
      }
      
      // Auto select if only one open ticket
      if (openTkts.length === 1) {
        setTicketId(openTkts[0].id);
      }
    } catch (err) {
      console.error("Failed to load user open tickets:", err);
    }
  };

  // Fetch tickets initially on opening chat drawer
  useEffect(() => {
    if (isOpen) {
      loadTicketsData();
    }
  }, [isOpen]);

  // Load message history when ticketId changes
  useEffect(() => {
    if (!ticketId) {
      setMessages([]);
      return;
    }

    const loadMessageHistory = async () => {
      setLoadingChat(true);
      try {
        const ticketDetail = await getTicketById(ticketId);
        const rawMessages = ticketDetail.messages || [];
        if (rawMessages.length > 0) {
          setMessages(
            rawMessages.map((m: any) => ({
              id: m._id || m.id || String(Math.random()),
              sender: m.sender,
              text: m.text,
              time: new Date(m.createdAt || Date.now()).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            }))
          );
        } else {
          setMessages([
            {
              id: "welcome",
              sender: "admin",
              text: t.welcome,
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ]);
        }
      } catch (err) {
        console.error("Failed to load message history for ticket:", ticketId, err);
      } finally {
        setLoadingChat(false);
      }
    };

    loadMessageHistory();
  }, [ticketId]);

  // Real-time message listener via Socket
  useEffect(() => {
    if (!socket || !ticketId) return;

    const handleNewMessage = (msg: any) => {
      const msgId = msg._id || msg.id || String(Date.now());
      setMessages((prev) => {
        // Prevent duplicate messages
        const isDuplicate = prev.some(
          (m) => m.id === msgId || (m.text === msg.text && m.sender === msg.sender && m.id.startsWith("msg-"))
        );
        
        if (isDuplicate) {
          // Replace optimistic message with backend message
          return prev.map((m) =>
            m.text === msg.text && m.sender === msg.sender && m.id.startsWith("msg-")
              ? {
                  id: msgId,
                  sender: msg.sender,
                  text: msg.text,
                  time: new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                }
              : m
          );
        }

        return [
          ...prev,
          {
            id: msgId,
            sender: msg.sender,
            text: msg.text,
            time: new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ];
      });
    };

    socket.on(`ticket:${ticketId}:message`, handleNewMessage);
    return () => {
      socket.off(`ticket:${ticketId}:message`, handleNewMessage);
    };
  }, [socket, ticketId]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Send message handler
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !ticketId) return;

    const textToSend = input.trim();
    setInput("");

    // Optimistically add user message locally
    const tempId = `msg-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: tempId,
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      await sendTicketMessage(ticketId, textToSend);
    } catch (err) {
      console.error("Failed to send ticket message to backend", err);
    }
  };

  return (
    <div className="relative" dir={isRTL ? "rtl" : "ltr"}>
      {/* Floating Chat FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed z-40 p-4 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg hover:shadow-indigo-500/20 transform hover:scale-105 active:scale-95 transition-all duration-300 ${
          isRTL ? "left-6" : "right-6"
        } bottom-6`}
      >
        <MessageSquare className="h-6 w-6" />
        {openTickets.length > 0 && (
          <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
          </span>
        )}
      </button>

      {/* Slide-in Live Chat Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-zinc-900 border-l border-zinc-800 max-w-md w-full h-full flex flex-col text-zinc-100 shadow-2xl relative">
            
            {/* Header */}
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
              <div className="flex items-center gap-3">
                {ticketId && openTickets.length > 1 && (
                  <button
                    onClick={() => setTicketId(null)}
                    className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors mr-1"
                    title={t.back}
                  >
                    <ArrowLeft className={`h-4.5 w-4.5 ${isRTL ? "rotate-180" : ""}`} />
                  </button>
                )}
                <div className="relative">
                  <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                    <Headphones className="h-4.5 w-4.5" />
                  </div>
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-zinc-900" />
                </div>
                <div className="flex flex-col text-start">
                  <span className="text-xs font-bold text-zinc-100">{t.agentName}</span>
                  <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {t.agentStatus}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat Area / Selection Area */}
            {openTickets.length === 0 ? (
              <div className="flex-1 p-6 flex flex-col items-center justify-center text-center gap-4">
                <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Headphones className="h-6 w-6" />
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-[280px]">
                  {t.noTickets}
                </p>
                <p className="text-[10px] text-zinc-500">
                  {t.hotlinePrompt}
                </p>
              </div>
            ) : !ticketId ? (
              <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
                <span className="text-xs font-semibold text-zinc-400">{t.selectTicket}</span>
                <div className="flex flex-col gap-2.5">
                  {openTickets.map((tk) => (
                    <button
                      key={tk.id}
                      onClick={() => setTicketId(tk.id)}
                      className="w-full text-start p-3.5 bg-zinc-950/60 hover:bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700/80 rounded-xl flex flex-col gap-1.5 transition-all"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-zinc-200">{tk.subject}</span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/10 font-bold uppercase">
                          {getCategoryLabel(tk.category)}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500">
                        {t.ticketNo} {tk.id} {tk.shipmentId ? `• ${t.shipment} ID: ${tk.shipmentId}` : ""}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-zinc-950/40">
                  {loadingChat ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-2 text-zinc-500 text-xs">
                      <span className="h-5 w-5 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
                      <span>Loading chat...</span>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isUser = msg.sender === "user";
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col max-w-[80%] ${
                            isUser ? "self-end items-end" : "self-start items-start"
                          }`}
                        >
                          <div
                            className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                              isUser
                                ? "bg-blue-600 text-white rounded-br-none"
                                : "bg-zinc-800 text-zinc-200 rounded-bl-none border border-zinc-700/50"
                            }`}
                          >
                            {msg.text}
                          </div>
                          <span className="text-[9px] text-zinc-500 mt-1 px-1 font-medium">
                            {msg.time}
                          </span>
                        </div>
                      );
                    })
                  )}
                  {isTyping && (
                    <div className="self-start flex flex-col items-start max-w-[80%]">
                      <div className="bg-zinc-800 text-zinc-400 px-3.5 py-2 rounded-2xl rounded-bl-none border border-zinc-700/50 text-xs flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Footer Input */}
                <form onSubmit={handleSend} className="p-4 border-t border-zinc-800 bg-zinc-900 flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t.placeholder}
                    disabled={loadingChat || !ticketId}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors disabled:opacity-55"
                  />
                  <button
                    type="submit"
                    disabled={loadingChat || !ticketId || !input.trim()}
                    className="p-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors focus:outline-none flex items-center justify-center disabled:opacity-55"
                  >
                    <Send className="h-4.5 w-4.5" />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
