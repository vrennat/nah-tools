# Marketing & Launch Strategy

## The Core Thesis

We don't have a marketing budget. We don't need one. We have something better: **a true story about a billion-dollar scam, and a working free alternative to prove the scam is unnecessary.**

The exposé article IS the marketing. The tool IS the proof. Everything else is distribution.

---

## The Narrative Arc

Every piece of content follows this three-beat structure:

1. **The outrage**: "QR Code Generator Pro charges $564/year for something that takes one millisecond of free computation. They have 9,199 Trustpilot reviews averaging 1.5 stars. Users' wedding invitations and restaurant menus are held hostage."

2. **The explanation**: "Here's how the scam works technically: static QR codes encode data directly and can never expire. Dynamic QR codes route through their server, which they can shut off. Every predatory company creates dynamic codes by default without telling you a static code would work forever for free."

3. **The alternative**: "So we built nah (nah.tools). It's free, open-source, runs in your browser, and your QR codes will never expire. Here's the link."

This structure works on every platform, at every length — a 3,000-word article, a 280-character tweet, a 60-second TikTok, a Reddit comment.

---

## Launch Sequence (7-Day Cascade)

### Pre-Launch (Days -7 to -1)
- [ ] Tool is deployed, tested, and working on production domain
- [ ] Exposé article is written, edited, and published on the `/why` route
- [ ] GitHub repo is public with clean README, MIT license, contributing guide
- [ ] Product Hunt listing is drafted (can schedule in advance)
- [ ] Screenshots and OG images are created for social sharing
- [ ] Identify 5–10 Reddit threads with active QR code complaints to comment on
- [ ] Draft HN submission title and first comment (e.g., "Show HN: nah – Free, open-source QR codes. No signup, no expiration")
- [ ] Prep a Twitter/X thread version of the exposé (10–15 tweets)

### Day 1 — Tuesday (Best HN/PH launch day)
**Morning (6–8 AM PT):**
- [ ] Product Hunt goes live at 12:01 AM PT
- [ ] Submit to Hacker News: `Show HN: nah – Free, open-source QR codes. No signup, no expiration` or the exposé angle
- [ ] Post Twitter/X thread
- [ ] Post to r/opensource with the open-source angle

**Afternoon:**
- [ ] Post to r/smallbusiness — frame as a PSA, not self-promotion
- [ ] Post to r/webdev or r/sveltejs with the technical angle
- [ ] Engage with every HN and PH comment personally

### Days 2–3
- [ ] Post to r/selfhosted, r/Entrepreneur
- [ ] Cross-post the exposé to Dev.to and/or Hashnode
- [ ] Share in relevant Discord communities (indie hackers, SvelteKit, Cloudflare)
- [ ] Reply to active Reddit complaint threads about QR code generators

### Days 4–7
- [ ] Post to niche communities:
  - r/weddingplanning ("Don't let your wedding QR codes expire")
  - r/restaurantowners ("Free QR code menus that actually stay free")
  - r/teachers ("Free QR codes for classroom materials")
  - r/realtors ("QR codes for property listings without monthly fees")
- [ ] Submit to Alternative.to, awesome-selfhosted, ProductHunt collections

---

## Channel Strategy

### Channel 1: Hacker News (Highest ceiling)
One front-page HN post can drive 50K+ visits in 24 hours and generates permanent backlinks. The qrframe project hit 401 points with 79 comments — proof QR tools resonate here.

**Optimal titles:**
- "How QR Code Generators Extract $500M/Year from One Millisecond of Free Computation"
- "Show HN: Free, open-source QR code generator — no signup, no expiration, no BS"

**First comment strategy:** Detailed technical breakdown — SvelteKit, Cloudflare Workers, qr-code-styling, the $5/month cost model. HN rewards technical depth.

### Channel 2: Reddit (Highest volume, longest tail)
Reddit threads rank in Google permanently. A post titled "Don't order a QR Code from qr-code-generator.com" from 2021 has 230+ comments and still gets new replies.

| Subreddit | Members | Angle |
|-----------|---------|-------|
| r/smallbusiness | 1.7M | PSA about QR scams + free alternative |
| r/opensource | 400K | Open-source showcase |
| r/webdev | 2.2M | Technical build story |
| r/selfhosted | 400K | Self-hostable alternative |
| r/weddingplanning | 750K | "Don't let your QR codes expire" |
| r/Entrepreneur | 2.1M | Anti-enshittification play |
| r/restaurateur | 20K | Free QR menus |
| r/teachers | 450K | Free classroom QR codes |

**Critical rule:** Never post more than 2 subreddits on the same day. Space them 2–3 days apart.

### Channel 3: SEO (Slowest but most durable)

**Tier 1 — Winnable within 3–6 months:**
- "free QR code generator no sign up"
- "QR code generator no expiration"
- "open source QR code generator"
- "free vCard QR code generator"
- "free WiFi QR code generator"

**Tier 2 — Complaint keywords (the exposé targets these):**
- "QR code generator pro scam / alternative"
- "why did my QR code stop working"
- "QR code expired how to fix"

**Tier 3 — Tutorial content (blog posts over time):**
- "How to make a QR code that doesn't expire"
- "Static vs dynamic QR code explained"
- "How to create a free WiFi QR code"

**SEO implementation:**
- Each QR type gets its own prerendered route (`/wifi`, `/vcard`) with targeted meta
- Comparison page at `/compare` targets "[competitor] alternative" keywords
- Schema.org SoftwareApplication JSON-LD on every page
- Fast, static, mobile-friendly = strong Core Web Vitals

