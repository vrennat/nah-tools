# Product Spec: Nah Tools — QR Code Generator

## North Star

**One sentence**: **Nah Tools** (nah.tools) — the internet's most honest QR code generator. Free, open-source, browser-based, with no signup, no expiration, and no catch.

**The bet**: We can replicate every meaningful feature of tools charging $10–90/month, ship it for $5/month total infrastructure cost, and use an investigative exposé as the distribution engine to reach users the predatory incumbents have already burned.

---

## The Problem

The QR code generator market is a $13B industry built on a single deception: making users create **dynamic** codes (which route through the company's server and can be deactivated) when **static** codes (which encode data directly and can never expire) would serve them perfectly.

The human cost is real. A bride whose wedding RSVPs stopped working 14 days after printing invitations. A restaurant owner whose table menus went dead on the busiest Saturday of the year. Thousands of small business owners charged $120–564/year for one millisecond of free computation.

**QR Code Generator Pro has 9,199 Trustpilot reviews averaging 1.5/5 stars.** The complaints are identical: "I was told it was free, I printed my materials, and now they want me to pay to reactivate."

---

## User Personas

### 1. Small Business Owner — "Maria"
Runs a taco truck, needs a QR code for her menu and payment link. Searched "free QR code generator," got burned by a trial-to-subscription trap. Wants: create a code, download it, print it, done. No account, no emails, no recurring charges. If it's not obvious in 10 seconds, she leaves.

### 2. Event Organizer — "Jake"
Runs community events, needs QR codes for ticketing pages, WiFi passwords. Needs dynamic codes he can update after printing posters. Was paying $16.99/month for 5 dynamic codes. Wants: the ability to edit where a code points after printing, with basic scan counts.

### 3. Developer — "Priya"
Building an app with QR codes. Wants SVG output, batch generation, clean code, no watermarks. Will judge us on: code quality, open-source license, bundle size, zero tracking.

### 4. The Burned User — "Dave"
Already got scammed. Printed 500 business cards. Codes went dead. Actively searching "QR code generator no expiration." Will become our most vocal evangelist if we deliver.

---

## V1 Feature Set (Launch — Target: 2–3 Weeks)

### Static QR Codes (100% client-side, zero server cost)
- QR types: URL, plain text, WiFi, vCard, email, phone, SMS
- Visual customization: foreground/background colors, 6 dot styles, 3 corner styles
- Logo embedding: upload custom image or pick from common social icons
- Gradient support for foreground colors
- Error correction level selector (L/M/Q/H) with plain-language explanation
- Live preview: updates reactively as user types and customizes
- Download: PNG (1024px), SVG, PDF — one click, no gate
- Batch generation: CSV of URLs → ZIP of QR codes
- Web Share API for mobile sharing
- Works offline (service worker / PWA)
- Zero tracking, zero cookies, zero analytics beyond Cloudflare Web Analytics

### Dynamic QR Codes (Cloudflare Workers + D1)
- Create dynamic codes that redirect through our short URL
- Edit destination URL after creation
- Basic scan counter (total scans only — no PII, no geolocation)
- Passphrase-based management (not accounts — see Auth section)
- Codes never expire unless user explicitly deactivates

### The Exposé Page
- `/why` route: the story of predatory QR companies, static vs. dynamic explained, why this tool exists
- Competitor comparison table with real pricing
- Embedded, scannable QR code examples throughout

### Meta
- Open source on GitHub (MIT license)
- Prerendered landing and article pages (static, zero cost)
- Responsive: phone, tablet, desktop
- Accessible: WCAG 2.1 AA, keyboard navigable

---

## Auth Model for Dynamic Codes

**Passphrase-based ownership**: When creating a dynamic code, user sets a passphrase (min 8 chars). Hashed with bcrypt, stored with the redirect. To edit or deactivate, provide the passphrase. No email, no username, no account.

**Tradeoff**: Lost passphrase = lost management access. Acceptable because:
1. We prominently warn to save the passphrase
2. Dynamic codes are a minority use case
3. Email-based accounts introduce the exact dark patterns we're fighting
4. Management URL (`/manage/abc123`) can be bookmarked

---

## V1.5 — Post-Launch Quick Wins
- Additional QR types: geo location, calendar event, app store, crypto
- Template saving to localStorage
- Custom frames with CTA text ("Scan me!")

## V2 — If Traction Warrants
- QR code scanner (camera-based, client-side)
- Bulk dynamic code dashboard
- Time-series scan analytics (daily counts, no PII)
- API endpoint for programmatic generation
- Custom short domains for dynamic codes

## Never
- User accounts with email/password
- Email collection or newsletter prompts
- Ads, affiliate links, sponsored content
- Watermarks on free codes
- Artificial limits on static code generation
- Selling or sharing any user data
- Paywalling SVG or high-res exports

---

## Brand Voice

**The vibe: Laid-back defiance.** Casual and confident, like a friend who's also furious about how dumb this industry is.

- **On the tool itself:** Chill, simple, helpful. The UI doesn't need to be angry — it just needs to work beautifully and feel effortless. The tool speaks through its quality.
- **On the exposé / marketing / social:** This is where the "fuck this" energy lives. Direct, blunt, a little funny. We name names. We show receipts. We don't hedge. "They charge $564/year for one millisecond of free computation. Nah."
- **On docs / legal / GitHub:** Professional but human. No corporate-speak. Write like a real person who respects other people's time.

**Examples of the voice:**
- ✅ "Is it really free? Nah, we're lying. Just kidding. Yeah, it's free."
- ✅ "QR codes belong to you. They always did."
- ✅ "No signup. No expiration. No catch. No, seriously."
- ❌ "We're excited to announce our revolutionary QR code platform!"
- ❌ "Leverage our best-in-class solution..."

---

## Design Principles

1. **Speed over everything.** Page loads fast, QR generates instantly, download is one click. No modals, no onboarding flow.

2. **Transparent by default.** Show the user exactly what their QR code contains. Demystify the technology.

3. **Static codes promoted first.** Default mode is static. Dynamic is clearly labeled as optional with honest tradeoff explanation.

4. **Privacy as architecture, not policy.** Static codes never touch our server. The page works offline. We can't track what we never receive.

5. **Clean and minimal, not sterile.** Professional, trustworthy. One accent color. Generous whitespace. No decoration without purpose.

---

## Success Metrics

### Launch Week
- HN front page or 100+ points
- Product Hunt top 10 of the day
- 5,000+ unique visitors
- 50+ GitHub stars

### Month 1
- 25,000+ unique visitors
- 10,000+ QR codes generated
- 500+ dynamic codes created
- 200+ GitHub stars

### Month 3
- Page 1–2 ranking for long-tail QR keywords
- 100,000+ cumulative visitors
- Infrastructure cost still under $10/month

### The Real Metric
If someone searches "QR code generator" and finds us instead of a predatory tool, and they create a code that works forever without paying a cent — that's a win.

---

## Open Questions (Resolved)

1. ~~**Domain name**~~ — **RESOLVED: nah.tools** (purchased via Cloudflare, $28.20/yr). Redirect subdomain: go.nah.tools. Contact: hey@nah.tools.

2. ~~**Dynamic codes in v1?**~~ — **RESOLVED: Yes.** Dynamic codes ship day 1. This is the core value prop — free dynamic codes are what makes the exposé hit hardest.

3. ~~**Passphrase vs. magic link?**~~ — **RESOLVED: Passphrase for v1.** Simpler, no email infrastructure, aligns with no-account philosophy.

4. ~~**Naming competitors explicitly?**~~ — **RESOLVED: Yes, name them.** All claims sourced from public pricing pages, Trustpilot, and Sitejabber. Truth is an absolute defense. Pre-launch TODO: verify QR Code Monkey / QR Code Generator Pro corporate connection before publishing.

5. ~~**Monetization — ever?**~~ — **RESOLVED: Free forever. Donations only.** GitHub Sponsors and/or Ko-fi. No ads, no premium tier, no paywalls, ever. See cost analysis in engineering plan for scale risk.
