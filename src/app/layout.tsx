import type { Metadata, Viewport } from "next";
import { Alexandria, Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { JsMounted } from "@/components/site/js-mounted";
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

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "MUTJAH | مُتَّجَه — شركة حلول رقمية تنفيذية للعالم العربي",
    template: "%s | MUTJAH مُتَّجَه",
  },
  description: `${descriptionAr}\n${descriptionEn}`,
  keywords: [
    "MUTJAH",
    "مُتَّجَه",
    "متجة",
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
  alternates: {
    canonical: "/",
    languages: {
      ar: "/",
      en: "/",
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
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "MUTJAH — لكل عمل اتجاه. نبني ما يحرّكه.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MUTJAH | مُتَّجَه — لكل عمل اتجاه. نبني ما يحرّكه.",
    description: descriptionEn,
    images: [siteConfig.ogImage],
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
  themeColor: "#F2EFE7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        <Toaster />
      </body>
    </html>
  );
}
