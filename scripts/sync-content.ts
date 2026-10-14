/**
 * MUTJAH content sync: dictionary -> database (services + FAQ only).
 *
 * The public site renders services/FAQ from the database when rows exist, so editing
 * `src/lib/i18n/dictionary.ts` alone does not change a live site whose DB was seeded earlier
 * (`seed-admin-content.ts` never overwrites). This script replaces those two tables with the
 * dictionary content. Projects, testimonials, leads and settings are NEVER touched.
 *
 * It overwrites admin edits to services/FAQ, so it is a dry run by default.
 *   bun scripts/sync-content.ts          # show what would change
 *   bun scripts/sync-content.ts --yes    # apply
 * After applying, any admin save (or the hourly ISR refresh) updates the public pages.
 */
import { PrismaClient } from "@prisma/client";
import { dictionaries } from "../src/lib/i18n/dictionary";

const db = new PrismaClient();

/** Icon per service id (not per array position, so reordering the dictionary cannot mismatch icons). */
const SERVICE_ICONS: Record<string, string> = {
  website: "globe",
  product: "layout-grid",
  system: "database",
  automation: "bot",
};
const apply = process.argv.includes("--yes");

async function main() {
  const ar = dictionaries.ar;
  const en = dictionaries.en;

  const services = ar.services.items.map((s, i) => {
    const e = en.services.items.find((x) => x.id === s.id);
    return {
      order: i,
      icon: SERVICE_ICONS[s.id] ?? "globe",
      titleAr: s.title,
      titleEn: e?.title ?? s.title,
      needAr: s.need,
      needEn: e?.need ?? s.need,
      descAr: s.desc,
      descEn: e?.desc ?? s.desc,
      deliverablesAr: JSON.stringify(s.deliverables ?? []),
      deliverablesEn: JSON.stringify(e?.deliverables ?? s.deliverables ?? []),
      published: true,
    };
  });

  const faqs = ar.faq.items.map((f, i) => ({
    order: i,
    qAr: f.q,
    qEn: en.faq.items[i]?.q ?? f.q,
    aAr: f.a,
    aEn: en.faq.items[i]?.a ?? f.a,
    published: true,
  }));

  const [svcNow, faqNow] = await Promise.all([db.serviceItem.count(), db.faqItem.count()]);
  console.log(`Services: ${svcNow} in DB -> ${services.length} from dictionary`);
  console.log(`FAQ:      ${faqNow} in DB -> ${faqs.length} from dictionary`);

  if (!apply) {
    console.log("\nDry run. Re-run with --yes to replace services and FAQ (admin edits to them will be lost).");
    return;
  }

  await db.$transaction([
    db.serviceItem.deleteMany(),
    db.serviceItem.createMany({ data: services }),
    db.faqItem.deleteMany(),
    db.faqItem.createMany({ data: faqs }),
  ]);
  console.log("\n✓ Services and FAQ replaced from the dictionary (unpublished drafts included were removed).");
  console.log("Note: this script runs outside Next, so it cannot revalidate. Pages refresh within the hour, or save anything in /admin to refresh /ar and /en immediately.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
