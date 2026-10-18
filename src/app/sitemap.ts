import type { MetadataRoute } from "next";
import { locales, localePath } from "@/lib/i18n/config";
import { absoluteUrl, languageAlternates } from "@/lib/seo";
import { serviceSlugs } from "@/lib/services";

// Evaluated at build time: lastmod = last deploy, not "now" on every crawl. (Admin edits revalidate pages
// without a deploy; the hourly crawl picks those up via the pages themselves.)
const BUILD_TIME = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  const home = locales.map((locale) => ({
    url: absoluteUrl(localePath(locale)),
    lastModified: BUILD_TIME,
    changeFrequency: "weekly" as const,
    priority: locale === "ar" ? 1 : 0.9,
    alternates: { languages: languageAlternates() },
  }));
  const services = serviceSlugs.flatMap((slug) =>
    locales.map((locale) => ({
      url: absoluteUrl(`${localePath(locale)}/services/${slug}`),
      lastModified: BUILD_TIME,
      changeFrequency: "monthly" as const,
      priority: locale === "ar" ? 0.8 : 0.7,
      alternates: { languages: languageAlternates(`/services/${slug}`) },
    }))
  );
  return [...home, ...services];
}
