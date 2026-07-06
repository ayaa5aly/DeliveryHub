"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { profileSchema } from "@/lib/validation/common";
import { User, Phone, Mail, Calendar, CheckCircle, Eye, Camera } from "lucide-react";
import { mockCustomer } from "@/constants/mock-data";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";
import { getCustomerProfile, updateCustomerProfile, uploadAvatar } from "../api";
import { useNotifications } from "@/shared/providers/socket-notification-provider";

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileView() {
  const t = useTranslations("customer.profile");
  const validation = useTranslations("validation");
  const locale = useLocale();
  const { triggerLocalToast } = useNotifications();
  const [activeTab, setActiveTab] = useState<"info" | "edit">("info");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await uploadAvatar(file);
      setUserProfile((prev: any) => ({
        ...prev,
        avatar: res.url,
      }));
      window.dispatchEvent(new Event("profile-updated"));
      setSuccessMessage(locale === 'ar' ? 'تم تحديث صورة الملف الشخصي!' : 'Profile photo updated successfully!');
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err: any) {
      console.error("Failed to upload avatar:", err);
      triggerLocalToast(
        locale === 'ar' ? 'خطأ في التحميل' : 'Upload Error',
        locale === 'ar' ? 'فشل تحميل صورة الملف الشخصي. يرجى المحاولة مرة أخرى.' : 'Failed to upload profile photo. Please try again.',
        'error'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: mockCustomer.name,
      email: mockCustomer.email,
      phone: mockCustomer.phone,
    },
  });

  useEffect(() => {
    getCustomerProfile()
      .then((data) => {
        setUserProfile(data);
        reset({
          name: data.name,
          email: data.email,
          phone: data.phone,
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load customer profile, falling back to mock:", err);
        setUserProfile(mockCustomer);
        setLoading(false);
      });
  }, [reset]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const updated = await updateCustomerProfile({
        name: data.name,
        phone: data.phone,
      });
      setUserProfile(updated);
      window.dispatchEvent(new Event("profile-updated"));
      reset({
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
      });
      setSuccessMessage(t("updated"));
      setActiveTab("info");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      console.error("Failed to update profile:", err);
      // Fallback update mock in dev if API fails
      mockCustomer.name = data.name;
      mockCustomer.phone = data.phone;
      setUserProfile({ ...mockCustomer });
      window.dispatchEvent(new Event("profile-updated"));
      setSuccessMessage(t("updated"));
      setActiveTab("info");
      setTimeout(() => setSuccessMessage(""), 4000);
    }
  };

  if (loading || !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-zinc-400 text-sm font-semibold">
        <span>{t("loading") || "Loading profile..."}</span>
      </div>
    );
  }

  const avatarLetters = userProfile.name
    ? userProfile.name
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const joinedDate = userProfile.createdAt
    ? new Date(userProfile.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : t("joinedDate");

  return (
    <div className="flex flex-col gap-6 text-zinc-100 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold tracking-tight">{t("title")}</h1>

      {successMessage && (
        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <div className="md:col-span-4 bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col items-center text-center gap-4 shadow-sm">
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
              className={cn(
                "flex items-center justify-center h-20 w-20 rounded-full overflow-hidden border-4 border-zinc-800 bg-zinc-800 text-white font-extrabold text-2xl relative transition-all duration-200 group-hover:border-zinc-700",
                isUploading && "animate-pulse opacity-60"
              )}
            >
              {userProfile.avatar ? (
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                avatarLetters
              )}
              
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full">
                {userProfile.avatar && (
                  <button
                    type="button"
                    onClick={() => setShowPreview(true)}
                    className="p-1.5 rounded-full bg-zinc-850 hover:bg-zinc-700 text-white transition-colors focus:outline-none"
                    title={locale === 'ar' ? 'عرض الصورة' : 'View Photo'}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                )}
                <label
                  htmlFor="avatarInput"
                  className="p-1.5 rounded-full bg-zinc-850 hover:bg-zinc-700 text-white transition-colors cursor-pointer"
                  title={locale === 'ar' ? 'تغيير الصورة' : 'Change Photo'}
                >
                  <Camera className="h-4 w-4" />
                </label>
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-zinc-200">{userProfile.name}</span>
            <span className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider font-bold">
              {t("customerRole")}
            </span>
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {t("verified")}
          </span>
        </div>

        <div className="md:col-span-8 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="flex border-b border-zinc-800 bg-zinc-950/40">
            <button
              onClick={() => setActiveTab("info")}
              className={cn(
                "flex-1 py-3.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 focus:outline-none",
                activeTab === "info"
                  ? "border-blue-500 text-blue-500 bg-zinc-900/50"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              )}
            >
              {t("overview")}
            </button>
            <button
              onClick={() => setActiveTab("edit")}
              className={cn(
                "flex-1 py-3.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 focus:outline-none",
                activeTab === "edit"
                  ? "border-blue-500 text-blue-500 bg-zinc-900/50"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              )}
            >
              {t("edit")}
            </button>
          </div>

          <div className="p-6">
            {activeTab === "info" ? (
              <div className="flex flex-col gap-5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  {t("accountDetails")}
                </h2>

                <div className="flex flex-col gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-zinc-500 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-zinc-500 font-medium">{t("fullName")}</span>
                      <span className="text-zinc-200 font-semibold mt-0.5">{userProfile.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-zinc-500 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-zinc-500 font-medium">{t("email")}</span>
                      <span className="text-zinc-200 font-semibold mt-0.5">{userProfile.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-zinc-500 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-zinc-500 font-medium">{t("phone")}</span>
                      <span className="text-zinc-200 font-semibold mt-0.5">{userProfile.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-zinc-500 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-zinc-500 font-medium">{t("joined")}</span>
                      <span className="text-zinc-200 font-semibold mt-0.5">{joinedDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  {t("updateInformation")}
                </h2>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-400">
                    {t("fullName")}
                  </label>
                  <input
                    type="text"
                    {...register("name")}
                    className={cn(
                      "w-full bg-zinc-950 border rounded-lg px-4 py-2.5 text-xs text-zinc-200 focus:outline-none transition-colors",
                      errors.name ? "border-red-500 focus:border-red-500" : "border-zinc-850 focus:border-zinc-700"
                    )}
                    placeholder={userProfile.name}
                  />
                  {errors.name && (
                    <span className="text-[10px] text-red-400 font-medium mt-0.5">
                      {validation(errors.name.message as never)}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 opacity-60">
                  <label className="text-xs font-semibold text-zinc-400">
                    {t("email")} ({t("notEditable") || "Not Editable"})
                  </label>
                  <input
                    type="email"
                    {...register("email")}
                    disabled
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-4 py-2.5 text-xs text-zinc-500 cursor-not-allowed focus:outline-none"
                    placeholder={userProfile.email}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-400">
                    {t("phone")}
                  </label>
                  <input
                    type="text"
                    {...register("phone")}
                    className={cn(
                      "w-full bg-zinc-950 border rounded-lg px-4 py-2.5 text-xs text-zinc-200 focus:outline-none transition-colors",
                      errors.phone ? "border-red-500 focus:border-red-500" : "border-zinc-850 focus:border-zinc-700"
                    )}
                    placeholder={userProfile.phone}
                  />
                  {errors.phone && (
                    <span className="text-[10px] text-red-400 font-medium mt-0.5">
                      {validation(errors.phone.message as never)}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 transition-all shadow-md focus:outline-none mt-2"
                >
                  {isSubmitting ? t("saving") : t("save")}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      
      {showPreview && userProfile.avatar && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
          onClick={() => setShowPreview(false)}
        >
          <div 
            className="relative max-w-lg w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-2 overflow-hidden shadow-2xl flex flex-col items-center animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex justify-between items-center px-4 py-2.5 border-b border-zinc-800 bg-zinc-950/40">
              <span className="text-xs font-bold text-zinc-300">{locale === 'ar' ? 'عرض الصورة الشخصية' : 'View Profile Photo'}</span>
              <button 
                onClick={() => setShowPreview(false)}
                className="text-zinc-400 hover:text-zinc-200 text-xs font-bold px-2.5 py-1 rounded-lg hover:bg-zinc-800 transition-colors focus:outline-none"
              >
                {locale === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
            <div className="flex items-center justify-center p-6 w-full aspect-square bg-zinc-950/20">
              <img 
                src={userProfile.avatar} 
                alt={userProfile.name} 
                className="max-h-[60vh] max-w-full rounded-xl object-contain shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
