"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerCustomerSchema } from "@/lib/validation/common";
import { AuthLayout } from "../components/auth-layout";
import { Input } from "@/shared/ui/input";
import { PasswordInput } from "../components/password-input";
import { Button } from "@/shared/ui/button";
import { ROUTES } from "@/constants/routes";
import { useTranslation } from "@/shared/hooks/use-translation";
import { useTranslations } from "next-intl";
import { registerCustomer } from "../api";

export default function RegisterCustomerView() {
  const { t } = useTranslation();
  const validation = useTranslations("validation");
  const router = useRouter();
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
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
      const validationResult = registerCustomerSchema.safeParse(formData);
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

      console.log("Register Customer payload:", formData);
      await registerCustomer({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        passwordConfirmation: formData.confirmPassword,
      });
      router.push(`${ROUTES.VERIFY_OTP}?phone=${formData.phone}&purpose=register`);
    } catch (err: any) {
      console.error("Register Customer API failed:", err);
      const backendError = err.response?.data?.message || err.message || "Registration failed. Please check your data.";
      setErrors({ root: backendError });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t("auth.registerAsCustomer")}
      subtitle={t("auth.customerRegisterSubtitle")}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.root && (
          <div className="p-3 text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg text-center font-sans">
            {errors.root}
          </div>
        )}
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
          label={t("auth.email")}
          name="email"
          type="email"
          placeholder={t("auth.emailPlaceholder")}
          value={formData.email}
          onChange={handleChange}
          error={errors.email ? validation(errors.email as never) : undefined}
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

        <Button type="submit" fullWidth loading={isLoading}>
          {t("auth.register")}
        </Button>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          {t("auth.haveAccount")}{" "}
          <Link
            href={ROUTES.LOGIN}
            className="font-semibold text-blue-600 hover:underline"
          >
            {t("auth.signIn")}
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
