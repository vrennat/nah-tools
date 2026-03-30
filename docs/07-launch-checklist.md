# Launch Checklist & Timeline

## Overview

**Target timeline**: 18 working days from start to launch
**Working assumption**: 4–6 hours/day of focused building time

```
Week 1 (Days 1-5):   Core QR generator — generate, customize, download
Week 2 (Days 6-9):   All QR types, logo embedding, polish
Week 2-3 (Days 10-13): Dynamic codes + redirect Worker
Week 3 (Days 14-17):  Content, SEO, legal, deploy
Day 18:               LAUNCH
```

---

## Pre-Build Checklist

### Domain & Infrastructure
- [x] **Choose a name**: nah.tools ✅
- [x] **Register domain** via Cloudflare Registrar ($28.20/yr) ✅
- [ ] **Set up Cloudflare account** on the $5/month Workers paid plan
- [ ] **Create GitHub repo** (private during development, public at launch)
- [ ] **Set up go.nah.tools subdomain** for dynamic code redirects
- [ ] **Create D1 database**: `bunx wrangler d1 create nah-tools-db`
- [ ] **Configure GitHub Secrets**: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID

### Development Environment
- [ ] Install Bun (latest)
- [ ] Scaffold project: `bunx create-cloudflare@latest nah-tools -- --framework=svelte`
- [ ] Configure wrangler.jsonc per project template
- [ ] Configure svelte.config.js with adapter-cloudflare
- [ ] Set up Tailwind CSS 4
- [ ] Verify local dev works: `bun run dev`
- [ ] Verify Wrangler dev works: `bun run build && bunx wrangler dev`

---

## Sprint 1 Checklist: Core Generator (Days 1–5)

### Layout & Navigation
- [ ] Global layout component (+layout.svelte)
- [ ] Header: logo/name + minimal nav (Generator | Why Free | GitHub)
- [ ] Footer: privacy policy, terms, "open source" badge, GitHub link
- [ ] Responsive: works on 320px–1440px+
- [ ] Set prerender = true on landing page

### QR Type Selection
- [ ] TypeSelector component: horizontal tabs
- [ ] Types for v1: URL, Text, WiFi, vCard, Email, Phone, SMS
- [ ] Active tab styling, keyboard navigable
- [ ] Tab selection updates the input form below

### URL Input (First Type)
- [ ] URLInput component
- [ ] URL validation (basic — starts with http/https)
- [ ] Auto-prepend https:// if missing
- [ ] Character count indicator (QR codes have data limits)

### QR Preview
- [ ] QRPreview component
- [ ] Dynamic import of qr-code-styling in onMount
- [ ] SSR fallback (simple SVG via @svelte-put/qr or placeholder)
- [ ] Debounced reactivity (150ms) on text input changes
- [ ] Immediate reactivity on color/style changes
- [ ] Sticky position on desktop (right column)
- [ ] Inline position on mobile

### Customization Controls
- [ ] ColorPicker: foreground + background color inputs
- [ ] StyleGrid: 6 dot styles as visual icons (square, rounded, dots, classy, classy-rounded, extra-rounded)
- [ ] StyleGrid: 3 corner square styles as visual icons
- [ ] All controls in collapsible accordion sections
- [ ] 44px minimum touch targets

### Download
- [ ] DownloadBar component
- [ ] PNG download at 1024×1024px (primary button, one click)
- [ ] SVG download (secondary link)
- [ ] No modal, no gate, no signup prompt
- [ ] File named: `qr-code-[timestamp].png/svg`

### Testing
- [ ] Generates valid, scannable QR codes (test with phone camera)
- [ ] Works on Chrome, Firefox, Safari
- [ ] Works on iOS Safari, Android Chrome
- [ ] Responsive layout correct at all breakpoints
- [ ] Keyboard navigation works for all controls
- [ ] Page loads in <2 seconds on 3G throttle

---

## Sprint 2 Checklist: All Types + Polish (Days 6–9)

### Additional Input Forms
- [ ] WiFiInput: SSID, password, encryption type (WPA/WEP/None)
- [ ] VCardInput: first name, last name, phone, email, org, title, URL
- [ ] EmailInput: to address, subject, body
- [ ] SMSInput: phone number, pre-filled message
- [ ] PhoneInput: phone number with country code
- [ ] TextInput: free-form text area

