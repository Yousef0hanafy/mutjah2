/**
 * MUTJAH admin content seed
 * Imports the current dictionary content into the DB so the admin panel
 * starts fully populated. Seed-if-empty: re-running never overwrites
 * admin edits. Also creates the AdminUser from env credentials.
 *
 * Run: bun scripts/seed-admin-content.ts
 */
import { PrismaClient } from "@prisma/client";
import { scryptSync, randomBytes } from "node:crypto";
import { dictionaries } from "../src/lib/i18n/dictionary";

const db = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

async function main() {
  const ar = dictionaries.ar;
  const en = dictionaries.en;

  /* ── Projects ────────────────────────────────────────────────────────── */
  const projectCount = await db.project.count();
  if (projectCount === 0) {
    const covers: Record<string, string> = {
      infeworks: "/images/work/infeworks.webp",
      hemma: "/images/work/hemma.webp",
      qidr: "/images/work/qidr.webp",
      elmorabbi: "/images/work/elmorabbi.webp",
      "performance-gym": "/images/work/performance-gym.webp",
    };
    const rows = ar.work.projects.map((p, i) => {
      const e = en.work.projects.find((x) => x.id === p.id);
      return {
        order: i,
        name: p.name,
        status: p.status,
        langs: JSON.stringify(p.langs ?? ["ar", "en"]),
        headlineAr: p.headline,
        headlineEn: e?.headline ?? p.headline,
        descAr: p.desc,
        descEn: e?.desc ?? p.desc,
        tagsAr: JSON.stringify(p.tags ?? []),
        tagsEn: JSON.stringify(e?.tags ?? p.tags ?? []),
        url: p.url ?? null,
        coverPath: covers[p.id] ?? null,
        published: true,
      };
    });
    await db.project.createMany({ data: rows });
    console.log(`✓ Projects seeded: ${rows.length}`);
  } else {
    console.log(`• Projects already present (${projectCount}) — skipped`);
  }

  /* ── Services ────────────────────────────────────────────────────────── */
  const serviceCount = await db.serviceItem.count();
  if (serviceCount === 0) {
    const rows = ar.services.items.map((s, i) => {
      const e = en.services.items.find((x) => x.id === s.id);
      return {
        order: i,
        icon: ["globe", "layout-grid", "database", "bot"][i] ?? "globe",
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
    await db.serviceItem.createMany({ data: rows });
    console.log(`✓ Services seeded: ${rows.length}`);
  } else {
    console.log(`• Services already present (${serviceCount}) — skipped`);
  }

  /* ── FAQ ─────────────────────────────────────────────────────────────── */
  const faqCount = await db.faqItem.count();
  if (faqCount === 0) {
    const rows = ar.faq.items.map((f, i) => {
      const e = en.faq.items[i];
      return {
        order: i,
        qAr: f.q,
        qEn: e?.q ?? f.q,
        aAr: f.a,
        aEn: e?.a ?? f.a,
        published: true,
      };
    });
    await db.faqItem.createMany({ data: rows });
    console.log(`✓ FAQ items seeded: ${rows.length}`);
  } else {
    console.log(`• FAQ already present (${faqCount}) — skipped`);
  }

  /* ── Site settings (mirror current site-config values) ───────────────── */
  const settings: Array<{ key: string; value: string }> = [
    { key: "contact_email", value: "hello@mutjah.com" },
    { key: "contact_whatsapp", value: "201100475722" },
  ];
  for (const s of settings) {
    await db.siteSetting.upsert({
      where: { key: s.key },
      update: {}, // do not clobber admin edits
      create: s,
    });
  }
  console.log("✓ Site settings ensured");

  /* ── Admin user (from env) ───────────────────────────────────────────── */
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.log("⚠ ADMIN_EMAIL / ADMIN_PASSWORD missing in .env — admin user NOT created");
  } else {
    const existing = await db.adminUser.count();
    if (existing === 0) {
      await db.adminUser.create({
        data: { email: email.toLowerCase(), passwordHash: hashPassword(password) },
      });
      console.log(`✓ Admin user created: ${email}`);
    } else {
      console.log(`• Admin user already exists (${existing}) — skipped`);
    }
  }

  console.log("\nSeed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
