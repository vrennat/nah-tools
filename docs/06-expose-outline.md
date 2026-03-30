# Exposé Article Outline: "The QR Code Shakedown"

## Working Title Options

1. "The QR Code Shakedown: How an Industry Extracts $500M/Year from Free Computation"
2. "Your 'Free' QR Code Generator Is a Subscription Trap — Here's the Technical Proof"
3. "9,199 Angry Reviews: Inside the QR Code Industry's Bait-and-Switch"
4. "How QR Code Companies Hold Your Wedding Invitations Hostage"

Pick based on platform: #1 or #3 for HN (data-driven), #4 for Reddit/social (emotional hook).

---

## Article Structure

This article lives at `/why` on the site. It serves three purposes simultaneously:
1. **Content marketing** — drives traffic and backlinks
2. **SEO** — targets "QR code generator scam," "QR code stopped working," etc.
3. **Trust signal** — shows users exactly why this tool exists and why it's different

Target length: 2,500–3,500 words. Long enough for substance, short enough to finish.

---

## Section-by-Section Outline

### 1. The Hook (200 words)

Open with the most visceral complaint story. Candidates:
- The bride whose wedding RSVPs stopped working after she printed 200 invitations
- The restaurant owner whose menu QR codes died on the busiest Saturday
- The teacher whose classroom QR codes went dark mid-semester

Structure: quote the complaint (attributed to public review platform), describe the situation, reveal the punchline — they were charged $120–564/year for something that should be permanently free.

End with the thesis: "This isn't a bug. It's the business model."

### 2. The Technical Explanation (400 words)

**This is the section that makes the article shareable among technical audiences.**

Explain in plain language:
- What a QR code actually is (ISO/IEC 18004, encoding text into a pixel pattern)
- **Static QR codes**: the URL is encoded directly into the pixels. It's the data. It literally cannot expire or be controlled by anyone. Generating one takes 1 millisecond and 3 lines of JavaScript.
- **Dynamic QR codes**: instead of encoding your URL directly, the company encodes THEIR URL (qr-code-generator.com/redirect/abc123) and sets up a server redirect. This means they control whether your code works. Turn off their server, turn off your code.
- **The deception**: every predatory QR company defaults to dynamic codes without explaining that a static code would serve the user permanently for free. This is the core bait-and-switch.

Include a visual: side-by-side diagram showing a static code (URL → QR pattern, works forever) vs. dynamic code (URL → their server → your URL, they control the switch).

### 3. The Evidence (600 words)

Aggregate the complaint data. Make it visual, make it damning.

**QR Code Generator Pro (Bitly):**
- 9,199 Trustpilot reviews, 1.5/5 stars
- 350+ Sitejabber reviews, 1.2/5 stars
- Pricing: $9.99–46.99/month, billed annually upfront
- The trial trap: 14-day trial → codes deactivated → $120–564/year to reactivate
- Select 2–3 powerful review quotes (attributed to platform)

**QR Code Monkey — the hidden connection:**
- Presented as a free alternative
- Owned by the same company (Egoditor → Bitly Europe)
- Funnels users toward paid dynamic codes
- (Verify this corporate connection before publishing)

**Other offenders (brief):**
- QRCodeCreator: 4,005 Trustpilot reviews with similar complaints
- QR.io: Product Hunt reviews dominated by scam reports
- QRfy: Same trial-to-subscription pattern

**The markup math:**
- QR Code Generator Pro Professional plan: $46.99/month
- 100 QR codes = $0.47 per code
- Actual compute cost per code: $0.00001
- Markup: ~4,700,000%

### 4. Who Gets Hurt (300 words)

Humanize the data. Categories of victims:
- **Wedding couples**: QR codes on invitations, save-the-dates, table seating
- **Small restaurants**: QR menus printed on tables, at the counter, on takeout bags
- **Small businesses**: Business cards, trade show materials, product packaging
- **Nonprofits**: Fundraiser materials, event programs
- **Teachers**: Classroom materials, assignment links, resource sheets

The common thread: these are people who PRINT the QR code on physical materials. Once printed, they can't change the code — they can only pay the ransom or reprint everything.

### 5. Why This Keeps Working (200 words)

