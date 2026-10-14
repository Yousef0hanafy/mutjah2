# MUTJAH (مُتَّجَه) — project guide

Marketing site + lead engine for MUTJAH, an execution-led digital solutions company.
Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind 4 + shadcn/ui · Prisma + Neon Postgres · deployed on Vercel.
Site language: Arabic-first (RTL), English secondary.

## Business goals (drive every decision)
- The site must read as a credible tech company that creates real value **and** convert visitors into leads (sales).
- **Target markets, in order: Egypt first, Saudi Arabia second.** Do not add copy, schema or pages for other countries.
- Pricing policy: **never show prices or numbers** (no price ranges, no "starting from").
- Honest-claims policy: no invented metrics, clients or testimonials. Sections without real data stay hidden.
- AI goal: be discoverable/citable in ChatGPT, Google AI Overviews and similar engines (GEO). No on-site chat assistant.
- SEO is a priority and is currently weak (single URL, no separate EN URLs, `force-dynamic` home).

## Layout
- `src/app/page.tsx` — the single home page; reads DB content (projects/services/FAQ/testimonials/settings) with dictionary fallback; emits JSON-LD.
- `src/app/layout.tsx` — metadata, fonts, GA4 + Clarity, pre-paint script (data-js fail-open guard).
- `src/lib/i18n/dictionary.ts` — all bilingual copy (`ar` / `en`). `language-provider.tsx` stores locale in localStorage.
- `src/lib/site-config.ts` — domain, contact channels, socials.
- `src/components/site/*` — public sections; `src/components/admin/*` — admin panel UI; `src/components/ui/*` — shadcn.
- `src/app/api/leads` — public lead endpoint (zod, honeypot, DB rate limit, optional webhook).
- `src/app/api/admin/*` — admin CRUD; every route must call `requireAdmin()` (`src/lib/admin/auth.ts`).
- `public/sw.js` — PWA service worker.

## Commands
- `npm run typecheck` · `npm run lint` · `npm run build` (needs `DATABASE_URL`, `DIRECT_DATABASE_URL`, `ADMIN_SESSION_SECRET` ≥32 chars; dummy values are fine for a build).
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
