/** Shared types for admin-managed content (API ↔ admin UI ↔ public site). */

export type ProjectStatus = "live" | "deployed" | "mvp";

/** Bilingual project record as consumed by the public Work section. */
export type WorkProjectData = {
  id: string;
  name: string;
  status: ProjectStatus;
  langs: string[];
  headlineAr: string;
  headlineEn: string;
  descAr: string;
  descEn: string;
  tagsAr: string[];
  tagsEn: string[];
  url: string | null;
  coverPath: string | null;
};

/** Bilingual testimonial record for the public Testimonials section. */
export type TestimonialData = {
  id: string;
  name: string;
  company: string | null;
  roleAr: string | null;
  roleEn: string | null;
  quoteAr: string;
  quoteEn: string;
  avatarPath: string | null;
};

/** Bilingual FAQ record for the public FAQ section. */
export type FaqItemData = {
  id: string;
  qAr: string;
  qEn: string;
  aAr: string;
  aEn: string;
};

/** Bilingual service record for the public Services section. */
export type ServiceItemData = {
  id: string;
  icon: string;
  titleAr: string;
  titleEn: string;
  needAr: string;
  needEn: string;
  descAr: string;
  descEn: string;
  deliverablesAr: string[];
  deliverablesEn: string[];
};

/** Contact channels resolved from DB settings (siteConfig as fallback). */
export type ContactInfo = { email: string; whatsapp: string };

export function parseJsonArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  const trimmed = raw.trim();
  if (!trimmed) return [];

  // 1. Try standard JSON parse
  try {
    const v = JSON.parse(trimmed);
    if (Array.isArray(v)) {
      return v
        .filter((x): x is string => typeof x === "string")
        .map((x) => x.trim())
        .filter((x) => x.length > 0);
    }
  } catch {
    // Fall through to resilient string parsing
  }

  // 2. Resilient fallback: comma-separated or newline-separated values
  if (trimmed.includes(",") || trimmed.includes("\n")) {
    return trimmed
      .split(/[,\n]+/)
      .map((item) => item.replace(/^[["']+|[["']]+$/g, "").trim())
      .filter((item) => item.length > 0);
  }

  // 3. Single item without JSON brackets/quotes
  const cleaned = trimmed.replace(/^[["']+|[["']]+$/g, "").trim();
  return cleaned ? [cleaned] : [];
}
