import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/dictionary";
import { siteConfig } from "@/lib/site-config";
import { locales, localePath } from "@/lib/i18n/config";

type SeoCopy = {
  title: string;
  description: string;
  ogTitle: string;
  ogLocale: string;
  keywords: string[];
};

export const seoCopy: Record<Locale, SeoCopy> = {
  ar: {
    title: "مُتَّجَه | مواقع وأنظمة وأتمتة وذكاء اصطناعي للشركات والأفراد",
    description:
      "مُتَّجَه شركة حلول رقمية تنفيذية: نبني مواقع ومنتجات رقمية وأنظمة أعمال وأتمتة وحلول ذكاء اصطناعي تطبيقية للشركات والأفراد — لكل عمل اتجاه، ونبني ما يحرّكه.",
    ogTitle: "مُتَّجَه | لكل عمل اتجاه. نبني ما يحرّكه.",
    ogLocale: "ar_AR",
    keywords: [
      "مُتَّجَه",
      "متجه",
      "شركة متجه",
      "شركة حلول رقمية",
            "تصميم وتطوير مواقع",
      "تطوير تطبيقات ويب",
      "أنظمة إدارة داخلية",
      "أتمتة العمليات",
      "ذكاء اصطناعي تطبيقي",
    ],
  },
  en: {
    title: "MUTJAH | Websites, Systems, Automation & AI for Companies and Individuals",
    description:
      "MUTJAH is an execution-led digital solutions company. Websites, digital products, business systems, automation and applied AI for companies and individuals — every business has a direction, and we build what moves it forward.",
    ogTitle: "MUTJAH | Every business has a direction. We build what moves it forward.",
    ogLocale: "en_US",
    keywords: [
      "MUTJAH",
      "digital solutions company",
      "web development",
      "business systems",
      "business automation",
      "applied AI",
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
      alternateLocale: locale === "ar" ? ["en_US"] : ["ar_AR"],
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
