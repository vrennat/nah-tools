# Building the definitive free QR code generator

A SvelteKit + Cloudflare Workers QR code generator can replicate **every meaningful feature** of tools charging $10–90/month — because the entire paid QR code industry is built on a single deception: conflating static QR codes (which are just encoded text and can never expire) with dynamic QR codes (which route through a company's server, creating vendor lock-in). Static code generation, custom colors, logo embedding, dot styles, SVG export, vCard/WiFi/email encoding — all of this runs 100% client-side. The only features genuinely requiring a server are dynamic URL redirects and scan analytics, which Cloudflare Workers + D1 can deliver for **$5/month at virtually any scale**. This report covers every technical decision, competitive insight, and launch strategy needed to build and ship this tool.

---

## The JavaScript library decision: qr-code-styling wins, but consider a hybrid

The library landscape splits cleanly between feature-rich options and lightweight Svelte-native packages. **qr-code-styling** (MIT license, ~2,700 GitHub stars, v1.9.2 released April 2025) is the only actively maintained library delivering the full customization stack: six dot styles (square, rounded, dots, classy, classy-rounded, extra-rounded), three corner square styles, corner dot styles, linear/radial gradients on any element, logo embedding with configurable size and margin, and export to SVG, PNG, JPEG, and WebP. Its bundle cost is **~29 KB gzipped** — reasonable for a tool where QR generation is the core feature.

The logo embedding system places an image at the QR code's center and removes dots behind it (`hideBackgroundDots: true`). The library defaults to **error correction level Q (25% recovery)**, which tolerates a logo covering up to ~20–25% of the code area. For printed QR codes or larger logos, manually setting level H (30% recovery) is recommended. The critical relationship: Level L recovers 7% of data, M recovers 15%, Q recovers 25%, H recovers 30%. A logo should never exceed 20–25% of the QR area at level H, and **10–15% is the safe target** for reliable scanning across all devices and conditions.

For SvelteKit integration, qr-code-styling requires a DOM and must be loaded via dynamic `import()` inside `onMount()` to avoid SSR failures. A cleaner alternative exists: **@svelte-put/qr** by vnphanquang, built on Rich Harris's `headless-qr`, is SSR-aware out of the box, supports logo embedding, square/circle shapes, and weighs only **~3–4 KB gzipped**. A second option, **Castlenine/svelte-qrcode**, offers zero dependencies, SVG output, logo support, and Svelte 5 runes compatibility.

The optimal architecture is a **hybrid approach**: use qr-code-styling for the premium customization panel (gradients, six dot styles, multiple corner styles) loaded lazily on the client, and @svelte-put/qr or svelte-qrcode for the initial server-rendered preview and basic generation. This delivers instant first paint with full customization available once JavaScript hydrates.

Libraries to avoid: **qrcodejs** is abandoned since 2015 with 316+ open issues. **node-qrcode** (npm: `qrcode`, 8K stars, 9.4M weekly downloads) has no styling or logo support — only useful for plain QR codes. **qrious** and **awesome-qr** are both deprecated. **@qr-platform/qr-code.js** has a proprietary license and 1.79 MB unpacked size.

| Library | Gzipped size | Logo support | Dot styles | SVG export | Svelte-native | Active |
|---------|-------------|-------------|-----------|-----------|--------------|--------|
| qr-code-styling | ~29 KB | ✅ Full | 6 types | ✅ | ❌ | ✅ v1.9.2 |
| @svelte-put/qr | ~3 KB | ✅ Basic | 2 types | ✅ | ✅ SSR-aware | ✅ |
| svelte-qrcode | ~2 KB | ✅ | 2 types | ✅ | ✅ Svelte 5 | ✅ |
| node-qrcode | ~25 KB | ❌ | ❌ | ✅ | ❌ | Slow |
| qrcodejs | ~4 KB | ❌ | ❌ | ❌ | ❌ | 🚫 Dead |

---

## What paid QR tools actually charge for — and what's trivially free

The paid QR code market runs on a systematic deception. **QR Code Generator Pro** (owned by Bitly) has **9,199 Trustpilot reviews averaging 1.5/5 stars** — the dominant complaint pattern is identical across platforms: user creates a "free" QR code, prints it on business cards or wedding invitations, the code stops working after a 14-day trial, and the company demands $120–190/year to reactivate it. The same pattern appears at QR.io, QRCodeCreator (4,005 Trustpilot reviews), and QRfy.

Here is the pricing landscape and what each tier actually delivers:

**QR Code Generator Pro** (Bitly): Starter at $9.99/month (billed annually at $119.88), Advanced at $15.99/month, Professional at $46.99/month. The Starter plan includes just 2 dynamic QR codes and 10,000 scans. Annual billing is mandatory on Advanced and Professional tiers. The site displays monthly prices but charges the full year upfront.

**Flowcode** (raised $30M+ from T. Rowe Price, NBA Equity, etc.): Free tier allows 2–3 codes with 500 scans. Pro at $5–15/month, Pro Plus at $25–60/month, Growth at $250/month. Their differentiation is Flowcode TV (broadcast QR attribution), enterprise analytics, and CRM integrations with Salesforce, HubSpot, and Snowflake. Every scan routes through Flowcode's servers — they offer no static codes at all.

**Uniqode** (formerly Beaconstac): Starter at $5/month for 3 dynamic codes, Lite at $15/month for 50 codes, Pro at $49/month for 250 codes. Differentiators include Smart Rules (condition-based redirects by time, country, or device), age-gating, multilingual QR codes, and SOC 2 Type 2 / HIPAA / ISO 27001 compliance.

**QR Tiger**: The most feature-rich with 31 QR code types. Free tier: 3 dynamic codes with 500 scans each, QR Tiger logo popup on every scan. Regular at $7/month, Advanced at $16/month, Premium at $37/month.

The critical insight is the **client-side versus server-side feature classification**. Every feature below the line can be implemented entirely in the browser with zero server cost:

**Trivially client-side** (zero server needed): QR code generation for all types (URL, vCard, WiFi, email, SMS, phone, text, geo, calendar, crypto), custom colors and gradients, dot/corner style customization, logo embedding, SVG/PNG/PDF export at any resolution, batch generation from CSV, template saving to localStorage, custom frames and borders, error correction level selection, and vCard/WiFi/email data format encoding.

**Genuinely server-required**: Dynamic QR codes (editable URL after printing), scan analytics, GPS/geolocation tracking, retargeting pixels, smart multi-URL routing (by device/location/time), QR code expiry enforcement, CRM integrations, team collaboration, white-label custom domains, API access, and compliance certifications.

**Artificially gated** (trivial but paywalled): Watermark removal, high-resolution exports, SVG/vector downloads, more than X codes per day, "ads-free" QR codes (ads appear during dynamic redirect), and design editing after creation.

The business model insight: **the entire industry monetizes by making dynamic codes the default without explaining that a static code would serve most users permanently for free**. A static QR code encodes the destination URL directly into the pattern — it physically cannot expire or be deactivated by anyone. A dynamic code encodes a short redirect URL owned by the QR company, creating permanent dependency.

---

## Cloudflare Workers + D1 architecture for dynamic QR codes at $5/month

The redirect service is architecturally simple: a Cloudflare Worker receives a request to `go.yourdomain.com/abc123`, queries D1 for the destination URL, increments a scan counter, and returns a **302 (temporary) redirect**. The 302 status code is essential — 301 (permanent) would cause browsers to cache the redirect, breaking both editability and analytics. Every paid QR service uses 302 for this reason.

**Recommended D1 schema:**

```sql
CREATE TABLE redirects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  short_code TEXT NOT NULL UNIQUE,
  destination_url TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  scan_count INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  label TEXT,
  expires_at TEXT
);
CREATE INDEX idx_redirects_short_code ON redirects(short_code);
```

The Worker handler is approximately 20 lines: extract the short code from the path, query D1 with a prepared statement, return 404 if not found or inactive, fire-and-forget the scan count increment via `ctx.waitUntil()`, and return `Response.redirect(destination_url, 302)`. The scan counter uses a non-blocking `UPDATE redirects SET scan_count = scan_count + 1` inside `waitUntil()` so it adds zero latency to the redirect response.

For time-series analytics without storing any PII, use **Workers Analytics Engine** (included free with the $5/month Workers paid plan). Write a data point per scan containing only the short_code and the date (YYYY-MM-DD) — no IP address, no User-Agent, no geolocation, no cookies. This is GDPR/CCPA compliant by design since no personal data is ever collected. Query daily scan counts with SQL: `SELECT blob1 AS date, SUM(double1) AS scans FROM analytics WHERE index1 = 'abc123' GROUP BY blob1`.

**Redirect latency** on Cloudflare Workers is exceptional: Workers run on 330+ edge locations with no cold starts. The Worker execution takes <1ms of CPU time, the D1 indexed lookup takes 1–5ms, and the total server-side processing is **2–10ms**. End-to-end latency including network transit is typically 20–100ms depending on proximity to the nearest edge PoP. D1 Read Replication (public beta since April 2025) creates read replicas across regions, further reducing query latency.

**Cost analysis for 10,000 dynamic QR codes with 1M scans/month:**

| Component | Usage | Cost |
|-----------|-------|------|
| Workers paid plan (base) | — | $5.00 |
| Worker requests (1M) | Within 10M included | $0.00 |
| D1 reads (1M lookups) | Within 25B included | $0.00 |
| D1 writes (1M counter updates) | Within 50M included | $0.00 |
| D1 storage (10K rows ≈ <1 MB) | Within 5 GB included | $0.00 |
| Analytics Engine writes | Included | $0.00 |
| **Total** | | **$5.00/month** |

Even at **10M scans/month**, every component stays within the included allocations. The total remains $5/month. Compare this to Uniqode Pro at $49/month for 250 dynamic codes, or QR Code Generator Pro at $46.99/month for 250 codes — the self-hosted solution provides **unlimited codes and unlimited scans** at a fraction of the cost.

**Domain strategy**: Use a **subdomain** (`go.yourdomain.com/abc123`) rather than a path prefix on the main domain. This provides clean routing isolation — the redirect Worker runs independently from the SvelteKit app. Configure it as a separate Worker with a Cloudflare Custom Domain. The shorter URL also produces a less dense (more scannable) QR code pattern.

**Abuse prevention** requires four layers: (1) require authentication through the SvelteKit app to create dynamic codes — the redirect endpoint is read-only; (2) validate destination URLs against the Google Safe Browsing API and reject suspicious patterns like `javascript:` URIs; (3) use Cloudflare WAF Rate Limiting Rules to cap creation at 10 per hour per IP and redirect requests at 100 per minute per IP; (4) generate 8+ character alphanumeric short codes using `crypto.randomUUID()` to make enumeration impractical (~218 trillion combinations). The `is_active` column enables instant deactivation of any abused redirect.

---

## QR code data formats: the complete encoding reference

Every QR code "type" is simply a text string following a specific format convention. Scanners (phone cameras, dedicated apps) parse these strings and trigger appropriate actions. Here are the formats that matter, ordered by usage frequency among small businesses:

**URL** (60%+ of all QR codes): Simply encode `https://www.example.com/page`. Always include the protocol prefix. Using ALL UPPERCASE characters can reduce QR density due to alphanumeric encoding mode optimization. Keep under 500 characters for reliable print scanning.

**WiFi** (#2 in demand — restaurants, hotels, Airbnb): `WIFI:T:WPA;S:NetworkName;P:Password123;H:false;;` — the `T:` field accepts WPA (for WPA/WPA2), WEP, SAE (WPA3), or `nopass` for open networks. The trailing `;;` is required. Semicolons, colons, and backslashes within values must be escaped with `\`. Supported natively by Android 10+ and iOS 11+ cameras.

**vCard** (#3 — networking, digital business cards): Use **vCard 3.0** (not 4.0) for maximum scanner compatibility across iPhone, Android, Outlook, and Gmail. The format is `BEGIN:VCARD\nVERSION:3.0\nN:LastName;FirstName;;;\nFN:Full Name\nTEL;TYPE=CELL:+12125551212\nEMAIL:name@example.com\nEND:VCARD`. The `N` field uses the format `LastName;FirstName;MiddleName;Prefix;Suffix`. Avoid embedding photos as base64 — it adds 10,000–30,000 characters, making the QR code unscannable. Keep vCards under **300 characters** for business card printing, under 150 for guaranteed scannability.

**Email**: `mailto:someone@example.com?subject=Hello%20World&body=Message%20text&cc=other@example.com`. Standard RFC 6068 mailto URI with URL-encoded parameters.

**SMS**: `SMSTO:+18005551212:Pre-filled message text` is the most widely supported format. iOS also accepts `sms:+18005551212&body=Message%20text`.

**Phone**: `tel:+12125551212` — always use international format with country code. Opens the phone dialer without auto-calling.

**Geo location**: `geo:40.71872,-73.98905` per RFC 5870. Works natively on Android. For universal compatibility, use `https://maps.google.com/?q=40.71872,-73.98905` instead.

**Calendar event**: `BEGIN:VEVENT\nSUMMARY:Meeting\nDTSTART:20260415T140000Z\nDTEND:20260415T150000Z\nLOCATION:Room B\nEND:VEVENT` per RFC 5545. Android scanners handle this well; iOS support is inconsistent — linking to a .ics file URL is more reliable for Apple devices.

**Bitcoin**: `bitcoin:1A1zP1eP...?amount=0.05&label=Donation` per BIP 21. All major wallet apps support this URI scheme.

**Social media and app store links**: No special format — just URLs. For cross-platform app downloads, use a server-side redirect that detects iOS vs. Android and routes to the appropriate store.

All of these formats are **trivially encodable client-side**. The QR generator simply constructs the appropriate string from form inputs and passes it to the QR library. No server involvement whatsoever.

---

## The $100M/year scam and how to expose it

The exposé article has extraordinary viral potential because no publication has yet connected the dots across the entire industry. Individual complaints exist in isolation on Trustpilot, Sitejabber, Reddit, and Product Hunt, but **no one has aggregated the evidence into a single investigative piece**. The data is devastating: QR Code Generator Pro alone has 9,199 Trustpilot reviews at 1.5/5 stars and 350 Sitejabber reviews at 1.2/5 stars. QRCodeCreator has 4,005 Trustpilot reviews following the identical complaint pattern. QR.io's Product Hunt page is dominated by scam reports.

The pattern is uniform across every offender: user searches "free QR code generator," arrives at the site, creates a dynamic code during a 14-day trial, prints it on physical materials (business cards, wedding invitations, restaurant menus, trade show banners), the trial expires, the QR code stops working entirely, and the company demands $120–190/year for reactivation. The user's physical materials are held hostage. Multiple victims describe wedding RSVPs, nonprofit fundraiser materials, and teacher classroom resources being rendered useless.

The technical explanation is the article's structural backbone: a static QR code embeds the destination URL directly into its pixel pattern — it is literally the data, and it can never expire or be controlled by anyone. A dynamic QR code embeds a redirect URL owned by the QR company (`qr.company.com/xyz789`), which the company can deactivate at will. **Every predatory QR company creates dynamic codes by default without educating users that a static code would serve them permanently for free.** This is the core deception.

Key fact for the exposé: **QR Code Monkey, the most-recommended "free" QR tool on Reddit, is owned by the same company** (Egoditor/Bitly Europe) that operates QR Code Generator Pro — the worst-rated QR service on the internet. QR Code Monkey serves as a free feeder tool that funnels users toward paid dynamic codes.

The strongest article framing would pair the investigation with the free tool announcement: "QR Code Generators Are Running an Industry-Wide Scam — Here's How It Works (and a Free Alternative)." This two-part structure — exposé plus solution — is the format most likely to reach Hacker News's front page and gain traction across Reddit communities.

---

## SEO and launch strategy to capture a massive search market

The keyword "QR code generator" drives extraordinary search volume — qr-code-generator.com alone receives **8.61M monthly visits**. Combined search demand for QR code generation queries likely exceeds **5–10 million searches per month globally**. The critical gap: **no open-source, truly free, transparent tool ranks on Google's first page**. The SERP is dominated by predatory subscription tools (QR Code Generator Pro, QRCodeCreator) and platform features (Canva, Adobe Express).

The highest-value keyword targets in descending priority: "free QR code generator" (massive volume, high intent), "QR code generator no sign up" (high conversion intent), "QR code generator no expiration" (directly addresses the #1 pain point), "open source QR code generator" (low competition, perfect audience), "QR code generator SVG" (developer-focused, underserved), and "[competitor name] alternative free" long-tail variations.

The launch sequence should cascade across platforms over 7 days:

**Day 1 (Tuesday)**: Product Hunt launch at 12:01 AM PT with tagline "Free, open-source QR code generator. No signup. No expiration. No BS." Simultaneously post to Hacker News as either `Show HN: [Name] – Open-source QR code generator with no signup or expiration` (link to GitHub) or the higher-potential exposé format linking to the article. The qrframe project achieved **401 points and 79 comments** on HN — proof that QR tools resonate with the community.

**Days 1–3**: Post to r/smallbusiness (1.7M members — QR code complaints surface weekly), r/selfhosted (400K members — eager for self-hosted alternatives), r/webdev (2M members), r/opensource. The r/smallbusiness post titled "Don't order a QR Code from qr-code-generator.com" from 2021 received **230+ comments** and is still getting new replies — proving sustained demand.

**Days 3–7**: Publish technical deep-dive on Dev.to/Hashnode, post PSA to r/weddingplanning (wedding QR code victims are extremely vocal), post to r/restaurantowners (QR menus are post-COVID standard), submit to awesome-selfhosted and Alternative.to listings, and launch a Twitter/X thread in the #buildinpublic community.

**Ongoing SEO**: Target long-tail keywords with tutorial content — "How to make a QR code that doesn't expire," "Free vCard QR code generator," "QR code generator for restaurant menu." Build comparison pages for "[Brand] alternative" keywords.

---

## Design and UX that feels premium without dark patterns

The tool should use a **single-page, two-column layout** on desktop: the left column (60% width) holds the QR type selector tabs, content input form, and collapsible customization accordion panels; the right column (40%) holds a sticky live preview card, quality slider, and download buttons. This pattern outperforms step-by-step wizards because QR generation is a low-complexity, high-frequency task where speed matters most.

The **QR type selector** should be a horizontal tab bar showing the 8–10 most common types (URL, Text, Email, Phone, SMS, vCard, WiFi, Event) with a "More" overflow for less common types. Tabs are superior to dropdowns because they show all options at a glance and reduce clicks. The content input area should present contextual form fields that adapt based on the selected type — URL gets a single URL input, vCard gets name/phone/email/company fields, WiFi gets SSID/password/encryption fields.

Customization controls should be organized into collapsible accordion sections: **Colors** (foreground/background pickers, gradient toggle), **Logo** (upload area plus gallery of common social icons), **Shape/Style** (visual icon grid for body shapes, eye frames, eye balls — not dropdowns), and **Advanced** (error correction level, quiet zone). Shape and style selectors must render as visual icon grids with **48px minimum tap targets** for touch accessibility.

The live preview should leverage **Svelte 5's `$derived` state** for reactive QR regeneration. Color changes and shape selections should update immediately (0ms). Text input fields should debounce at 150–200ms using a `$effect` cleanup timeout pattern. The preview renders as SVG (resolution-independent, crisp at any size) and stays sticky-positioned on desktop. On mobile, the preview sits between the input and customization sections, with a floating action button (download icon) appearing at bottom-right when the user scrolls past it.

**Download must be one click** — no modal, no email gate, no signup wall. This is the single most important UX differentiator. The primary button downloads PNG at 1024×1024px (print-quality default), with secondary links for SVG and PDF. On mobile, also offer `navigator.share()` via the Web Share API for direct sharing to WhatsApp, iMessage, and other apps.

The visual design should use a **white or very light gray background** (#FAFBFC), near-black text (#111827), and a single trust-signaling accent color — **deep blue (#2563EB)** conveys professionalism and tech credibility (used by Linear and Vercel). Typography should use Inter or Geist at two weights maximum (Regular + Semibold) on an 8px spacing grid. Premium feel comes from generous white space, consistent spacing, subtle shadows (`box-shadow: 0 1px 3px rgba(0,0,0,0.1)`), and smooth 150ms transitions. Cheap feel comes from cramped layouts, clashing colors, ads, and aggressive CTAs — avoid all of these.

Trust signals should be woven throughout: a privacy badge near the preview ("🔒 100% browser-based. Your data never leaves your device."), an open-source badge with live GitHub star count, an explicit "No signup needed" header, and a "Works offline" claim that users can verify by disconnecting their internet. Below the fold, include a brief "How it works" visual (3 steps: enter content → customize → download) and an optional comparison table showing the tool versus paid alternatives across key dimensions (free ✅, SVG export ✅, no signup ✅, open source ✅, works offline ✅).

Accessibility requires WCAG 2.1 AA compliance: minimum 3:1 contrast ratio for the QR code preview (with an inline warning if the user selects low-contrast colors), full keyboard navigation with visible focus indicators on all controls, proper ARIA labels (`role="tablist"` for type selector, `aria-expanded` for accordion sections, `aria-live="polite"` for preview updates), 44×44px minimum touch targets, `prefers-reduced-motion` and `prefers-color-scheme` respect, and a text alternative showing the encoded content below the QR code for screen reader users.

---

## Competitive gaps this tool should exploit

Every existing free QR generator has exploitable weaknesses. **QR Code Monkey** offers the best free customization but is owned by Bitly (the same company running the subscription scam), limits free users to ~5 codes/day and 500px resolution, and injects interstitial ads between generation and download. **GoQR.me** is clean and honest but has a dated design, minimal customization, and no modern framework benefits. **QR Tiger's free tier** shows a QR Tiger logo popup on every scan and caps at 500 scans per code without clear disclosure. On GitHub, **devxhub/qr-code-generator** is a full SvelteKit 5 + Tailwind app with multiple QR types and 100% client-side generation, and **lyqht/mini-qr** offers PWA support and batch CSV export — both provide useful reference implementations but lack polish and comprehensive QR type support.

The competitive advantages available to a well-executed new tool are concrete and significant: unlimited free static codes with zero expiration, full visual customization (colors, gradients, dot styles, logos) without any account, SVG export included free (most competitors gate vector formats behind paid tiers), all QR content types (URL, vCard, WiFi, email, SMS, phone, geo, calendar, crypto) without paywalls, 100% client-side generation with verifiable privacy, modern responsive design with offline capability, and an optional dynamic QR service at $5/month that beats $15–99/month paid alternatives.

## Conclusion

The QR code generator market is a **$13 billion industry growing 17% annually**, yet it is dominated by tools that exploit user confusion between static and dynamic codes to extract recurring subscription revenue from small businesses, educators, and individuals. The technical barrier to disruption is remarkably low: every "premium" visual feature runs client-side, and the only genuinely server-dependent feature (dynamic URL redirects) costs $5/month on Cloudflare's edge infrastructure. The combination of qr-code-styling's rich customization API, SvelteKit's reactive preview system, Workers + D1's $5/month dynamic redirect architecture, and an exposé article aggregating 13,000+ negative reviews across platforms creates a launch package with genuine viral potential. The market gap is clear — no open-source tool ranks on Google's first page for "free QR code generator" — and the narrative is powerful: a free tool that does everything the scammers charge $120/year for, with the code open on GitHub for anyone to verify.