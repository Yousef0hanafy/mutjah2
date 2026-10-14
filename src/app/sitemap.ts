import type { MetadataRoute } from "next";
import { locales, localePath } from "@/lib/i18n/config";
import { absoluteUrl, languageAlternates } from "@/lib/seo";

// Evaluated at build time: lastmod = last deploy, not "now" on every crawl. (Admin edits revalidate pages
// without a deploy; the hourly crawl picks those up via the pages themselves.)
const BUILD_TIME = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.map((locale) => ({
    url: absoluteUrl(localePath(locale)),
    lastModified: BUILD_TIME,
    changeFrequency: "weekly",
    priority: locale === "ar" ? 1 : 0.9,
    alternates: { languages: languageAlternates() },
  }));
}
