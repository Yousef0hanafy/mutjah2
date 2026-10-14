"use client";

import { createContext, useContext, useMemo } from "react";
import { dictionaries, type Dictionary, type Locale } from "./dictionary";
import { localeDir, localePath, otherLocale } from "./config";

type LanguageContextValue = {
  locale: Locale;
  dir: "rtl" | "ltr";
  t: Dictionary;
  /** Crawlable URL of the other language's home page (`/en` or `/ar`). */
  switchHref: string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

/** The locale comes from the URL (`/ar`, `/en`) so each language has its own indexable page. */
export function LanguageProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      dir: localeDir(locale),
      t: dictionaries[locale],
      switchHref: localePath(otherLocale(locale)),
    }),
    [locale]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
