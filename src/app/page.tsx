import { AdminApp } from "@/components/admin/admin-app";
import { LanguageProvider } from "@/lib/i18n/language-provider";
import { dictionaries } from "@/lib/i18n/dictionary";
import { siteConfig } from "@/lib/site-config";
import { db } from "@/lib/db";
import { parseJsonArray, type ContactInfo, type FaqItemData, type ServiceItemData, type WorkProjectData } from "@/lib/admin/types";
import { Header } from "@/components/site/header";
import { Hero } from "@/components/site/hero";
import { Movement } from "@/components/site/movement";
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

/** Markets served — remote-first across the Arab world. */
const AREA_SERVED = [
  "Saudi Arabia",
  "United Arab Emirates",
  "Qatar",
  "Kuwait",
  "Bahrain",
  "Oman",
  "Jordan",
  "Lebanon",
  "Iraq",
  "Palestine",
  "Yemen",
  "Morocco",
  "Algeria",
  "Tunisia",
  "Libya",
  "Sudan",
  "Mauritania",
  "Somalia",
  "Djibouti",
].map((name) => ({ "@type": "Country", name }));

/** Structured data — Organization, WebSite, ProfessionalService, FAQPage (+ reviews when published) */
function JsonLd({
  reviews,
  faqs,
  services,
}: {
  reviews: Array<{ name: string; quoteAr: string }>;
  faqs: Array<{ q: string; a: string }>;
  services: Array<{ title: string; desc: string }>;
}) {
  const ar = dictionaries.ar;
  const en = dictionaries.en;
  const url = siteConfig.url;

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${url}/#organization`,
        name: "MUTJAH",
        alternateName: ["مُتَّجَه", "متجة", "Mutjah"],
        url,
        logo: `${url}/icon.png`,
        image: `${url}${siteConfig.ogImage}`,
        description: en.footer.descriptor,
        slogan: ar.hero.titleA + " " + ar.hero.titleB,
        areaServed: AREA_SERVED,
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
        "@id": `${url}/#website`,
        url,
        name: "MUTJAH | مُتَّجَه",
        inLanguage: ["ar", "en"],
        publisher: { "@id": `${url}/#organization` },
      },
      {
        "@type": "ProfessionalService",
        "@id": `${url}/#service`,
        name: "MUTJAH مُتَّجَه",
        url,
        image: `${url}${siteConfig.ogImage}`,
        description: ar.footer.descriptor,
        areaServed: AREA_SERVED,
        parentOrganization: { "@id": `${url}/#organization` },
        ...(reviews.length > 0 && {
          review: reviews.map((r) => ({
            "@type": "Review",
            reviewBody: r.quoteAr,
            author: { "@type": "Person", name: r.name },
          })),
        }),
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: ar.services.heading,
          itemListElement: services.map((s) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: s.title,
              description: s.desc,
              areaServed: AREA_SERVED,
            },
          })),
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${url}/#faq`,
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

/** Published projects from the DB — fallback to dictionary happens in <Work>. */
async function getWorkProjects(): Promise<WorkProjectData[] | undefined> {
  try {
    const rows = await db.project.findMany({ where: { published: true }, orderBy: { order: "asc" } });
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
    console.error("[page] failed to load projects:", err);
    return undefined;
  }
}

/** Published testimonials from the DB — section + Review schema hide when empty. */
async function getPublishedTestimonials() {
  try {
    const rows = await db.testimonial.findMany({ where: { published: true }, orderBy: { order: "asc" } });
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
    console.error("[page] failed to load testimonials:", err);
    return undefined;
  }
}

/** Published FAQ items from the DB. */
async function getPublishedFaqs(): Promise<FaqItemData[] | undefined> {
  try {
    const rows = await db.faqItem.findMany({ where: { published: true }, orderBy: { order: "asc" } });
    if (rows.length === 0) return undefined;
    return rows.map((r) => ({ id: r.id, qAr: r.qAr, qEn: r.qEn, aAr: r.aAr, aEn: r.aEn }));
  } catch (err) {
    console.error("[page] failed to load faqs:", err);
    return undefined;
  }
}

/** Published services from the DB. */
async function getPublishedServices(): Promise<ServiceItemData[] | undefined> {
  try {
    const rows = await db.serviceItem.findMany({ where: { published: true }, orderBy: { order: "asc" } });
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
    console.error("[page] failed to load services:", err);
    return undefined;
  }
}

/** Contact channels from DB settings — siteConfig values as fallback. */
async function getContactSettings(): Promise<ContactInfo> {
  try {
    const rows = await db.siteSetting.findMany({
      where: { key: { in: ["contact_email", "contact_whatsapp"] } },
    });
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return {
      email: map.contact_email || siteConfig.email,
      whatsapp: map.contact_whatsapp || siteConfig.whatsapp,
    };
  } catch (err) {
    console.error("[page] failed to load contact settings:", err);
    return { email: siteConfig.email, whatsapp: siteConfig.whatsapp };
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ admin?: string }>;
}) {
  // Admin panel — single-route access gate (/?admin=1), rendered only by query param
  const { admin } = await searchParams;
  if (admin === "1") {
    return <AdminApp />;
  }

  const workProjects = await getWorkProjects();
  const testimonials = await getPublishedTestimonials();
  const faqs = await getPublishedFaqs();
  const services = await getPublishedServices();
  const contact = await getContactSettings();

  const jsonLdFaqs =
    faqs && faqs.length > 0
      ? faqs.map((f) => ({ q: f.qAr, a: f.aAr }))
      : dictionaries.ar.faq.items.map((f) => ({ q: f.q, a: f.a }));
  const jsonLdServices =
    services && services.length > 0
      ? services.map((s) => ({ title: s.titleAr, desc: s.descAr }))
      : dictionaries.ar.services.items.map((s) => ({ title: s.title, desc: s.desc }));

  return (
    <LanguageProvider>
      <JsonLd reviews={testimonials ?? []} faqs={jsonLdFaqs} services={jsonLdServices} />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-canvas"
      >
        تخطَّ إلى المحتوى
      </a>
      <Header />
      <main id="main" className="flex min-h-screen flex-col">
        <Hero />
        <Movement />
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
