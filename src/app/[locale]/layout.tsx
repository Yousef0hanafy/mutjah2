import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "../globals.css";
import { alexandria, manrope } from "@/lib/fonts";
import { Toaster } from "@/components/ui/toaster";
import { JsMounted } from "@/components/site/js-mounted";
import { PwaRegister } from "@/components/site/pwa-register";
import { notFound } from "next/navigation";
import { hasLocale, localeDir, locales } from "@/lib/i18n/config";
import { buildMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  return buildMetadata(locale);
}

export const viewport: Viewport = {
  themeColor: "#0B0E14",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID || "ykz3cr0nln";
  const gaId = process.env.NEXT_PUBLIC_GA_ID || "G-N0YPDK0ZFY";

  return (
    <html lang={locale} dir={localeDir(locale)} suppressHydrationWarning>
      <head>
        {/* Pre-paint: flag that inline JS runs, arm a hydration watchdog
            (if the app never hydrates — blocked/failed chunks — the CSS
            fail-open guard reveals all animated content after 4s) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.setAttribute('data-js','1');setTimeout(function(){if(!window.__mutjahMounted){document.documentElement.setAttribute('data-js-failed','1');}},4000);`,
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