### Encoder Functions
- [ ] All encoder functions implemented and unit tested
- [ ] WiFi string format verified against Android + iOS scanners
- [ ] vCard 3.0 format verified against contacts apps
- [ ] Special character escaping works (semicolons, backslashes, etc.)

### Logo Embedding
- [ ] LogoUploader: drag-and-drop or file picker
- [ ] Image preview after upload
- [ ] Preset gallery: common social icons (Instagram, Twitter, LinkedIn, YouTube, TikTok, Facebook, GitHub, WhatsApp)
- [ ] Auto-switch error correction to Q or H when logo detected
- [ ] Logo size capped at ~20% of QR area with configurable margin

### Gradient Support
- [ ] Linear gradient option for foreground color
- [ ] Radial gradient option for foreground color
- [ ] Two-color gradient picker UI
- [ ] Live preview updates with gradient

### Error Correction
- [ ] Selector in Advanced section: L (7%), M (15%), Q (25%), H (30%)
- [ ] Plain-language labels: "Low — smallest code" to "High — best for logos/damage"
- [ ] Auto-set to Q when logo is present, with override

### Batch Generation
- [ ] CSV upload UI (drag-and-drop or file picker)
- [ ] Parse CSV: each row = one QR code (URL column, optional label column)
- [ ] Generate all QR codes client-side with current style settings
- [ ] Package into ZIP via JSZip (lazy loaded)
- [ ] Download ZIP — one click
- [ ] Progress indicator for large batches

### PDF Export
- [ ] Lazy-load jsPDF on "PDF" button click
- [ ] Export QR as vector in PDF (not rasterized)
- [ ] Configurable size (default: 2" × 2" at 300 DPI)

### Mobile Sharing
- [ ] Web Share API integration (share PNG directly to apps)
- [ ] Fallback to download on unsupported browsers

### Accessibility
- [ ] All interactive elements keyboard accessible
- [ ] ARIA labels on tabs, accordions, color pickers
- [ ] aria-live="polite" on QR preview region
- [ ] Focus indicators visible on all elements
- [ ] Color contrast warning if user picks low-contrast QR colors
- [ ] Screen reader text alternative showing encoded content

### PWA / Offline
- [ ] manifest.json with icon, theme color, display: standalone
- [ ] Service worker caching app shell
- [ ] Works fully offline after first visit (static codes only)
- [ ] "Works offline" indicator in UI

### Trust Signals
- [ ] "🔒 Your data never leaves your browser" badge near preview
- [ ] "Open source" badge with live GitHub star count (optional)
- [ ] "No signup needed" in header/hero area

---

## Sprint 3 Checklist: Dynamic Codes (Days 10–13)

### Database
- [ ] Run D1 migration: 0001_create_redirects.sql
- [ ] Test locally with wrangler d1 --local

### Redirect Worker
- [ ] Create redirect-worker/ project with own wrangler.jsonc
- [ ] Implement redirect handler (D1 lookup → 302 redirect)
- [ ] Scan counter via ctx.waitUntil (non-blocking)
- [ ] 404 page for invalid/deactivated codes
- [ ] Deploy to go.nah.tools
- [ ] Test redirect latency (<50ms)

### Dynamic Code Creation
- [ ] DynamicForm component: destination URL + passphrase + optional label
- [ ] Passphrase requirements: min 8 characters, strength indicator
- [ ] POST /api/dynamic endpoint: validate URL, hash passphrase, generate short code, insert to D1
- [ ] Return: short code, management URL, QR code preview
- [ ] Success state: prominent "SAVE YOUR PASSPHRASE" warning
- [ ] Clear explanation: "This creates a QR code that routes through our server. You can change where it points anytime."

### Dynamic Code Management
- [ ] /manage/[code] page: passphrase prompt
- [ ] On correct passphrase: show destination URL (editable), scan count, created date, active/inactive toggle
- [ ] Edit URL: PUT /api/dynamic/[code] with passphrase verification
- [ ] Deactivate: DELETE /api/dynamic/[code] with passphrase verification
- [ ] Clear UX for "wrong passphrase" vs "code not found"

### Security
- [ ] Rate limiting: Cloudflare WAF rule — 10 creates/hour/IP
- [ ] URL validation: reject javascript:, data:, file: schemes
- [ ] Passphrase hashing: bcrypt with cost factor 10
- [ ] Short codes: 8 chars alphanumeric from crypto.randomUUID()
- [ ] Optional: Cloudflare Turnstile (free CAPTCHA) on create form

