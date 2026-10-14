/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import { buildMetadata, languageAlternates } from "@/lib/seo";
import { hasLocale, locales, localePath, otherLocale } from "@/lib/i18n/config";
import { siteConfig } from "@/lib/site-config";

describe("locale helpers", () => {
  test("only ar and en are valid locales", () => {
    expect(locales).toEqual(["ar", "en"]);
    expect(hasLocale("ar")).toBe(true);
    expect(hasLocale("en")).toBe(true);
    expect(hasLocale("fr")).toBe(false);
    expect(hasLocale("admin")).toBe(false);
  });

  test("switching language returns the other locale", () => {
    expect(otherLocale("ar")).toBe("en");
    expect(otherLocale("en")).toBe("ar");
    expect(localePath("en")).toBe("/en");
  });
});

describe("per-language SEO metadata", () => {
  test("hreflang maps each language to its own URL; x-default is Arabic", () => {
    expect(languageAlternates()).toEqual({
      ar: `${siteConfig.url}/ar`,
      en: `${siteConfig.url}/en`,
      "x-default": `${siteConfig.url}/ar`,
    });
  });

  for (const locale of ["ar", "en"] as const) {
    test(`${locale}: canonical points at its own URL`, () => {
      const m = buildMetadata(locale);
      expect(m.alternates?.canonical).toBe(`${siteConfig.url}/${locale}`);
      expect(m.openGraph).toMatchObject({ url: `${siteConfig.url}/${locale}` });
    });

    test(`${locale}: title and description are single-language and bounded`, () => {
      const m = buildMetadata(locale);
      const title = (m.title as { default: string }).default;
      const desc = String(m.description);
      expect(title.length).toBeLessThanOrEqual(90);
      expect(desc.length).toBeGreaterThan(60);
      expect(desc.length).toBeLessThanOrEqual(260);
      expect(desc).not.toContain("\n");
      const hasArabic = /[؀-ۿ]/.test(desc);
      expect(hasArabic).toBe(locale === "ar");
    });
  }
});
