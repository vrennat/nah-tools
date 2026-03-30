# Engineering Plan

## Architecture Overview

```
┌──────────────────────────────────────────────────┐
│                  User's Browser                   │
│                                                   │
│  ┌──────────────┐   ┌──────────────────────────┐ │
│  │  SvelteKit   │   │  qr-code-styling         │ │
│  │  UI + Routes │   │  (client-side only)      │ │
│  └──────────────┘   │  - QR generation         │ │
│                     │  - Customization          │ │
│                     │  - PNG/SVG/PDF export     │ │
│                     └──────────────────────────┘ │
└────────────────────────┬─────────────────────────┘
                         │ Only for dynamic codes
                         ▼
┌──────────────────────────────────────────────────┐
│           Cloudflare Workers ($5/mo)              │
│                                                   │
│  ┌────────────────┐   ┌────────────────────────┐ │
│  │ SvelteKit SSR  │   │  Redirect Worker       │ │
│  │ (prerendered   │   │  go.nah.tools/xyz     │ │
│  │  static pages) │   │  - D1 lookup           │ │
│  │                │   │  - 302 redirect        │ │
│  │ Dynamic code   │   │  - Scan counter        │ │
│  │ management API │   │    (zero PII)          │ │
│  └────────────────┘   └────────────────────────┘ │
│                                                   │
│  ┌────────────────┐   ┌────────────────────────┐ │
│  │ Cloudflare D1  │   │ Workers Analytics      │ │
│  │ (SQLite)       │   │ Engine (free)          │ │
│  │ - redirects    │   │ - daily scan counts    │ │
│  │ - passphrase   │   │ - no PII ever          │ │
│  │   hashes       │   │                        │ │
│  └────────────────┘   └────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

**Key principle:** Static QR code generation never touches the server. The entire customization UI, QR encoding, and file export happen in the browser. The server only exists for dynamic code redirects.

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | SvelteKit + Svelte 5 | Compiles away, runes for reactivity, adapter-cloudflare |
| Styling | Tailwind CSS 4 | Utility-first, tree-shakes, fast iteration |
| QR Library | qr-code-styling (lazy) + @svelte-put/qr (SSR fallback) | Full customization + SSR safety |
| Deployment | Cloudflare Workers via adapter-cloudflare | $5/mo, unlimited static, 10M dynamic |
| Database | Cloudflare D1 | Included in $5/mo, SQLite, 25B reads |
| Analytics | Cloudflare Web Analytics + Workers Analytics Engine | Free, privacy-respecting |
| Package Manager | Bun | Fast installs, native bundling |
| CI/CD | GitHub Actions | Push to main = deploy |

---

## Project Structure

```
nah-tools/
├── src/
│   ├── routes/
│   │   ├── +page.svelte              # Main QR generator
│   │   ├── +page.ts                  # prerender = true
│   │   ├── +layout.svelte            # Global layout
│   │   ├── wifi/+page.svelte         # WiFi QR landing (SEO)
│   │   ├── vcard/+page.svelte        # vCard QR landing (SEO)
│   │   ├── why/+page.svelte          # Exposé article (prerendered)
│   │   ├── compare/+page.svelte      # Competitor comparison
│   │   ├── dynamic/
│   │   │   ├── +page.svelte          # Create dynamic code UI
│   │   │   └── +page.server.ts       # POST handler
│   │   ├── manage/[code]/
│   │   │   ├── +page.svelte          # Manage dynamic code
│   │   │   └── +page.server.ts       # Passphrase verify + update
│   │   ├── api/dynamic/+server.ts    # REST API for dynamic CRUD
│   │   ├── privacy/+page.svelte      # Privacy policy
│   │   └── terms/+page.svelte        # Terms of service
│   ├── lib/
│   │   ├── components/
│   │   │   ├── QRPreview.svelte      # Live QR preview (reactive)
│   │   │   ├── TypeSelector.svelte   # Tab bar for QR types
│   │   │   ├── ColorPicker.svelte    # FG/BG color pickers
│   │   │   ├── StyleGrid.svelte      # Dot/corner style visual grid
│   │   │   ├── LogoUploader.svelte   # Logo upload + preset gallery
│   │   │   ├── DownloadBar.svelte    # PNG/SVG/PDF buttons
│   │   │   ├── DynamicForm.svelte    # Dynamic code creation
│   │   │   └── InputForms/
│   │   │       ├── URLInput.svelte
│   │   │       ├── WiFiInput.svelte
│   │   │       ├── VCardInput.svelte
│   │   │       ├── EmailInput.svelte
│   │   │       ├── SMSInput.svelte
│   │   │       ├── PhoneInput.svelte
│   │   │       ├── TextInput.svelte
│   │   │       └── EventInput.svelte
│   │   ├── qr/
│   │   │   ├── encoder.ts            # Data string builders
│   │   │   ├── generator.ts          # qr-code-styling wrapper
│   │   │   ├── exporter.ts           # PNG/SVG/PDF export
│   │   │   └── types.ts             # TypeScript types
│   │   ├── server/
│   │   │   ├── db.ts                 # D1 query helpers
│   │   │   └── auth.ts              # Passphrase hash/verify
│   │   └── utils/
│   │       ├── debounce.ts
│   │       └── share.ts             # Web Share API wrapper
│   ├── app.d.ts                      # Platform types
│   ├── app.html
│   └── app.css                       # Tailwind directives
├── redirect-worker/                  # Separate go.nah.tools Worker
│   ├── src/index.ts
│   └── wrangler.jsonc
├── migrations/
│   └── 0001_create_redirects.sql
├── static/
│   ├── favicon.svg
│   ├── robots.txt
│   ├── manifest.json                 # PWA
│   └── og-image.png
├── svelte.config.js
├── wrangler.jsonc
├── tailwind.config.js
├── package.json
├── .github/workflows/deploy.yml
└── README.md
```

---

## Database Schema

```sql
-- migrations/0001_create_redirects.sql

