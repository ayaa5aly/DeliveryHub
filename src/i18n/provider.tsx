"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useUI } from "@/hooks/useUI";
import { ar } from "./locales/ar";
import { en, type TranslationKeys } from "./locales/en";

const locales: Record<"en" | "ar", TranslationKeys> = { en, ar };

type NestedKeyOf<T, Prefix extends string = ""> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? NestedKeyOf<T[K], `${Prefix}${K}.`>
        : `${Prefix}${K}`;
    }[keyof T & string]
  : never;

export type TranslationKey = NestedKeyOf<TranslationKeys>;

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return path;
  }, obj) as string;
}

interface I18nContextValue {
  t: (key: TranslationKey) => string;
  locale: "en" | "ar";
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const { locale } = useUI();

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      t: (key) => getNestedValue(locales[locale] as unknown as Record<string, unknown>, key),
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used within I18nProvider");
  }
  return context;
}
