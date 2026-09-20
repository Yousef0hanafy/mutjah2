import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Alexandria, Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { JsMounted } from "@/components/site/js-mounted";
import { PwaRegister } from "@/components/site/pwa-register";
import { siteConfig } from "@/lib/site-config";

const alexandria = Alexandria({
  variable: "--font-alexandria",
  subsets: ["arabic", "latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const descriptionAr =
  "مُتَّجَه شركة حلول رقمية تنفيذية للعالم العربي: نبني مواقع ومنتجات رقمية وأنظمة أعمال وأتمتة وحلول ذكاء اصطناعي تطبيقية حول ما يحتاجه عملك فعلًا — من الاحتياج إلى شيء يعمل.";
const descriptionEn =
  "MUTJAH is an execution-led digital solutions company for the Arab world. Websites, digital products, business systems, automation and applied AI — built around real business needs.";

const ogImageUrl = `${siteConfig.url}/og.png`;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mutjah | متجه",
  },
  title: {
    default: "MUTJAH | مُتَّجَه — شركة حلول رقمية تنفيذية للعالم العربي",
    template: "%s | MUTJAH مُتَّجَه",
  },
  description: `${descriptionAr}\n${descriptionEn}`,
  keywords: [
    "MUTJAH",
    "Mutjah",
    "مُتَّجَه",
    "متجه",
    "متجة",
    "شركة متجه",
    "شركة متجة",
    "شركة مُتَّجَه",
    "شركة MUTJAH",
    "شركة حلول رقمية",
    "شركة برمجيات في الوطن العربي",
    "تصميم وتطوير مواقع",
    "تصميم مواقع للشركات العربية",
    "منصات رقمية",
    "أنظمة إدارة داخلية",
    "أتمتة العمليات",
    "ذكاء اصطناعي للشركات",
    "تطوير MVP",
    "digital solutions company MENA",
    "web development MENA",
    "business automation MENA",
    "applied AI MENA",
    "bilingual websites RTL",
    "Arabic web design",
  ],
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
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  alternates: {
    canonical: siteConfig.url,
    languages: {
      ar: siteConfig.url,
      en: siteConfig.url,
      "x-default": siteConfig.url,
    },
  },
  openGraph: {
    type: "website",
    locale: "ar_AR",
    alternateLocale: ["en_US"],
    url: siteConfig.url,
    siteName: "MUTJAH | مُتَّجَه",
    title: "MUTJAH | مُتَّجَه — لكل عمل اتجاه. نبني ما يحرّكه.",
    description: descriptionAr,
    images: [
      {
        url: ogImageUrl,
        secureUrl: ogImageUrl,
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "MUTJAH — لكل عمل اتجاه. نبني ما يحرّكه.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MUTJAH | مُتَّجَه — لكل عمل اتجاه. نبني ما يحرّكه.",
    description: descriptionAr,
    images: [ogImageUrl],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0E14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID || "ykz3cr0nln";
  const gaId = process.env.NEXT_PUBLIC_GA_ID || "G-N0YPDK0ZFY";

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        {/* Pre-paint: flag that inline JS runs, arm a hydration watchdog
            (if the app never hydrates — blocked/failed chunks — the CSS
            fail-open guard reveals all animated content after 4s), and
            apply saved language before first paint to avoid direction flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.setAttribute('data-js','1');setTimeout(function(){if(!window.__mutjahMounted){document.documentElement.setAttribute('data-js-failed','1');}},4000);(function(){try{var l=localStorage.getItem('mutjah-locale');if(l==='en'||l==='ar'){document.documentElement.lang=l;document.documentElement.dir=l==='ar'?'rtl':'ltr';}}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${alexandria.variable} ${manrope.variable} antialiased bg-background text-foreground`}>
        {children}
        <JsMounted />
        <PwaRegister />
        <Toaster />

        {/* Microsoft Clarity */}
        {clarityId && (
          <Script
            id="microsoft-clarity"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "${clarityId}");`,
            }}
          />
        )}

        {/* Google Analytics 4 (GA4) */}
        {gaId && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
      </body>
    </html>
  );
}