CREATE TABLE redirects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  short_code TEXT NOT NULL UNIQUE,
  destination_url TEXT NOT NULL,
  label TEXT,
  passphrase_hash TEXT NOT NULL,
  scan_count INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT
);

CREATE INDEX idx_short_code ON redirects(short_code);
CREATE INDEX idx_is_active ON redirects(is_active);
```

Short codes: 8-char alphanumeric via `crypto.randomUUID().slice(0, 8)`. ~2.8 trillion combinations — enumeration-proof.

---

## Redirect Worker

```typescript
// redirect-worker/src/index.ts
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const code = url.pathname.slice(1);

    if (!code || code.length < 6) {
      return Response.redirect('https://nah.tools', 302);
    }

    const row = await env.DB.prepare(
      'SELECT destination_url, is_active FROM redirects WHERE short_code = ?'
    ).bind(code).first();

    if (!row || !row.is_active) {
      return new Response('QR code not found or deactivated.', { status: 404 });
    }

    // Fire-and-forget scan counter
    ctx.waitUntil(
      env.DB.prepare(
        'UPDATE redirects SET scan_count = scan_count + 1 WHERE short_code = ?'
      ).bind(code).run()
    );

    return Response.redirect(row.destination_url as string, 302);
  }
};
```

Separate Worker on `go.nah.tools`, own wrangler config, same D1 binding.

---

## QR Data Encoders

```typescript
// src/lib/qr/encoder.ts

