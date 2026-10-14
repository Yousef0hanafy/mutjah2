import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/dictionary";
import { siteConfig } from "@/lib/site-config";
import { locales, localePath } from "@/lib/i18n/config";

/** Markets MUTJAH actively targets, in priority order: Egypt first, then Saudi Arabia. */
export const TARGET_MARKETS = [
  { name: "Egypt", nameAr: "مصر", code: "EG" },
  { name: "Saudi Arabia", nameAr: "المملكة العربية السعودية", code: "SA" },
] as const;

type SeoCopy = {
  title: string;
  description: string;
  ogTitle: string;
  ogLocale: string;
  keywords: string[];
};

export const seoCopy: Record<Locale, SeoCopy> = {
  ar: {
    title: "مُتَّجَه | مواقع وأنظمة وأتمتة وذكاء اصطناعي للشركات في مصر والسعودية",
    description:
      "مُتَّجَه شركة حلول رقمية تنفيذية: نبني مواقع ومنصات وأنظمة داخلية وأتمتة وحلول ذكاء اصطناعي تطبيقية للشركات في مصر والسعودية — من الاحتياج إلى شيء يعمل.",
    ogTitle: "مُتَّجَه | لكل عمل اتجاه. نبني ما يحرّكه.",
    ogLocale: "ar_EG",
    keywords: [
      "مُتَّجَه",
      "متجه",
      "شركة متجه",
      "شركة حلول رقمية",
      "شركة برمجة في مصر",
      "شركة برمجة في السعودية",
      "تصميم مواقع للشركات",
      "تطوير تطبيقات ويب",
      "أنظمة إدارة داخلية",
      "أتمتة العمليات",
      "حلول الذكاء الاصطناعي للشركات",
    ],
  },
  en: {
    title: "MUTJAH | Websites, Systems, Automation & AI for Businesses in Egypt & Saudi Arabia",
    description:
      "MUTJAH is an execution-led digital solutions company. We build websites, platforms, internal business systems, automation and applied AI for businesses in Egypt and Saudi Arabia — from a real need to something that works.",
    ogTitle: "MUTJAH | Every business has a direction. We build what moves it forward.",
    ogLocale: "en_US",
    keywords: [
      "MUTJAH",
      "digital solutions company Egypt",
      "software company Saudi Arabia",
      "web development Egypt",
      "web development Saudi Arabia",
      "business automation",
      "applied AI for business",
      "bilingual Arabic English websites",
    ],
  },
};

export const absoluteUrl = (path = "") => `${siteConfig.url}${path}`;

/** hreflang map: each language has its own URL; x-default is the Arabic home. */
export function languageAlternates() {
  return {
    ...Object.fromEntries(locales.map((l) => [l, absoluteUrl(localePath(l))])),
    "x-default": absoluteUrl(localePath("ar")),
  };
}

export function buildMetadata(locale: Locale): Metadata {
  const copy = seoCopy[locale];
  const url = absoluteUrl(localePath(locale));
  const ogImageUrl = absoluteUrl(siteConfig.ogImage);

  return {
    metadataBase: new URL(siteConfig.url),
    manifest: "/manifest.json",
    applicationName: "MUTJAH",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "Mutjah | متجه",
    },
    title: { default: copy.title, template: "%s | MUTJAH مُتَّجَه" },
    description: copy.description,
    keywords: copy.keywords,
    authors: [{ name: "MUTJAH" }],
    creator: "MUTJAH",
    publisher: "MUTJAH",
    category: "technology",
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
    alternates: {
      canonical: url,
      languages: languageAlternates(),
    },
    openGraph: {
      type: "website",
      locale: copy.ogLocale,
      alternateLocale: locale === "ar" ? ["ar_SA", "en_US"] : ["ar_EG", "ar_SA"],
      url,
      siteName: "MUTJAH | مُتَّجَه",
      title: copy.ogTitle,
      description: copy.description,
      images: [
        {
          url: ogImageUrl,
          secureUrl: ogImageUrl,
          width: 1200,
          height: 630,
          type: "image/png",
          alt: copy.ogTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.ogTitle,
      description: copy.description,
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
  };
}
