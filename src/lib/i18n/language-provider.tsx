"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { dictionaries, type Dictionary, type Locale } from "./dictionary";

type LanguageContextValue = {
  locale: Locale;
  dir: "rtl" | "ltr";
  t: Dictionary;
  setLocale: (l: Locale) => void;
  toggle: () => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "mutjah-locale";

/* ── External store: localStorage-backed locale ────────────────────────── */
type Listener = () => void;
const listeners = new Set<Listener>();
let cached: Locale | null = null;

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Locale {
  if (cached === null) {
    try {
      cached = window.localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "ar";
    } catch {
      cached = "ar";
    }
  }
  return cached;
}

function getServerSnapshot(): Locale {
  return "ar";
}

function writeLocale(l: Locale) {
  cached = l;
  try {
    window.localStorage.setItem(STORAGE_KEY, l);
  } catch {
    /* ignore */
  }
  listeners.forEach((cb) => cb());
}

/* ──────────────────────────────────────────────────────────────────────── */

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Keep <html lang/dir> in sync with the selected locale (external system)
  useEffect(() => {
    const dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => writeLocale(l), []);
  const toggle = useCallback(
    () => writeLocale(getSnapshot() === "ar" ? "en" : "ar"),
    []
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      dir: locale === "ar" ? "rtl" : "ltr",
      t: dictionaries[locale],
      setLocale,
      toggle,
    }),
    [locale, setLocale, toggle]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