export function encodeWiFi(ssid: string, password: string, encryption: 'WPA' | 'WEP' | 'nopass'): string {
  const esc = (s: string) => s.replace(/([\\;,:"'])/g, '\\$1');
  return `WIFI:T:${encryption};S:${esc(ssid)};P:${esc(password)};;`;
}

export function encodeVCard(d: VCardData): string {
  const lines = ['BEGIN:VCARD', 'VERSION:3.0', `N:${d.lastName};${d.firstName};;;`, `FN:${d.firstName} ${d.lastName}`];
  if (d.phone) lines.push(`TEL;TYPE=CELL:${d.phone}`);
  if (d.email) lines.push(`EMAIL:${d.email}`);
  if (d.org) lines.push(`ORG:${d.org}`);
  if (d.title) lines.push(`TITLE:${d.title}`);
  if (d.url) lines.push(`URL:${d.url}`);
  lines.push('END:VCARD');
  return lines.join('\n');
}

export function encodeEmail(to: string, subject?: string, body?: string): string {
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);
  return `mailto:${to}${params.toString() ? '?' + params : ''}`;
}

export function encodeSMS(phone: string, message?: string): string {
  return `SMSTO:${phone}${message ? ':' + message : ''}`;
}

export function encodePhone(phone: string): string { return `tel:${phone}`; }
export function encodeGeo(lat: number, lng: number): string { return `geo:${lat},${lng}`; }
```

---

## Sprint Plan

### Sprint 1: Core Generator (Days 1–5)
Working QR generator with URL input, basic customization, PNG/SVG download.

- [ ] Scaffold project: `bunx create-cloudflare`
- [ ] Configure wrangler.jsonc, svelte.config.js, app.d.ts
- [ ] Set up Tailwind CSS 4
- [ ] Layout component (header, footer)
- [ ] TypeSelector (horizontal tabs)
- [ ] URLInput with validation
- [ ] QRPreview with qr-code-styling via dynamic import
- [ ] Live preview with 150ms debounced reactivity
- [ ] ColorPicker (foreground + background)
- [ ] StyleGrid (dot styles, corner styles as visual icons)
- [ ] DownloadBar (PNG 1024px, SVG — one click, no gate)
- [ ] Prerender config on all static routes
- [ ] Mobile/tablet/desktop testing

### Sprint 2: All QR Types + Polish (Days 6–9)
Every QR type, logo embedding, PDF export, responsive polish.

- [ ] All input form components (WiFi, vCard, Email, SMS, Phone, Text)
- [ ] All encoder functions
- [ ] LogoUploader (file upload + preset social icons)
- [ ] Error correction level selector
- [ ] Gradient support for foreground colors (linear/radial)
- [ ] PDF export via jsPDF (lazy loaded)
- [ ] Batch generation: CSV upload → ZIP of QR codes (client-side via JSZip)
- [ ] Web Share API on mobile
- [ ] Responsive layout polish
- [ ] Accessibility: keyboard nav, ARIA, focus indicators, contrast warnings
- [ ] Service worker / PWA
- [ ] Privacy badge in UI

### Sprint 3: Dynamic Codes (Days 10–13)
Dynamic QR creation, passphrase management, redirect Worker.

- [ ] Create D1 database: `bunx wrangler d1 create nah-tools-db` + run migration
- [ ] Build + deploy redirect Worker on go.nah.tools
- [ ] DynamicForm component
- [ ] POST /api/dynamic endpoint
- [ ] /manage/[code] page + server handler
- [ ] Rate limiting (Cloudflare WAF: 10 creates/hour/IP)
- [ ] URL validation (reject javascript:, data:, file:)
- [ ] Success UX: show QR, management URL, passphrase warning
- [ ] Test redirect latency (<50ms)

### Sprint 4: Content + Launch Prep (Days 14–17)
Exposé article, SEO, comparison page, legal pages, deploy.

- [ ] Write /why exposé article
- [ ] Build /compare competitor comparison
- [ ] Landing pages: /wifi, /vcard with targeted meta
- [ ] /privacy and /terms pages
- [ ] OG image (1200x630)
- [ ] Schema.org JSON-LD structured data (GEO-critical, see details below)
  - `SoftwareApplication` on main page: name, description, offers:{price:"0"}, operatingSystem:"Any", applicationCategory:"Utility", aggregateRating (once available)
  - `FAQPage` on each QR type landing page (/wifi, /vcard, /email, /sms, /phone): 3–5 real Q&As per page (e.g., "Is this WiFi QR code generator free?" / "How do I create a QR code for my WiFi password?")
  - `HowTo` on tutorial/landing pages: step-by-step with name, text, and optional image per step
  - `Article` on /why exposé: headline, author, datePublished, publisher, image
  - `WebSite` with SearchAction on root layout (enables sitelinks search in AI/search results)
  - Validate all schemas via Google Rich Results Test before deploy
- [ ] robots.txt + sitemap.xml
- [ ] Cloudflare Web Analytics setup
- [ ] Cross-browser testing
- [ ] GitHub repo: README (GEO-optimized, see below), LICENSE, CONTRIBUTING
  - README must function as a product page: first paragraph contains "free QR code generator," "no signup," "no expiration," "open source" naturally
  - Include feature comparison table (vs. paid competitors) directly in README
  - Add badges: license, deploy status, website link
  - Repo description: "Free, open-source QR code generator. No signup, no expiration, no catch."
  - Repo topics: qr-code, qr-code-generator, free, open-source, no-signup, svelte, cloudflare-workers
- [ ] GitHub Actions deploy workflow
- [ ] Production deploy + smoke test

### Sprint 5: Launch (Day 18)
Execute Day 1 launch sequence. Monitor. Fix bugs.

---

## Key Technical Decisions

**qr-code-styling SSR workaround:** Dynamic import inside `onMount()`. Use @svelte-put/qr for SSR-rendered fallback preview before hydration.

**Passphrase hashing:** `bcryptjs` (pure JS, Workers-compatible). Cost factor 10.

**PDF export:** jsPDF with SVG embedding, lazy-loaded on click.

**Error correction auto-selection:** Default M (15%). Auto-switch to Q (25%) when logo detected.

**Offline / PWA:** Service worker precaches app shell. Full offline functionality since all generation is client-side.

---

## Cost Model at Scale

**Cloudflare Workers Paid Plan: $5/month base**
- 10M requests/month included, then $0.30/million
- D1: 25B reads/month included, 50M writes/month included, 5GB storage included
- D1 overages: $0.001/million reads, $1.00/million writes, $0.75/GB-mo

**Static QR codes cost us literally nothing** — all client-side, just static asset serving (free on Cloudflare).

**Dynamic codes are the cost driver.** Each dynamic code creation = 1 D1 write. Each scan = 1 Worker request + 1 D1 read + 1 D1 write (scan counter).

| Scale | Site Visits/mo | Dynamic Creates/mo | Scans/mo | Monthly Cost | Notes |
|-------|---------------|-------------------|----------|-------------|-------|
| Early | 30K | 1K | 5K | **$5.00** | Well within free tier |
| Growing | 300K | 10K | 50K | **$5.00** | Still within included |
| Popular | 3M | 100K | 500K | **$5.00** | Still within included |
| Viral | 30M | 1M | 5M | **$5.90** | 25M extra reqs × $0.30/M |
| Massive | 100M | 5M | 50M | **$19.00** | 90M extra reqs, 5M writes ($5) |
| Absurd | 300M | 10M | 200M | **$72.00** | 290M extra reqs, D1 writes add up |

**The risk scenario:** If nah.tools goes truly viral (100M+ requests/month), costs stay under $20/month. Even the absurd scenario — larger than most indie tools will ever get — is $72/month. That's easily coverable by GitHub Sponsors or Ko-fi donations.

**The real cost ceiling is D1 writes**, not requests. Each scan increments a counter (1 write). At 200M scans/month, that's 200M writes = 150M over the 50M included = $150/month. This is the only scenario where costs become non-trivial.

**Mitigation if needed:** Batch scan counter updates (aggregate in Workers KV or Durable Objects, flush to D1 every N minutes instead of per-scan). This would reduce D1 writes by 99%+ and keep costs under $10/month even at massive scale.

**Decision: Free forever, donations only.** GitHub Sponsors and/or Ko-fi. Domain costs $28.20/year. Infrastructure stays under $10/month for any realistic scale. Total annual cost projection: ~$150/year. Even 10 sponsors at $5/month covers it with room to spare.

---

## Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | <1.0s |
| Largest Contentful Paint | <1.5s |
| Time to Interactive | <2.0s |
| QR generation latency | <50ms |
| Redirect latency (server) | <50ms |
| Initial bundle | <80KB gzipped |
| With QR lib (lazy) | <120KB gzipped |
| Lighthouse score | 95+ |

---

## Security

1. **Rate limiting**: Cloudflare WAF — 10 dynamic creates/hour/IP
2. **Passphrase**: bcrypt, cost 10, constant-time compare
3. **XSS**: URLs never rendered as HTML. SvelteKit default escaping.
4. **Open redirect**: Redirect Worker only serves D1-stored URLs, no query params
5. **Abuse prevention**: Cloudflare Turnstile (free CAPTCHA) if needed post-launch
6. **DDoS**: Cloudflare built-in protection, all tiers
