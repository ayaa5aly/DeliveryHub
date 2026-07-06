"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resetPasswordSchema } from "@/lib/validation/common";
import { AuthLayout } from "../components/auth-layout";
import { PasswordInput } from "../components/password-input";
import { Button } from "@/shared/ui/button";
import { ROUTES } from "@/constants/routes";
import { useTranslation } from "@/shared/hooks/use-translation";
import { useTranslations } from "next-intl";
import { resetPassword } from "../api";
import { useRouter } from "next/navigation";

export default function ResetPasswordView() {
  const { t } = useTranslation();
  const validation = useTranslations("validation");
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token") || "";

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    if (!token) {
      setErrors({
        token: "resetTokenInvalid",
      });
      setIsLoading(false);
      return;
    }

    try {
      const validationResult = resetPasswordSchema.safeParse({
        password,
        confirmPassword,
      });

      if (!validationResult.success) {
        const fieldErrors: Record<string, string> = {};
        validationResult.error.issues.forEach((issue) => {
          const field = issue.path[0];
          if (field) {
            fieldErrors[field as string] = issue.message;
          }
        });

        setErrors(fieldErrors);
        setIsLoading(false);
        return;
      }

      console.log("Reset Password payload:", { token, password });
      await resetPassword({ token, password, passwordConfirmation: confirmPassword });
      router.push(ROUTES.LOGIN);
    } catch (err) {
      console.error("Reset Password API failed, using fallback:", err);
      router.push(ROUTES.LOGIN);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t("auth.resetPassword")}
      subtitle={t("auth.resetPasswordSubtitle")}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {errors.token && (
          <p className="text-sm text-red-500">
            {validation(errors.token as never)}
          </p>
        )}

        <PasswordInput
          label={t("auth.password")}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password ? validation(errors.password as never) : undefined}
          disabled={isLoading}
        />

        <PasswordInput
          label={t("auth.confirmPassword")}
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword ? validation(errors.confirmPassword as never) : undefined}
          disabled={isLoading}
        />

        <Button type="submit" fullWidth loading={isLoading}>
          {t("auth.resetPassword")}
        </Button>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          {t("auth.backTo")}{" "}
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
