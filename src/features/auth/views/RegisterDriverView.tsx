"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerDriverSchema, registerOfficeSchema } from "@/lib/validation/common";
import { AuthLayout } from "../components/auth-layout";
import { Input } from "@/shared/ui/input";
import { PasswordInput } from "../components/password-input";
import { Button } from "@/shared/ui/button";
import { ROUTES } from "@/constants/routes";
import { useTranslation } from "@/shared/hooks/use-translation";
import { useTranslations } from "next-intl";
import { registerDriver, registerOffice } from "../api";

export default function RegisterDriverView() {
  const { t } = useTranslation();
  const validation = useTranslations("validation");
  const router = useRouter();

  const [role, setRole] = React.useState<"driver" | "office">("driver");

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    licenseNumber: "",
    vehicleType: "",
    vehiclePlate: "",
    businessName: "",
    officeAddress: "",
  });

  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      if (role === "driver") {
        const validationResult = registerDriverSchema.safeParse(formData);
        if (!validationResult.success) {
          const fieldErrors: Record<string, string> = {};
          validationResult.error.issues.forEach((issue) => {
            const field = issue.path[0];
            if (field) fieldErrors[field as string] = issue.message;
          });
          setErrors(fieldErrors);
          setIsLoading(false);
          return;
        }

        console.log("Register Driver payload:", formData);
        await registerDriver({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          passwordConfirmation: formData.confirmPassword,
          licenseNumber: formData.licenseNumber,
          vehicleType: formData.vehicleType,
          plateNumber: formData.vehiclePlate,
        });
      } else {
        const validationResult = registerOfficeSchema.safeParse(formData);
        if (!validationResult.success) {
          const fieldErrors: Record<string, string> = {};
          validationResult.error.issues.forEach((issue) => {
            const field = issue.path[0];
            if (field) fieldErrors[field as string] = issue.message;
          });
          setErrors(fieldErrors);
          setIsLoading(false);
          return;
        }

        console.log("Register Office payload:", formData);
        await registerOffice({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          passwordConfirmation: formData.confirmPassword,
          licenseNumber: formData.licenseNumber,
          businessName: formData.businessName,
          officeAddress: formData.officeAddress,
        });
      }

      router.push(`${ROUTES.VERIFY_OTP}?phone=${formData.phone}&purpose=register`);
    } catch (err: any) {
      console.error("Registration failed:", err);
      const backendError = err.response?.data?.message || err.message || "Registration failed. Please check your data.";
      setErrors({ root: backendError });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title={role === "driver" ? t("auth.registerAsDriver") : t("auth.registerAsOffice")}
      subtitle={role === "driver" ? t("auth.driverRegisterSubtitle") : t("auth.officeRegisterSubtitle")}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.root && (
          <div className="p-3 text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg text-center font-sans">
            {errors.root}
          </div>
        )}

        {/* Tab selector for Driver vs Office */}
        <div className="flex bg-zinc-950 p-1.5 rounded-lg border border-zinc-800 gap-1">
          <button
            type="button"
            onClick={() => {
              setRole("driver");
              setErrors({});
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
              role === "driver"
                ? "bg-blue-600 text-white shadow"
                : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
            }`}
          >
            {t("auth.driver")}
          </button>
          <button
            type="button"
            onClick={() => {
              setRole("office");
              setErrors({});
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
              role === "office"
                ? "bg-blue-600 text-white shadow"
                : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
            }`}
          >
            {t("auth.office")}
          </button>
        </div>

        <div className="border-b border-zinc-800 pb-2 pt-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            {t("auth.personalInformation")}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t("auth.name")}
            name="name"
            placeholder={t("auth.fullNamePlaceholder")}
            value={formData.name}
            onChange={handleChange}
            error={errors.name ? validation(errors.name as never) : undefined}
            disabled={isLoading}
          />

          <Input
            label={t("auth.phone")}
            name="phone"
            placeholder={t("auth.phonePlaceholder")}
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone ? validation(errors.phone as never) : undefined}
            disabled={isLoading}
          />
        </div>

        <Input
          label={t("auth.email")}
          name="email"
          type="email"
          placeholder={t("auth.emailPlaceholder")}
          value={formData.email}
          onChange={handleChange}
          error={errors.email ? validation(errors.email as never) : undefined}
          disabled={isLoading}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PasswordInput
            name="password"
            placeholder={t("auth.password")}
            value={formData.password}
            onChange={handleChange}
            error={errors.password ? validation(errors.password as never) : undefined}
            disabled={isLoading}
          />

          <PasswordInput
            name="confirmPassword"
            placeholder={t("auth.confirmPassword")}
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword ? validation(errors.confirmPassword as never) : undefined}
            disabled={isLoading}
          />
        </div>

        {role === "driver" ? (
          <>
            <div className="border-b border-zinc-800 pb-2 pt-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {t("auth.vehicleInformation")}
              </h3>
            </div>

            <Input
              label={t("auth.driverLicenseNumber")}
              name="licenseNumber"
              placeholder={t("auth.licensePlaceholder")}
              value={formData.licenseNumber}
              onChange={handleChange}
              error={errors.licenseNumber ? validation(errors.licenseNumber as never) : undefined}
              disabled={isLoading}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t("auth.vehicleType")}
                name="vehicleType"
                placeholder={t("auth.vehicleTypePlaceholder")}
                value={formData.vehicleType}
                onChange={handleChange}
                error={errors.vehicleType ? validation(errors.vehicleType as never) : undefined}
                disabled={isLoading}
              />

              <Input
                label={t("auth.vehiclePlateNumber")}
                name="vehiclePlate"
                placeholder={t("auth.plateNumberPlaceholder")}
                value={formData.vehiclePlate}
                onChange={handleChange}
                error={errors.vehiclePlate ? validation(errors.vehiclePlate as never) : undefined}
                disabled={isLoading}
              />
            </div>
          </>
        ) : (
          <>
            <div className="border-b border-zinc-800 pb-2 pt-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {t("auth.officeInformation")}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t("auth.businessName")}
                name="businessName"
                placeholder={t("auth.businessNamePlaceholder")}
                value={formData.businessName}
                onChange={handleChange}
                error={errors.businessName ? validation(errors.businessName as never) : undefined}
                disabled={isLoading}
              />

              <Input
                label={t("auth.officeLicenseNumber")}
                name="licenseNumber"
                placeholder={t("auth.officeLicensePlaceholder")}
                value={formData.licenseNumber}
                onChange={handleChange}
                error={errors.licenseNumber ? validation(errors.licenseNumber as never) : undefined}
                disabled={isLoading}
              />
            </div>

            <Input
              label={t("auth.officeAddress")}
              name="officeAddress"
              placeholder={t("auth.officeAddressPlaceholder")}
              value={formData.officeAddress}
              onChange={handleChange}
              error={errors.officeAddress ? validation(errors.officeAddress as never) : undefined}
              disabled={isLoading}
            />
          </>
        )}

        <Button type="submit" fullWidth loading={isLoading}>
          {role === "driver" ? t("auth.createDriverAccount") : t("auth.createOfficeAccount")}
        </Button>

        <div className="text-center text-sm text-zinc-400">
          {t("auth.haveAccount")}{" "}
          <Link
            href={ROUTES.LOGIN}
            className="font-semibold text-blue-500 hover:underline"
          >
            {t("auth.signIn")}
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