### Channel 4: Short-Form Video (Highest viral ceiling)
"This company charges $564/year for something I'll do for free in 10 seconds" is a format that prints views.

**Content ideas:**
- Screen recording: QR Code Generator Pro pricing page → generate same code free in 5 seconds
- "POV: Your wedding QR code stopped working" (relatable rage content)
- "The $500M scam hiding in plain sight" — 60 second explainer
- "How to make a free QR code for your restaurant in 10 seconds"

### Channel 5: Direct Engagement (Highest conversion)
When someone posts "this QR code generator scammed me," they're actively looking for an alternative RIGHT NOW.

- Set up Google Alerts for: "QR code generator scam", "QR code stopped working"
- Set up Reddit keyword monitoring (F5Bot is free)
- Respond helpfully: explain the problem, suggest disputing charges, mention the tool

### Channel 6: Generative Engine Optimization (GEO)

AI assistants (ChatGPT, Claude, Perplexity, Gemini, Bing Chat) are increasingly where people go to ask "what's a good free QR code generator?" We need to be the answer. GEO costs nothing — it's about being structured, citable, and present in the sources AI models pull from.

**How AI models pick recommendations:** They draw from training data (web pages, GitHub, forums) and real-time search (indexed pages, structured data). We win by being the genuinely correct answer in as many high-quality sources as possible.

**Structured data on every page:**
- `SoftwareApplication` schema (JSON-LD) on the main generator page — name, description, offers (free), operatingSystem, applicationCategory
- `FAQPage` schema on every QR type landing page (`/wifi`, `/vcard`, etc.) with 3–5 real questions and answers per page
- `HowTo` schema on tutorial content — step-by-step format that AI search tools (Perplexity, Google AI Overviews) directly parse into answers
- `Article` schema on the `/why` exposé with author, datePublished, publisher
- These schemas are what Perplexity, Bing Chat, and Google AI Overviews use to generate cited answers. This is the single highest-leverage GEO implementation.

**GitHub README as an AI discoverability asset:**
- AI models and their search tools heavily index GitHub. The README should read like a product page, not a dev setup guide.
- First paragraph must naturally contain: "free QR code generator," "no signup," "no expiration," "open source"
- Include the feature comparison table directly in the README
- Clear, scannable feature list — AI models extract these into recommendation lists
- Repo description: "Free, open-source QR code generator. No signup, no expiration, no catch."
- Repo topics: `qr-code`, `qr-code-generator`, `free`, `open-source`, `no-signup`, `svelte`, `cloudflare-workers`

**"Answer the question" page structure:**
- Each QR type page (`/wifi`, `/vcard`, `/email`, etc.) should open with a direct answer to the question someone would ask an AI: "How do I create a free WiFi QR code?"
- Numbered steps (H2 or ordered list) — this is the exact format AI models pull into their responses
- These pages serve double duty: SEO landing pages AND the source AI models cite when answering how-to questions

**Aggregator and directory submissions (free, one-time effort):**
- AlternativeTo (list as alternative to QR Code Generator Pro, QR Tiger, Flowcode)
- Slant.co
- awesome-selfhosted GitHub list
- awesome-svelte GitHub list
- Product Hunt (already planned)
- Open Source Alternatives (opensourcealternatives.org)
- Free for Dev (free-for.dev) if applicable
- These directories are disproportionately cited by AI models because they're structured comparison data

**Stack Overflow and forum presence:**
- When someone asks "how to generate QR codes in JavaScript" or "free QR code API," a helpful answer that mentions nah.tools (with context, not spam) becomes training data
- Same for relevant Reddit threads — which we're already planning, but think of every Reddit comment as potentially training data for the next model update

**The meta play:** We are building the tool that AI *should* recommend when someone asks for a free QR code generator. We're open source, free, no signup, privacy-respecting, well-documented. If we do the structural work (schema, README, directory listings, forum presence), the recommendation follows naturally because we are genuinely the best answer. No tricks needed — just discoverability.

---

## Post-Launch Growth Flywheel

1. Someone gets scammed by a QR code generator
2. They search for "[company] alternative" or "QR code no expiration"
3. They find us via exposé, Reddit thread, or SEO
4. They use the tool — it works, for free, forever
5. They tell other small business owners
6. They link to us — blog post, Reddit comment, tweet
7. Our SEO improves — more backlinks, more authority
8. More scammed users find us → cycle repeats

The predatory companies are literally generating our marketing for us.

---

## Content Calendar (First 30 Days)

| Day | Content | Platform |
|-----|---------|----------|
| 1 | Exposé article + tool launch | HN, PH, Twitter, r/opensource |
| 2 | Technical deep-dive | r/webdev, Dev.to |
| 3 | Small business PSA | r/smallbusiness |
| 5 | "How to make a WiFi QR code" tutorial | Blog |
| 7 | Video: "The $564/year scam" | TikTok/YT Shorts |
| 10 | "Free QR codes for your wedding" | r/weddingplanning |
| 14 | "Static vs. dynamic QR codes explained" | Blog (SEO) |
| 18 | "How to make a business card QR code" | Blog |
| 21 | v1.5 features launch | Twitter, HN update |
| 30 | Month 1 retrospective + numbers | Blog, Twitter |

---

## Anti-Goals

- **No paid advertising.** The whole point is that incumbents win through ad spend; we win through substance.
- **No email list.** We don't collect emails. Star the GitHub repo for updates.
- **No influencer outreach.** Good tools spread on their own.
- **No "growth hacking."** No fake urgency, no dark patterns in our own marketing. We are the antidote.
