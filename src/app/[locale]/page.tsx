import { notFound } from "next/navigation";
import { LanguageProvider } from "@/lib/i18n/language-provider";
import { hasLocale, localePath } from "@/lib/i18n/config";
import { seoCopy, absoluteUrl } from "@/lib/seo";
import type { Locale } from "@/lib/i18n/dictionary";
import { dictionaries } from "@/lib/i18n/dictionary";
import { siteConfig } from "@/lib/site-config";
import { db } from "@/lib/db";
import { parseJsonArray, type ContactInfo, type FaqItemData, type ServiceItemData, type WorkProjectData } from "@/lib/admin/types";
import { Header } from "@/components/site/header";
import { Hero } from "@/components/site/hero";
import { Assurances } from "@/components/site/assurances";
import { Movement } from "@/components/site/movement";
import { RouteLab } from "@/components/site/route-lab";
import { Services } from "@/components/site/services";
import { Process } from "@/components/site/process";
import { Work } from "@/components/site/work";
import { Testimonials } from "@/components/site/testimonials";
import { Audience } from "@/components/site/audience";
import { Why } from "@/components/site/why";
import { Faq } from "@/components/site/faq";
import { ContactWizard } from "@/components/site/contact-wizard";
import { Footer } from "@/components/site/footer";
import { WhatsAppFloat } from "@/components/site/whatsapp-float";

/**
 * Statically generated per locale (/ar, /en) and refreshed hourly. Admin edits
 * trigger on-demand revalidation (see revalidateSite) so changes show up instantly.
 */
export const revalidate = 3600;

/** Structured data — Organization, WebSite, ProfessionalService, FAQPage (+ reviews when published) */
function JsonLd({
  locale,
  contact,
  reviews,
  faqs,
  services,
}: {
  locale: Locale;
  contact: ContactInfo;
  reviews: Array<{ name: string; quote: string }>;
  faqs: Array<{ q: string; a: string }>;
  services: Array<{ title: string; desc: string }>;
}) {
  const t = dictionaries[locale];
  const root = siteConfig.url;
  const url = absoluteUrl(localePath(locale));
  const orgId = `${root}/#organization`;

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: "MUTJAH",
        alternateName: [
          "مُتَّجَه",
          "متجه",
          "متجة",
          "Mutjah",
          "شركة متجه",
          "شركة متجة",
          "شركة مُتَّجَه",
        ],
        url: root,
        logo: `${root}/icon.png`,
        image: `${root}${siteConfig.ogImage}`,
        description: t.footer.descriptor,
        slogan: `${t.hero.titleA} ${t.hero.titleB}`,
        ...(contact.email || contact.whatsapp
          ? {
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "sales",
                availableLanguage: ["Arabic", "English"],
                ...(contact.email ? { email: contact.email } : {}),
                ...(contact.whatsapp ? { telephone: `+${contact.whatsapp}` } : {}),
              },
            }
          : {}),
        ...(siteConfig.linkedin || siteConfig.facebook
          ? {
              sameAs: [siteConfig.linkedin, siteConfig.facebook].filter(Boolean),
            }
          : {}),
        knowsAbout: [
          "Web development",
          "Digital product design",
          "Business systems",
          "Workflow automation",
          "Applied AI",
          "Bilingual Arabic/English websites",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${root}/#website`,
        url: root,
        name: "MUTJAH | مُتَّجَه",
        inLanguage: ["ar", "en"],
        publisher: { "@id": orgId },
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: seoCopy[locale].title,
        description: seoCopy[locale].description,
        inLanguage: locale,
        isPartOf: { "@id": `${root}/#website` },
        about: { "@id": orgId },
      },
      {
        "@type": "ProfessionalService",
        "@id": `${root}/#service`,
        name: "MUTJAH مُتَّجَه",
        url: root,
        image: `${root}${siteConfig.ogImage}`,
        description: t.footer.descriptor,
        parentOrganization: { "@id": orgId },
        ...(reviews.length > 0 && {
          review: reviews.map((r) => ({
            "@type": "Review",
            reviewBody: r.quote,
            author: { "@type": "Person", name: r.name },
          })),
        }),
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: t.services.heading,
          itemListElement: services.map((s) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: s.title,
              description: s.desc,
            },
          })),
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        inLanguage: locale,
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}

/**
 * DB reads are cached by ISR, so a transient DB failure must NOT be baked into the cache as
 * "empty content": in production we rethrow (Next keeps serving the last good page and a failed
 * build never ships fallback copy by accident). Set ALLOW_DB_FALLBACK=1 to render the dictionary
 * fallback anyway (local development / CI builds without a database).
 */
function handleDbError(scope: string, err: unknown): void {
  console.error(`[page] failed to load ${scope}:`, err);
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_DB_FALLBACK !== "1") throw err;
}

/** One short retry absorbs a Neon cold start or pooler blip so it doesn't fail a build or an ISR refresh. */
async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, 400 * (i + 1)));
    }
  }
  throw lastErr;
}

