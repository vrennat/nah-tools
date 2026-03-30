# nah — Free, Open-Source Browser Tools

**Free tools that respect your privacy. No signup. No tracking. No catch.**

nah ([nah.tools](https://nah.tools)) is a collection of free, open-source utilities that run in your browser. QR codes, PDF tools, image editing, link shortening, resume building — all client-side, all free, forever.

## Tools

**QR Code Generator** — Static codes for URLs, WiFi, vCards, email, phone, SMS, and plain text. Dynamic codes with editable destinations and scan counting. Visual customization (colors, gradients, dot styles, corner styles, logo embedding), high-res exports (PNG, SVG, PDF), and batch generation via CSV.

**PDF Tools** — Merge, split, compress, rotate, reorder, remove pages, add page numbers, add watermarks, convert to/from images. All processing happens in your browser.

**Photo Tools** — Compress images, apply filters, remove backgrounds. No uploads to external servers.

**Link Shortener** — Custom short links with click analytics, UTM builder, QR code generation, and bulk creation. Passphrase-protected management.

**Resume Builder** — Build resumes with ATS analysis and job matching.

**Data Broker Removal** — Find and request removal of your personal data from data brokers.

## Why This Exists

The utility tool industry charges subscription fees for things that take milliseconds of free computation. QR Code Generator Pro has 9,199 Trustpilot reviews averaging 1.5/5 stars — nearly all complaining about the same bait-and-switch: create a "free" code, then get charged to keep it working. [Read the full story.](https://nah.tools/why)

## Privacy by Architecture

Static tools (QR codes, PDFs, photos) run entirely in your browser. The server never sees your data. Dynamic features (short links, dynamic QR codes) use a minimal redirect through Cloudflare Workers. No accounts, no email collection, no ads, no cookies.

## Tech Stack

- **Framework:** SvelteKit + Svelte 5
- **Styling:** Tailwind CSS 4
- **Hosting:** Cloudflare Workers
- **Database:** Cloudflare D1 (for redirects and dynamic codes)
- **Analytics:** Cloudflare Web Analytics (privacy-respecting)

## Development

```sh
bun install
bun run dev
```

## Contributing

Contributions welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE) — use it however you want.

---

**[nah.tools](https://nah.tools)** — Free tools. No catch.