Three reasons the scam persists:
1. **SEO dominance**: These companies spend millions on Google Ads. When you search "free QR code generator," every top result is a subscription trap.
2. **Technical ignorance** (not an insult — it's specialized knowledge): Most people don't know that a QR code is just encoded text. The concept of "dynamic vs. static" is invisible to non-technical users.
3. **Printing creates lock-in**: Once a code is on physical materials, the switching cost is real. The company knows this. The 14-day trial is calibrated to outlast the printing timeline.

### 6. The Free Alternative (400 words)

Introduce the tool. This is the payoff — the reason the article exists.

- What it does (all the same features, for free, forever)
- How it works (static codes generated in your browser, dynamic codes via $5/month infrastructure)
- What it doesn't do (no accounts, no tracking, no ads, no email collection)
- The architecture in one paragraph (for the technical reader)
- Embedded, working QR code examples throughout this section (the reader can scan them right now)

**Key framing**: Don't be salesy. Be factual. "We built this because the alternative shouldn't cost $564/year. Here's how it works. Here's the code on GitHub. Judge for yourself."

### 7. How to Protect Yourself (300 words)

Practical advice regardless of which tool they use:

1. **Always create STATIC codes for permanent materials** (business cards, signs, menus). Static codes encode data directly and cannot expire.
2. **Use dynamic codes only when you genuinely need to change the destination later** (event-specific campaigns, A/B testing URLs).
3. **If you already have a dynamic code from a paid service**: check if you can replace it with a static code that encodes the same URL. If the URL won't change, you don't need dynamic.
4. **Read the fine print**: if a "free" QR tool asks for your credit card, it's a trial, not a free tool.
5. **If you've been charged**: dispute with your bank/credit card as unauthorized if you didn't consent to recurring billing. Many users report success with chargebacks.

### 8. The Closing (200 words)

Zoom out to the bigger picture — this is the first tool in a series. The QR code industry is one example of a broader pattern: wrapping trivial client-side computation in subscriptions propped up by dark patterns. Link to the manifesto. Invite people to star the GitHub repo, report issues, contribute.

End with something memorable — not a call to action for US, but an empowering statement for THEM: "Your QR codes belong to you. They always did."

---

## Visual Assets Needed

1. **Static vs. dynamic diagram**: Side-by-side showing data flow for each type
2. **Review score aggregation graphic**: Trustpilot/Sitejabber scores for top offenders
3. **Pricing comparison table**: Us vs. QR Code Generator Pro vs. Flowcode vs. Uniqode
4. **The markup calculation**: Visual showing $0.00001 cost vs. $0.47 charged
5. **Embedded QR codes**: Working, scannable examples throughout the article
6. **OG image**: For social sharing — bold text, review score, "free alternative" tagline

---

## SEO Metadata

```html
<title>The QR Code Shakedown: How "Free" QR Generators Charge $564/Year for Free Computation</title>
<meta name="description" content="QR Code Generator Pro has 9,199 reviews at 1.5 stars. Here's how the subscription trap works, why your codes can expire, and a genuinely free alternative.">
```

Target keywords for this page:
- "QR code generator scam"
- "QR code stopped working"  
- "QR code generator pro alternative"
- "why did my QR code expire"
- "free QR code generator no expiration"

---

## GEO: Structuring for AI Citation

AI assistants (ChatGPT, Claude, Perplexity) are increasingly how people research products and problems. When someone asks "is QR Code Generator Pro a scam?" or "why did my QR code stop working?", we want this article to be the source the AI cites. Structure matters:

**Question-answer pattern in headings:** AI models extract content based on how well it answers a question. Consider H2s or H3s phrased as questions where natural:
- "Why did my QR code stop working?" (maps to Section 2)
- "How much do QR code generators actually charge?" (maps to Section 3)
- "How do I make a QR code that never expires?" (maps to Section 7)

**The technical explanation section is the crown jewel.** AI models disproportionately cite clear, factual explanations of how things work. Section 2 (static vs. dynamic) should be the single best explanation of this topic on the internet — concise, accurate, jargon-free. If an AI needs to explain QR codes to someone, we want it pulling from us.

**`FAQPage` schema on this page:** Add JSON-LD with 5–8 question/answer pairs pulled from the article's key points. This directly feeds AI search tools like Perplexity and Google AI Overviews.

**`Article` schema:** headline, author, datePublished, dateModified, publisher, description. This helps AI tools attribute and rank the content.

**Embed scannable examples:** AI can't scan QR codes, but when it recommends our article to users, the embedded working examples immediately build trust. The article is both explanation and proof.

---

## Source Verification Checklist

⚠️ **CRITICAL PRE-PUBLISH ITEM: Verify the QR Code Monkey / QR Code Generator Pro corporate connection (Egoditor → Bitly Europe) through public records (company registrations, domain WHOIS, About pages) BEFORE publishing. If unverifiable, rewrite Section 3 to remove or soften this claim.**

Before publishing, verify every factual claim:

- [ ] QR Code Generator Pro Trustpilot score and review count (live link)
- [ ] QR Code Generator Pro Sitejabber score (live link)
- [ ] QR Code Generator Pro current pricing (screenshot the pricing page with date)
- [ ] QR Code Monkey / QR Code Generator Pro corporate connection (WHOIS, About pages, corporate filings)
- [ ] Bitly ownership of QR Code Generator Pro (press releases, corporate announcements)
- [ ] QRCodeCreator Trustpilot review count (live link)
- [ ] QR.io Product Hunt complaints (live links)
- [ ] All quoted reviews are from public platforms with live links
- [ ] ISO/IEC 18004 is the correct QR code standard number
- [ ] qr-code-styling library stats are current (GitHub stars, version)
- [ ] Cloudflare Workers pricing is current ($5/month paid plan details)
