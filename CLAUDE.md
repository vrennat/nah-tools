# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is this

nah.tools — free, open-source browser tools that replace predatory SaaS. Tools include: QR code generator (static + dynamic), PDF tools (merge, split, compress, rotate, watermark, etc.), photo tools (compress, filters, background removal), link shortener with analytics, resume builder with ATS analysis, and data broker removal. Most tools run entirely client-side. Dynamic features (short links, dynamic QR redirects) use Cloudflare Workers + D1, passphrase-protected and editable.

## Commands

```bash
bun install              # install deps
bun run dev              # dev server (Vite)
bun run build            # production build (SvelteKit + Cloudflare adapter)
bun run check            # svelte-check (type checking)
bun run deploy           # build + wrangler deploy (main site to nah.tools)
bun run deploy:redirect  # deploy redirect worker (go.nah.tools)
bun run db:migrate:local # run D1 migrations locally
bun run db:migrate:prod  # run D1 migrations in production
```

## Stack

- **SvelteKit** (Svelte 5, runes mode) on **Cloudflare Workers** via `adapter-cloudflare`
- **Tailwind CSS v4** via Vite plugin (theme tokens in `src/app.css` under `@theme`)
- **Cloudflare D1** (SQLite) for dynamic QR code redirects
- **bun** as package manager
- No test framework configured yet

## Architecture

### Two Cloudflare Workers

1. **Main site** (`nah.tools/*`) — SvelteKit app, config in root `wrangler.jsonc`
2. **Redirect worker** (`go.nah.tools/*`) — minimal worker in `redirect-worker/`, does `/{short_code}` -> D1 lookup -> 302 redirect with fire-and-forget scan counting

Both share the same D1 database (`nah-tools-db`). The database ID in both `wrangler.jsonc` files must be replaced after `wrangler d1 create`.

### QR code generation (client-side only)

All in `src/lib/qr/` — must be dynamically imported (uses canvas/DOM, no SSR):
- `types.ts` — shared type definitions
- `encoder.ts` — converts structured data into QR-compatible strings
- `generator.ts` — wraps `qr-code-styling` for rendering
- `exporter.ts` — PNG, SVG, PDF (jsPDF), batch ZIP (JSZip)

### Server utilities

- `src/lib/server/db.ts` — D1 query helpers for dynamic redirect CRUD
- `src/lib/server/auth.ts` — bcryptjs passphrase hashing/verification

### API routes

- `POST /api/dynamic` — create dynamic QR code
- `PUT /api/dynamic` — update destination URL (passphrase-protected)
- `DELETE /api/dynamic` — deactivate code (passphrase-protected)
- `POST /api/dynamic/lookup` — verify passphrase and return code metadata
- `POST /api/links` — create short link (passphrase optional, Turnstile + rate limited)
- `PUT /api/links` — update destination URL (passphrase-protected)
- `DELETE /api/links` — deactivate link (passphrase-protected)
- `POST /api/links/lookup` — auth + metadata + click stats
- `POST /api/links/check-alias` — check custom alias availability
- `POST /api/links/bulk` — bulk create up to 100 links
- `POST /api/links/report` — report abusive link (auto-deactivates after 3 reports)
- `GET /sitemap.xml` — generated sitemap

### Pages

- `/` — tool picker landing page (links to all tools)
- `/qr` — QR code generator (all 7 types, live preview, style customization, download, batch, dynamic)
- `/qr/manage/[code]` — passphrase-protected dynamic QR management UI
- `/qr/wifi`, `/qr/vcard`, `/qr/email`, `/qr/phone`, `/qr/sms` — SEO/GEO landing pages with FAQPage schema
- `/links` — URL shortener / custom link creator with analytics, UTM builder, bulk creation
- `/links/manage/[code]` — passphrase-protected link management with click analytics dashboard
- `/why` — expose article about QR code industry
- `/compare` — competitor comparison table
- `/privacy`, `/terms` — legal pages

### Path aliases

Defined in `svelte.config.js`: `$components`, `$qr`, `$server`, `$utils`

### Schema.org / SEO

- `WebSite` schema in root layout
- `SoftwareApplication` schema on main page
- `FAQPage` schema on each landing page (via reusable `FAQSchema.svelte` component)
- Sitemap at `/sitemap.xml`, referenced in `robots.txt`

### Deployment

Manual via `bun run deploy` (main site) and `bun run deploy:redirect` (redirect worker). No CI/CD pipeline — deploy locally with Wrangler.

### Docs

Planning docs live in `docs/` — product spec, marketing strategy, engineering plan, legal, naming, expose outline, launch checklist, competitive positioning.

## Design Context

### Users
People who need a QR code and searched for "free QR code generator." They range from wedding planners and small restaurant owners to teachers and nonprofit volunteers. They are not technical — they want to paste a URL, get a code, and move on. Their context is often time-pressured (invitations already at the printer, event this weekend). The job: generate a QR code that works forever, download it, and never think about this tool again.

### Brand Personality
**Honest, practical, sharp.** Says what it means, does what it says, no fluff. The tone is friendly and approachable — "anyone can use this" — but never saccharine or try-hard. The name itself ("nah") sets the voice: casual refusal of industry BS, delivered with a shrug, not a megaphone.

### Aesthetic Direction
- **Visual tone:** Clean utility with warmth. Closer to Craigslist's function-first honesty than to a polished SaaS landing page, but with the craft and speed of Linear. The tool should feel fast and obvious, not designed.
- **References:** Linear (polished, fast, dark-mode craft), Hacker News / Craigslist (pure function, content-first, zero fluff).
- **Anti-references:** QR Code Generator Pro (cluttered, ads, dark patterns), generic SaaS landings (stock photos, gradient blobs, trust badges), over-designed portfolios (gratuitous animation, parallax, style over substance), enterprise dashboards (dense, overwhelming).
- **Theme:** Light + dark mode, user-selectable, respects system preference. Dark mode is first-class, not an afterthought.

### Color System
- **Accent:** `#3b82f6` (blue-500) — single accent color for CTAs and active states
- **Surfaces:** White/slate-50 (light), slate-900/800 (dark) — neutral, receding backgrounds
- **Text:** Slate-900 primary, slate-500 muted (light); slate-100 primary, slate-400 muted (dark)
- **Semantic:** Green for success, red for errors, amber for warnings — used sparingly and only for meaning
- **Typography:** Inter (sans), JetBrains Mono (code/data). Two fonts, no more.

### Design Principles

1. **Function over decoration.** Every element earns its place. No ornamental gradients, no illustration for illustration's sake, no animation that doesn't serve comprehension. If removing something doesn't hurt usability, remove it.

2. **Obvious over clever.** Labels say what things do. Buttons say what will happen. Inputs show what to type. No jargon, no tooltips needed, no hidden menus. A first-time user should never wonder "what does this do?"

3. **Fast over impressive.** Perceived speed matters more than visual polish. Prefer instant feedback, minimal layout shift, and lightweight interactions. No loading spinners where an optimistic update works. No splash screens. No transitions longer than 200ms.

4. **Generous with space, tight with words.** Ample whitespace and padding — never cramped. But text is concise: short labels, short descriptions, short error messages. The interface breathes, the copy doesn't ramble.

5. **Accessible by default.** Target WCAG AAA. High contrast ratios, visible focus indicators, full keyboard navigation, semantic HTML, screen reader support. Respect `prefers-reduced-motion` and `prefers-color-scheme`. Accessibility is not a feature — it's the baseline.
