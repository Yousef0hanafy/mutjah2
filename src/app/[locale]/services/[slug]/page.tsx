import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LanguageProvider } from "@/lib/i18n/language-provider";
import { hasLocale, localePath } from "@/lib/i18n/config";
import { dictionaries, type Locale } from "@/lib/i18n/dictionary";
import { absoluteUrl, buildServiceMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import { getContactSettings } from "@/lib/content";
import { isServiceSlug, serviceMeta, serviceSlugs, type ServiceSlug } from "@/lib/services";
import { Header } from "@/components/site/header";
import { Process } from "@/components/site/process";
import { ServiceDetail, ServiceDetailTail } from "@/components/site/service-detail";
import { ContactWizard } from "@/components/site/contact-wizard";
import { Footer } from "@/components/site/footer";
import { WhatsAppFloat } from "@/components/site/whatsapp-float";

/** Copy is static (dictionary); the hourly refresh only picks up admin contact-setting changes. */
export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return serviceSlugs.map((slug) => ({ slug }));
}

type Params = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(locale) || !isServiceSlug(slug)) return {};
  return buildServiceMetadata(locale, slug);
}

/** Service + BreadcrumbList. No FAQPage here: the questions are plain page content. */
function ServiceJsonLd({ locale, slug }: { locale: Locale; slug: ServiceSlug }) {
  const t = dictionaries[locale];
  const page = t.servicePages[slug];
  const root = siteConfig.url;
  const home = absoluteUrl(localePath(locale));
  const url = absoluteUrl(`${localePath(locale)}/services/${slug}`);
  const service = t.services.items.find((s) => s.id === serviceMeta[slug].need);

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: page.title,
        serviceType: page.title,
        description: page.seoDescription,
        url,
        inLanguage: locale,
        provider: { "@type": "Organization", "@id": `${root}/#organization`, name: "MUTJAH", url: root },
        ...(service ? { hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: page.title,
          itemListElement: service.deliverables.map((d) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: d },
          })),
        } } : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: t.servicePage.home, item: home },
          { "@type": "ListItem", position: 2, name: t.servicePage.services, item: `${home}#services` },
          { "@type": "ListItem", position: 3, name: page.title, item: url },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // `<` escaped so no string can close the script tag
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }}
    />
  );
}

export default async function ServicePage({ params }: { params: Params }) {
  const { locale: rawLocale, slug: rawSlug } = await params;
  if (!hasLocale(rawLocale) || !isServiceSlug(rawSlug)) notFound();
  const locale: Locale = rawLocale;
  const slug: ServiceSlug = rawSlug;
  const contact = await getContactSettings();

  return (
    <LanguageProvider locale={locale} pathSuffix={`/services/${slug}`}>
      <ServiceJsonLd locale={locale} slug={slug} />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-canvas"
      >
        {dictionaries[locale].misc.skipToContent}
      </a>
      <Header />
      <main id="main" className="flex min-h-screen flex-col">
        <ServiceDetail slug={slug} />
        <Process />
        <ServiceDetailTail slug={slug} />
        <ContactWizard
          contact={contact}
          defaultNeed={serviceMeta[slug].need}
          heading={dictionaries[locale].servicePages[slug].closing}
        />
      </main>
      <Footer contact={contact} />
      <WhatsAppFloat contact={contact} />
    </LanguageProvider>
  );
}
