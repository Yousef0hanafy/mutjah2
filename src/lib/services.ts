import type { Locale, NeedType } from "@/lib/i18n/dictionary";

/** The four service pages: /[locale]/services/[slug]. Order = order shown on the site. */
export const serviceSlugs = ["websites", "digital-products", "business-systems", "automation-ai"] as const;
export type ServiceSlug = (typeof serviceSlugs)[number];

/** Each page maps to a lead-wizard need, a dictionary service id and the icon it was seeded with. */
export const serviceMeta: Record<ServiceSlug, { need: NeedType; icon: string }> = {
  websites: { need: "website", icon: "globe" },
  "digital-products": { need: "product", icon: "layout-grid" },
  "business-systems": { need: "system", icon: "database" },
  "automation-ai": { need: "automation", icon: "bot" },
};

export function isServiceSlug(value: string): value is ServiceSlug {
  return (serviceSlugs as readonly string[]).includes(value);
}

export function servicePath(locale: Locale, slug: ServiceSlug): string {
  return `/${locale}/services/${slug}`;
}

/** Dictionary service id ("website", "product"…) → page slug. */
export function slugForServiceId(id: string): ServiceSlug | undefined {
  return serviceSlugs.find((s) => serviceMeta[s].need === id);
}

/**
 * DB service rows carry no slug; they were seeded with one icon per service, so the icon is
 * the stable link to a page. An icon changed in the admin simply renders the card without a link.
 */
export function slugForServiceIcon(icon: string): ServiceSlug | undefined {
  return serviceSlugs.find((s) => serviceMeta[s].icon === icon);
}
