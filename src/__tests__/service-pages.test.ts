/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { dictionaries } from "@/lib/i18n/dictionary";
import { serviceMeta, serviceSlugs, slugForServiceIcon, slugForServiceId } from "@/lib/services";
import { buildServiceMetadata, languageAlternates } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import sitemap from "@/app/sitemap";

describe("service pages", () => {
  test("every slug has a page in both languages", () => {
    for (const locale of ["ar", "en"] as const) {
      expect(Object.keys(dictionaries[locale].servicePages).sort()).toEqual([...serviceSlugs].sort());
    }
  });

  test("every slug maps to a real service, need and icon (both directions)", () => {
    const ids = dictionaries.ar.services.items.map((s) => s.id);
    for (const slug of serviceSlugs) {
      expect(ids).toContain(serviceMeta[slug].need);
      expect(slugForServiceId(serviceMeta[slug].need)).toBe(slug);
      expect(slugForServiceIcon(serviceMeta[slug].icon)).toBe(slug);
    }
    expect(slugForServiceIcon("sparkles")).toBeUndefined();
  });

  test("referenced projects exist in the portfolio (no invented work)", () => {
    for (const locale of ["ar", "en"] as const) {
      const known = new Set(dictionaries[locale].work.projects.map((p) => p.id));
      for (const slug of serviceSlugs) {
        const work = dictionaries[locale].servicePages[slug].work;
        expect(work.length).toBeGreaterThan(0);
        for (const w of work) expect(known.has(w.id)).toBe(true);
      }
    }
  });

  test("ar and en reference the same projects in the same order", () => {
    for (const slug of serviceSlugs) {
      const ids = (l: "ar" | "en") => dictionaries[l].servicePages[slug].work.map((w) => w.id);
      expect(ids("en")).toEqual(ids("ar"));
    }
  });

  for (const locale of ["ar", "en"] as const) {
    test(`${locale}: metadata is per page with its own canonical and hreflang`, () => {
      for (const slug of serviceSlugs) {
        const m = buildServiceMetadata(locale, slug);
        expect(m.alternates?.canonical).toBe(`${siteConfig.url}/${locale}/services/${slug}`);
        expect(m.alternates?.languages).toEqual(languageAlternates(`/services/${slug}`));
        const title = (m.title as { absolute: string }).absolute;
        expect(title.length).toBeLessThanOrEqual(75);
        expect(String(m.description).length).toBeLessThanOrEqual(230);
      }
    });
  }

  test("sitemap lists home + every service page in both languages", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toContain(`${siteConfig.url}/ar`);
    for (const slug of serviceSlugs) {
      expect(urls).toContain(`${siteConfig.url}/ar/services/${slug}`);
      expect(urls).toContain(`${siteConfig.url}/en/services/${slug}`);
    }
    expect(urls.length).toBe(2 + serviceSlugs.length * 2);
  });

  test("llms.txt links every service page", () => {
    const llms = readFileSync("public/llms.txt", "utf8");
    for (const slug of serviceSlugs) expect(llms).toContain(`/services/${slug}`);
  });
});
