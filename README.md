# MUTJAH — مُتَّجَه

Official website for **MUTJAH (مُتَّجَه)** — an execution-led digital solutions company (Egypt-first).  
Bilingual (Arabic RTL default / English), SEO-optimized, single-page experience with a lead-capture wizard and a full self-hosted admin panel.

> لكل عمل اتجاه. نبني ما يحرّكه.  
> Every business has a direction. We build what moves it forward.

## ✨ Features

- **Bilingual AR/EN** — Arabic-first RTL with instant LTR toggle, persisted per visitor; SSR serves Arabic for SEO
- **Single-page experience** — hero, services, process route, portfolio, audience paths, principles, FAQ, contact wizard
- **Lead capture wizard** — 4-step diagnostic form with validation, honeypot, rate limiting, and optional webhook notifications (Make.com / n8n / Slack / Discord…)
- **Admin panel** at `/?admin=1` — full CRUD for projects, testimonials, FAQ, services; leads inbox with status pipeline + CSV export; site contact settings; password management
- **DB-driven content with code fallback** — public sections render from the database; the bilingual dictionary acts as a resilient fallback
- **Honest-claims policy** — testimonials section (and Review schema) auto-hides until real ones are added
- **SEO** — full metadata, canonical + hreflang, OpenGraph/Twitter cards, JSON-LD (Organization, WebSite, ProfessionalService + OfferCatalog, FAQPage, Review), sitemap, robots
- **Performance** — optimized WebP imagery via sharp/next-image, standalone output, strict TypeScript

## 🧱 Tech Stack

| Layer      | Choice                                             |
| ---------- | -------------------------------------------------- |
| Framework  | [Next.js 16](https://nextjs.org) (App Router) + React 19 |
| Language   | TypeScript (strict)                                |
| Database   | [Neon](https://neon.tech) PostgreSQL + Prisma ORM  |
| Styling    | Tailwind CSS 4 + shadcn/ui + Lucide icons          |
| Animation  | Framer Motion                                      |
| Runtime    | [Bun](https://bun.sh)                              |

## 🚀 Getting Started

```bash
bun install

# 1) configure environment (see table below)
cp .env.example .env   # then fill in the values

# 2) push the Prisma schema to your database
bun run db:push

# 3) seed initial content + create the admin user (seed-if-empty, idempotent)
bun scripts/seed-admin-content.ts

# 4) run
bun run dev        # development — http://localhost:3000
bun run build      # production build (standalone)
```

### Environment Variables

| Variable                | Required | Description                                                                 |
| ----------------------- | -------- | --------------------------------------------------------------------------- |
| `DATABASE_URL`          | ✅       | PostgreSQL connection string (Neon **pooled** URL; include `pgbouncer=true`) |
| `DIRECT_DATABASE_URL`   | ✅       | Neon **direct** (non-pooler) URL — used for schema operations               |
| `ADMIN_EMAIL`           | ✅       | Admin panel login email                                                     |
| `ADMIN_PASSWORD`        | ✅       | Admin panel initial password (change it from the settings tab)              |
| `ADMIN_SESSION_SECRET`  | ✅       | Random string (e.g. `openssl rand -hex 32`) for signing session cookies     |
| `LEAD_WEBHOOK_URL`      | —        | Optional: POSTs every new lead as `{ text, lead }` (Make.com/n8n/Discord…)  |
| `LEAD_WEBHOOK_SECRET`   | —        | Optional: sent as `x-lead-secret` header                                    |
| `BLOB_READ_WRITE_TOKEN` | —        | Optional: Vercel Blob token — **required on Vercel** for admin image uploads (serverless FS is read-only). Connect a Blob store in the Vercel dashboard and it's added automatically |

## 🔐 Admin Panel

Open **`/?admin=1`** and sign in with your admin credentials.

- **لوحة القيادة** — overview stats
- **المشاريع** — portfolio CRUD, cover upload (auto-WebP), ordering, publish/draft
- **آراء العملاء** — testimonials CRUD (section auto-hides when empty)
- **الأسئلة الشائعة / الخدمات** — FAQ & services CRUD with ordering
- **الطلبات** — leads inbox: status pipeline, filters, CSV export
- **الإعدادات** — contact email/WhatsApp + password change

Content edits appear on the public page instantly.

## 📦 Deployment Notes

- `output: "standalone"` — deploy with `bun run build` and run `.next/standalone/server.js`
- Point `DATABASE_URL` / `DIRECT_DATABASE_URL` at your Neon project; run `bun run db:push` once
- **Persist `/public/uploads`** (mounted volume) so admin-uploaded covers/avatars survive redeploys
- Update the site URL in `src/lib/site-config.ts` and metadata/sitemap when deploying to the production domain

---

© MUTJAH — مُتَّجَه. All rights reserved.
