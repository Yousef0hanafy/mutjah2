import type { MetadataRoute } from "next";
import { locales, localePath } from "@/lib/i18n/config";
import { absoluteUrl, languageAlternates } from "@/lib/seo";

// Bump when the public content meaningfully changes (keeps lastmod honest instead of "now" on every crawl).
const CONTENT_LAST_MODIFIED = new Date("2026-10-14");

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.map((locale) => ({
    url: absoluteUrl(localePath(locale)),
    lastModified: CONTENT_LAST_MODIFIED,
    changeFrequency: "weekly",
    priority: locale === "ar" ? 1 : 0.9,
    alternates: { languages: languageAlternates() },
  }));
}
