# nah — Free, Open-Source QR Code Generator

**Create QR codes for free. No signup. No expiration. No catch.**

nah ([nah.tools](https://nah.tools)) is a free, open-source QR code generator that runs entirely in your browser. Generate static QR codes for URLs, WiFi, vCards, email, phone, SMS, and plain text — with full visual customization, high-res exports, and zero tracking. Your data never touches our server.

Need a QR code that you can update after printing? nah also offers free dynamic QR codes with scan counting — no account required, no expiration, managed by passphrase.

## Why This Exists

The QR code generator industry charges $120–564/year for something that takes one millisecond of free computation. QR Code Generator Pro has 9,199 Trustpilot reviews averaging 1.5/5 stars — nearly all complaining about the same bait-and-switch: create a "free" QR code, print it, then get charged to keep it working. [Read the full story →](https://nah.tools/why)

## Features

**Static QR codes (100% client-side, zero server cost):**
- QR types: URL, plain text, WiFi, vCard, email, phone, SMS
- Visual customization: colors, gradients, 6 dot styles, 3 corner styles
- Logo embedding: upload your own or pick from preset icons
- Export: PNG (any resolution), SVG, PDF — one click, no gate
- Batch generation: CSV upload → ZIP of QR codes
- Works offline (PWA with service worker)
- Zero tracking, zero cookies, zero analytics beyond Cloudflare Web Analytics

**Dynamic QR codes (free, no account):**
- Edit destination URL after printing
- Basic scan counter (total only — no PII, no geolocation)
- Passphrase-based management (no email, no signup)
- Codes never expire unless you explicitly deactivate them

**Privacy by architecture:** Static codes are generated entirely in your browser. The server never sees your data. Dynamic codes use a minimal redirect through Cloudflare Workers. No accounts, no email collection, no ads, no affiliate links.

## How We Compare

| Feature | nah | QR Code Generator Pro | QR Tiger | Flowcode |
|---------|-----------|----------------------|----------|----------|
| Price | **Free** | $120–564/yr | $84–444/yr | $60–3,000/yr |
| Signup required | No | Yes | Yes | Yes |
| Codes expire | Never | After 14-day trial | After trial | After trial |
| SVG export | Free | Paid plans | Paid plans | No |
| Open source | Yes (MIT) | No | No | No |
| Works offline | Yes | No | No | No |

## Tech Stack

- **Framework:** SvelteKit + Svelte 5
- **Styling:** Tailwind CSS 4
- **QR Library:** qr-code-styling (client-side)
- **Hosting:** Cloudflare Workers ($5/month total infrastructure cost)
- **Database:** Cloudflare D1 (for dynamic code redirects)
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

**[nah.tools](https://nah.tools)** — QR codes belong to you. They always did.