---

## Sprint 4 Checklist: Content + Deploy (Days 14–17)

### Content Pages
- [ ] **VERIFY: QR Code Monkey / QR Code Generator Pro corporate connection** (WHOIS, About pages, corporate filings) — must confirm before /why goes live
- [ ] /why — Exposé article (see outline doc)
- [ ] /compare — Competitor comparison table with real pricing
- [ ] /wifi — WiFi QR landing page (SEO target)
- [ ] /vcard — vCard QR landing page (SEO target)
- [ ] /privacy — Privacy policy
- [ ] /terms — Terms of service
- [ ] All content pages prerendered (static)

### SEO
- [ ] Unique title + meta description on every route
- [ ] Schema.org SoftwareApplication JSON-LD on main page
- [ ] Schema.org Article JSON-LD on /why
- [ ] Open Graph tags (og:title, og:description, og:image) on all pages
- [ ] Twitter Card meta tags
- [ ] Canonical URLs
- [ ] sitemap.xml (auto-generated or manual)
- [ ] robots.txt in /static

### Visual Assets
- [ ] OG image: 1200×630, bold text, tool screenshot or comparison graphic
- [ ] Favicon: SVG in /static (works at all sizes)
- [ ] Apple touch icon

### GitHub Repo
- [ ] README.md: hero screenshot, one-line description, features list, tech stack, local dev instructions, license
- [ ] LICENSE: MIT
- [ ] CONTRIBUTING.md: how to add QR types, how to submit PRs
- [ ] .github/workflows/deploy.yml: push to main = deploy
- [ ] Clean up any debug code, console.logs, TODO comments

### Cloudflare Setup
- [ ] Cloudflare Web Analytics enabled (free, no JS tag)
- [ ] Custom domain configured on Workers
- [ ] go.nah.tools subdomain configured for redirect Worker
- [ ] SSL certificates active (automatic with Cloudflare)
- [ ] Page Rules: cache static assets aggressively

### Final Testing
- [ ] All QR types generate scannable codes (test each with 2+ phone models)
- [ ] Dynamic code creation → redirect → scan counter works end to end
- [ ] Management page: edit URL, deactivate, view stats
- [ ] Offline mode works for static codes
- [ ] All links work (no 404s)
- [ ] Cross-browser: Chrome, Firefox, Safari, Edge
- [ ] Cross-device: iPhone, Android, iPad, desktop
- [ ] Performance: Lighthouse 95+ on all pages
- [ ] Accessibility: axe-core scan passes with no critical issues

---

## Launch Day Checklist (Day 18)

### Morning (6–8 AM PT)
- [ ] Final production smoke test
- [ ] Product Hunt listing goes live
- [ ] Submit to Hacker News
- [ ] Post Twitter/X thread
- [ ] Post to r/opensource

### Afternoon
- [ ] Post to r/smallbusiness
- [ ] Post to r/webdev or r/sveltejs
- [ ] Monitor and respond to ALL comments on HN, PH, Reddit
- [ ] Fix any critical bugs reported

### Evening
- [ ] Check analytics: how many visitors, where from
- [ ] Check GitHub: any stars, issues, PRs
- [ ] Check QR code generation count (Workers Analytics)
- [ ] Write down lessons learned while they're fresh

---

## Post-Launch Week 1

- [ ] Continue responding to comments and feedback
- [ ] Fix non-critical bugs
- [ ] Post to 2 more subreddits (space out)
- [ ] Cross-post exposé to Dev.to
- [ ] Submit to Alternative.to
- [ ] Submit to awesome-selfhosted
- [ ] Write "How to make a WiFi QR code" tutorial (SEO play)

---

## Go / No-Go Criteria

Before hitting the launch button, every item must be true:

1. ✅ Static QR codes work perfectly (all types, all customizations, all downloads)
2. ✅ Dynamic QR codes work end-to-end (create → redirect → manage)
3. ✅ The exposé article is fact-checked and published
4. ✅ Privacy policy and terms are live
5. ✅ GitHub repo is public with clean README
6. ✅ Lighthouse score is 90+ on all pages
7. ✅ QR codes are scannable on at least 3 different phone models
8. ✅ The site works offline for static codes
9. ✅ No console errors in production
10. ✅ At least one person who isn't you has tested it and confirmed it works
