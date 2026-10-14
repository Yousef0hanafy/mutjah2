# MUTJAH (مُتَّجَه) — project guide

Marketing site + lead engine for MUTJAH, an execution-led digital solutions company.
Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind 4 + shadcn/ui · Prisma + Neon Postgres · deployed on Vercel.
Site language: Arabic-first (RTL), English secondary.

## Business goals (drive every decision)
- The site must read as a credible tech company that creates real value **and** convert visitors into leads (sales).
- **Audience: companies AND individuals** (founders, professionals) — never write copy that addresses companies only.
- **Market priority (internal strategy only): Egypt first, Saudi Arabia second.** Do NOT name countries in visible copy, titles, schema or llms.txt — the public scope stays open to everyone. Do not write "Arab world" either.
- Brand "why": we are MUTJAH (direction) because we love helping people find their direction and reach it with something that works. Copy should explain this honestly, not read as sales copy.
- Pricing policy: **never show prices or numbers** (no price ranges, no "starting from").
- Honest-claims policy: no invented metrics, clients or testimonials. Sections without real data stay hidden.
- AI goal: be discoverable/citable in ChatGPT, Google AI Overviews and similar engines (GEO). No on-site chat assistant.
- SEO is a priority. Each language has its own URL (`/ar` default/x-default, `/en`); `/` 308-redirects to `/ar`.

## Layout
- `src/app/[locale]/layout.tsx` — root layout for the public site (`<html lang dir>`, fonts, GA4 + Clarity, pre-paint fail-open script). `dynamicParams = false`, `generateStaticParams` → `/ar`, `/en`.
- `src/app/[locale]/page.tsx` — the home page, statically generated, `revalidate = 3600`; reads DB content with dictionary fallback; emits JSON-LD (no `areaServed` on purpose). In production a DB error is rethrown so ISR keeps the last good page; set `ALLOW_DB_FALLBACK=1` to build/run without a DB.
- `src/app/admin/layout.tsx` — separate root layout for `/admin` (no analytics, no PWA, noindex). `src/app/global-not-found.tsx` — 404 (needs `experimental.globalNotFound`).
- `src/lib/seo.ts` — per-locale title/description/keywords, `buildMetadata`, hreflang map. `src/lib/i18n/config.ts` — locales helpers. `src/lib/revalidate.ts` — `revalidateSite()`; **every admin mutation route must call it** so edits appear immediately.
- `src/lib/i18n/dictionary.ts` — all bilingual copy. `language-provider.tsx` takes `locale` from the URL (no localStorage); the header language switch is a real `<Link>` to the other locale.
- `public/llms.txt`, `src/app/robots.ts` (explicitly allows AI crawlers), `src/app/sitemap.ts` — discoverability for search + AI engines.
- `src/lib/site-config.ts` — domain, contact channels, socials.
- `src/components/site/*` — public sections; `src/components/admin/*` — admin UI; `src/components/ui/*` — shadcn.
- `src/app/api/leads` — public lead endpoint (zod, honeypot, DB rate limit, optional webhook).
- `src/app/api/admin/*` — admin CRUD; every route must call `requireAdmin()` (`src/lib/admin/auth.ts`).
- `public/sw.js` — PWA service worker (bypasses /admin and /api; bump `CACHE_NAME` when precache changes).

## Commands
- `npm run typecheck` · `npm run lint` · `npm run build` (needs `DATABASE_URL`, `DIRECT_DATABASE_URL`, `ADMIN_SESSION_SECRET` ≥32 chars; without a reachable DB also set `ALLOW_DB_FALLBACK=1`, otherwise the production build fails on purpose).
- `npm run db:push` — schema push to the real DB. It no longer passes `--accept-data-loss`; never add it back without asking.

## Cloud-sandbox install note
`bun.lock` points tarballs at `registry.npmjs.com`, which the sandbox proxy blocks (403). In the sandbox install with
`npm install --no-package-lock --no-audit --no-fund` (uses `registry.npmjs.org`) and do **not** commit lockfile changes made that way.
`.claude/` is git-ignored, so hooks/settings there are not shared.

## Known follow-ups (see roadmap in conversation)
- Unused dependencies in package.json (verified by grep, remove with `bun remove` locally so `bun.lock` stays in sync):
  next-auth, next-intl, z-ai-web-dev-sdk, @mdxeditor/editor, react-markdown, react-syntax-highlighter,
  @tanstack/react-query, @tanstack/react-table, @reactuses/core, uuid, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities.
- `react-hooks/set-state-in-effect` is downgraded to a warning (9 existing spots, mostly admin data-loading effects).

## Conventions
- Match surrounding code style; copy lives in the dictionary, not in components.
- Keep the fail-open visibility design: content must be visible without JS.
- Commit to the designated feature branch; open a PR only when asked.
