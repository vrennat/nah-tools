# Design Context

## Users

People who need a QR code and searched for "free QR code generator." They range from wedding planners and small restaurant owners to teachers and nonprofit volunteers. They are not technical — they want to paste a URL, get a code, and move on. Their context is often time-pressured (invitations already at the printer, event this weekend). The job: generate a QR code that works forever, download it, and never think about this tool again.

## Brand Personality

**Honest, practical, sharp.** Says what it means, does what it says, no fluff. The tone is friendly and approachable — "anyone can use this" — but never saccharine or try-hard. The name itself ("nah") sets the voice: casual refusal of industry BS, delivered with a shrug, not a megaphone.

## Aesthetic Direction

- **Visual tone:** Clean utility with warmth. Closer to Craigslist's function-first honesty than to a polished SaaS landing page, but with the craft and speed of Linear. The tool should feel fast and obvious, not designed.
- **References:** Linear (polished, fast, dark-mode craft), Hacker News / Craigslist (pure function, content-first, zero fluff).
- **Anti-references:** QR Code Generator Pro (cluttered, ads, dark patterns), generic SaaS landings (stock photos, gradient blobs, trust badges), over-designed portfolios (gratuitous animation, parallax, style over substance), enterprise dashboards (dense, overwhelming).
- **Theme:** Light + dark mode, user-selectable, respects system preference. Dark mode is first-class, not an afterthought.

## Color System

- **Accent:** `#3b82f6` (blue-500) — single accent color for CTAs and active states
- **Surfaces:** White/slate-50 (light), slate-900/800 (dark) — neutral, receding backgrounds
- **Text:** Slate-900 primary, slate-500 muted (light); slate-100 primary, slate-400 muted (dark)
- **Semantic:** Green for success, red for errors, amber for warnings — used sparingly and only for meaning
- **Typography:** Inter (sans), JetBrains Mono (code/data). Two fonts, no more.

## Design Principles

1. **Function over decoration.** Every element earns its place. No ornamental gradients, no illustration for illustration's sake, no animation that doesn't serve comprehension. If removing something doesn't hurt usability, remove it.

2. **Obvious over clever.** Labels say what things do. Buttons say what will happen. Inputs show what to type. No jargon, no tooltips needed, no hidden menus. A first-time user should never wonder "what does this do?"

3. **Fast over impressive.** Perceived speed matters more than visual polish. Prefer instant feedback, minimal layout shift, and lightweight interactions. No loading spinners where an optimistic update works. No splash screens. No transitions longer than 200ms.

4. **Generous with space, tight with words.** Ample whitespace and padding — never cramped. But text is concise: short labels, short descriptions, short error messages. The interface breathes, the copy doesn't ramble.

5. **Accessible by default.** Target WCAG AAA. High contrast ratios, visible focus indicators, full keyboard navigation, semantic HTML, screen reader support. Respect `prefers-reduced-motion` and `prefers-color-scheme`. Accessibility is not a feature — it's the baseline.
