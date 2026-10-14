import type { Locale } from "./dictionary";

export const locales = ["ar", "en"] as const satisfies readonly Locale[];
export const defaultLocale: Locale = "ar";

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function localeDir(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

/** Path of the home page for a locale, e.g. `/ar`. */
export function localePath(locale: Locale): string {
  return `/${locale}`;
}

export function otherLocale(locale: Locale): Locale {
  return locale === "ar" ? "en" : "ar";
}
