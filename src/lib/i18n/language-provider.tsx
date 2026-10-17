"use client";

import { createContext, useContext, useMemo } from "react";
import { dictionaries, type Dictionary, type Locale } from "./dictionary";
import { localeDir, localePath, otherLocale } from "./config";

type LanguageContextValue = {
  locale: Locale;
  dir: "rtl" | "ltr";
  t: Dictionary;
  /** Crawlable URL of the same page in the other language (e.g. `/en/services/websites`). */
  switchHref: string;
  /** Home page of the active locale (`/ar` or `/en`), for links to home sections. */
  homeHref: string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

/** The locale comes from the URL (`/ar`, `/en`) so each language has its own indexable page. */
export function LanguageProvider({
  locale,
  pathSuffix = "",
  children,
}: {
  locale: Locale;
  /** Path after the locale segment, e.g. `/services/websites`; "" on the home page. */
  pathSuffix?: string;
  children: React.ReactNode;
}) {
  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      dir: localeDir(locale),
      t: dictionaries[locale],
      switchHref: `${localePath(otherLocale(locale))}${pathSuffix}`,
      homeHref: localePath(locale),
    }),
    [locale, pathSuffix]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