/** Published projects from the DB — fallback to dictionary happens in <Work>. */
async function getWorkProjects(): Promise<WorkProjectData[] | undefined> {
  try {
    const rows = await withRetry(() => db.project.findMany({ where: { published: true }, orderBy: { order: "asc" } }));
    if (rows.length === 0) return undefined;
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      status: (r.status as WorkProjectData["status"]) ?? "deployed",
      langs: parseJsonArray(r.langs),
      headlineAr: r.headlineAr,
      headlineEn: r.headlineEn,
      descAr: r.descAr,
      descEn: r.descEn,
      tagsAr: parseJsonArray(r.tagsAr),
      tagsEn: parseJsonArray(r.tagsEn),
      url: r.url,
      coverPath: r.coverPath,
    }));
  } catch (err) {
    handleDbError("projects", err);
    return undefined;
  }
}

/** Published testimonials from the DB — section + Review schema hide when empty. */
async function getPublishedTestimonials() {
  try {
    const rows = await withRetry(() => db.testimonial.findMany({ where: { published: true }, orderBy: { order: "asc" } }));
    if (rows.length === 0) return undefined;
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      company: r.company,
      roleAr: r.roleAr,
      roleEn: r.roleEn,
      quoteAr: r.quoteAr,
      quoteEn: r.quoteEn,
      avatarPath: r.avatarPath,
    }));
  } catch (err) {
    handleDbError("testimonials", err);
    return undefined;
  }
}

/** Published FAQ items from the DB. */
async function getPublishedFaqs(): Promise<FaqItemData[] | undefined> {
  try {
    const rows = await withRetry(() => db.faqItem.findMany({ where: { published: true }, orderBy: { order: "asc" } }));
    if (rows.length === 0) return undefined;
    return rows.map((r) => ({ id: r.id, qAr: r.qAr, qEn: r.qEn, aAr: r.aAr, aEn: r.aEn }));
  } catch (err) {
    handleDbError("faqs", err);
    return undefined;
  }
}

/** Published services from the DB. */
async function getPublishedServices(): Promise<ServiceItemData[] | undefined> {
  try {
    const rows = await withRetry(() => db.serviceItem.findMany({ where: { published: true }, orderBy: { order: "asc" } }));
    if (rows.length === 0) return undefined;
    return rows.map((r) => ({
      id: r.id,
      icon: r.icon,
      titleAr: r.titleAr,
      titleEn: r.titleEn,
      needAr: r.needAr,
      needEn: r.needEn,
      descAr: r.descAr,
      descEn: r.descEn,
      deliverablesAr: parseJsonArray(r.deliverablesAr),
      deliverablesEn: parseJsonArray(r.deliverablesEn),
    }));
  } catch (err) {
    handleDbError("services", err);
    return undefined;
  }
}

/** Contact channels from DB settings — siteConfig values as fallback. */
async function getContactSettings(): Promise<ContactInfo> {
  try {
    const rows = await withRetry(() =>
      db.siteSetting.findMany({
        where: { key: { in: ["contact_email", "contact_whatsapp"] } },
      })
    );
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return {
      email: map.contact_email || siteConfig.email,
      whatsapp: map.contact_whatsapp || siteConfig.whatsapp,
    };
  } catch (err) {
    handleDbError("contact settings", err);
    return { email: siteConfig.email, whatsapp: siteConfig.whatsapp };
  }
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!hasLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;

  const [workProjects, testimonials, faqs, services, contact] = await Promise.all([
    getWorkProjects(),
    getPublishedTestimonials(),
    getPublishedFaqs(),
    getPublishedServices(),
    getContactSettings(),
  ]);

  const isAr = locale === "ar";
  const t = dictionaries[locale];
  const jsonLdFaqs =
    faqs && faqs.length > 0
      ? faqs.map((f) => ({ q: isAr ? f.qAr : f.qEn, a: isAr ? f.aAr : f.aEn }))
      : t.faq.items.map((f) => ({ q: f.q, a: f.a }));
  const jsonLdServices =
    services && services.length > 0
      ? services.map((s) => ({ title: isAr ? s.titleAr : s.titleEn, desc: isAr ? s.descAr : s.descEn }))
      : t.services.items.map((s) => ({ title: s.title, desc: s.desc }));

  return (
    <LanguageProvider locale={locale}>
      <JsonLd
        locale={locale}
        contact={contact}
        reviews={(testimonials ?? []).map((r) => ({ name: r.name, quote: isAr ? r.quoteAr : r.quoteEn }))}
        faqs={jsonLdFaqs}
        services={jsonLdServices}
      />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-canvas"
      >
        {t.misc.skipToContent}
      </a>
      <Header />
      <main id="main" className="flex min-h-screen flex-col">
        <Hero />
        <Assurances />
        <Movement />
        <RouteLab />
        <Services services={services} />
        <Process />
        <Work projects={workProjects} />
        <Testimonials testimonials={testimonials} />
        <Audience />
        <Why />
        <Faq faqs={faqs} />
        <ContactWizard contact={contact} />
      </main>
      <Footer contact={contact} />
      <WhatsAppFloat contact={contact} />
    </LanguageProvider>
  );
}
