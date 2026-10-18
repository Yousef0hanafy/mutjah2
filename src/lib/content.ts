/**
 * Public-site content loaders (shared by the home page and the service pages).
 * Reads only published rows plus the two public contact settings — never leads or admin data.
 */
import { db } from "@/lib/db";
import { siteConfig } from "@/lib/site-config";
import { parseJsonArray, type ContactInfo, type FaqItemData, type ServiceItemData, type WorkProjectData } from "@/lib/admin/types";

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
export async function getWorkProjects(): Promise<WorkProjectData[] | undefined> {
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
export async function getPublishedTestimonials() {
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
export async function getPublishedFaqs(): Promise<FaqItemData[] | undefined> {
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
export async function getPublishedServices(): Promise<ServiceItemData[] | undefined> {
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
export async function getContactSettings(): Promise<ContactInfo> {
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
