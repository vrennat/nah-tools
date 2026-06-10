# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is this

nah.tools — free, open-source browser tools that replace predatory SaaS. Tools include: QR code generator (static + dynamic), PDF tools (merge, split, compress, rotate, watermark, etc.), PowerPoint tools (merge, split, compress, extract, watermark, etc.), photo tools (compress, filters, background removal), link shortener with analytics, resume builder with ATS analysis, data broker removal, email signature generator, image format converter (HEIC/WebP/AVIF/SVG/etc.), video/audio tools (trim, compress, convert via FFmpeg.wasm), and legal document generator (privacy policy, ToS, cookie policy, DMCA). Most tools run entirely client-side. Dynamic features (short links, dynamic QR redirects) use Cloudflare Workers + D1, passphrase-protected and editable.

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

- **Tailwind CSS v4** via Vite plugin (theme tokens in `src/app.css` under `@theme`)
- **Cloudflare D1** (SQLite) for dynamic QR code redirects
- **Vitest** — `bun run test` (co-located `.test.ts` files)

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

### PPTX processing (client-side only)

All in `src/lib/pptx/` — client-side PPTX manipulation via JSZip + DOMParser:
- `types.ts` — shared type definitions (SlideRange, WatermarkConfig, PptxMetadata, etc.)
- `processor.ts` — all processing functions (merge, split, compress, extract, watermark, etc.)
- `exporter.ts` — download helpers (downloadPPTX, downloadAsZip)

PPTX files are ZIP archives of XML (ECMA-376 Open XML). The processor opens them with JSZip, parses/modifies XML with DOMParser/XMLSerializer, and re-zips. No new dependencies — uses JSZip (already installed).

### Email signature generation (client-side only)

All in `src/lib/signature/`:
- `types.ts` — SignatureData, TemplateId, SocialLink, SocialPlatform
- `templates.ts` — 5 HTML table generators (professional, minimal, creative, corporate, compact)
- `renderer.ts` — dispatches data + template -> HTML string, XSS-safe escaping, social icon SVG data URIs
- `exporter.ts` — copyHtml (clipboard text), copyRichText (ClipboardItem text/html for paste-into-Gmail), downloadHtm

All signature HTML uses `<table>` layout with inline styles only — no CSS classes, no `<div>`, no `<style>` blocks. This is required for email client compatibility (Gmail, Outlook, Apple Mail). Fonts are limited to web-safe stacks. Social icons and photos are embedded as base64 data URIs.

### Image format conversion (client-side only)

Extends the existing compression worker at `src/lib/compress/worker.ts` with a `convert()` function. All in `src/lib/convert/`:
- `types.ts` — ConversionPair, ConversionResult
- `pairs.ts` — registry of 17 conversion pairs with metadata (slug, accept types, SEO text, codec mapping)
- `client.ts` — Comlink wrapper calling the extended compress worker

Supported conversion matrix uses `@jsquash/*` codecs (JPEG, PNG, WebP, AVIF, JXL, OxiPNG), `heic2any` for HEIC/HEIF, and `createImageBitmap()` fallback for BMP/GIF/TIFF. SVG rasterization via OffscreenCanvas. The dynamic route `/convert/[pair]` validates slugs against the pairs registry.

### Legal document generation (client-side only)

All in `src/lib/legal-gen/`:
- `types.ts` — BusinessInfo, DataCollectionConfig, ThirdPartyConfig, LegalGenInput
- `templates/` — conditional section generators per document type (privacy-policy, terms-of-service, cookie-policy, dmca-notice)
- `templates/helpers.ts` — shared utilities (date formatting, third-party service descriptions)
- `renderer.ts` — minimal markdown-to-HTML converter (~60 LOC, handles headings/lists/bold/italic/links)
- `exporter.ts` — copyText, downloadMarkdown, downloadHtml, downloadPdf (via pdfmake)

Templates are collections of conditional sections, not monolithic strings. Jurisdiction-specific sections (GDPR, CCPA, COPPA, UK) are included based on the selected jurisdiction. Third-party service sections auto-populate when toggled (Google Analytics, Stripe, Mailchimp, etc.).

### Video/audio processing (client-side only, FFmpeg.wasm)

All in `src/lib/media/`:
- `types.ts` — TrimConfig, VideoCompressConfig, AudioCompressConfig, GifConfig, ProcessingProgress, MediaResult
- `ffmpeg-loader.ts` — singleton FFmpeg.wasm loader with progress reporting
- `presets.ts` — video compression presets (email/social/web), audio bitrate options
- `processor.ts` — 6 processor functions (compressVideo, trimVideo, trimAudio, compressAudio, videoToGif, extractAudio)

Uses `@ffmpeg/ffmpeg` + `@ffmpeg/util`. The WASM binary (~25MB) loads from CDN on first use, cached by browser afterward. FFmpeg.wasm runs its own internal Web Worker — no double-worker wrapping needed. Progress is reported via FFmpeg's `on('progress')` callback. Each processor function registers and deregisters its own progress listener to avoid accumulation bugs.

### MCP server (Model Context Protocol)

Modular MCP server in `src/lib/server/mcp/` exposes 30+ tools to AI agents via streamable HTTP at `/mcp`:
- `index.ts` — server factory, registers all tool modules
- `pdf.ts` — 14 PDF tools (merge, split, rotate, reorder, remove pages, watermark, page numbers, protect, unlock, flatten, crop, compress, set metadata, get info) via `@cantoo/pdf-lib`
- `pptx.ts` — 9 PPTX tools (merge, split, compress, extract text, remove notes, remove animations, watermark, set metadata, get info) via JSZip + DOMParser
- `qr.ts` — QR encoding for all 7 content types (URL, WiFi, vCard, email, phone, SMS, text)
- `invoice.ts` — invoice calculation (line items, multi-tax, compound tax, discounts)
- `removal.ts` — 6 data broker removal tools + resources + prompts

The `/mcp` route has both `+page.svelte` (landing page for browsers) and `+server.ts` (MCP protocol handler for agents). SvelteKit routes browser GETs to the page and JSON/SSE requests to the server.

File-based tools (PDF, PPTX) accept/return base64-encoded data. The server is stateless — no sessions, no storage, no auth required.

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
- `GET|POST|DELETE /mcp` — MCP protocol endpoint (streamable HTTP)

### Pages

- `/` — tool picker landing page (links to all tools)
- `/mcp` — MCP server landing page (setup docs, tool listing, capabilities)
- `/qr` — QR code generator (all 7 types, live preview, style customization, download, batch, dynamic)
- `/qr/manage/[code]` — passphrase-protected dynamic QR management UI
- `/qr/wifi`, `/qr/vcard`, `/qr/email`, `/qr/phone`, `/qr/sms` — SEO/GEO landing pages with FAQPage schema
- `/links` — URL shortener / custom link creator with analytics, UTM builder, bulk creation
- `/links/manage/[code]` — passphrase-protected link management with click analytics dashboard
- `/pptx` — PowerPoint tool hub (links to all PPTX tools)
- `/pptx/merge` — merge multiple PPTX files
- `/pptx/split` — extract slide ranges or individual slides
- `/pptx/compress` — reduce file size by compressing images
- `/pptx/extract-images` — pull all embedded images
- `/pptx/extract-text` — slide-by-slide text extraction
- `/pptx/remove-notes` — strip speaker notes
- `/pptx/watermark` — add text watermark to all slides
- `/pptx/remove-animations` — strip animations and transitions
- `/pptx/slide-numbers` — add slide numbers
- `/pptx/metadata` — view and edit title, author, properties
- `/signature` — email signature generator (5 templates, live preview, copy/download)
- `/convert` — image format converter hub (links to all conversion pairs)
- `/convert/[pair]` — individual conversion page (e.g., `/convert/heic-to-jpg`, `/convert/webp-to-png`)
- `/media` — video/audio tool hub (links to all media tools)
- `/media/compress-video` — video compressor with presets (email, social, web, custom)
- `/media/trim-video` — video trimmer with HTML5 preview and time range selection
- `/media/trim-audio` — audio trimmer with HTML5 preview
- `/media/compress-audio` — audio compressor (MP3, AAC, OGG output, bitrate selection)
- `/media/video-to-gif` — video to GIF with FPS, width, and time range controls
- `/media/extract-audio` — extract audio track from video
- `/legal-gen` — legal document generator hub (links to 4 document types)
- `/legal-gen/privacy-policy` — privacy policy generator with GDPR/CCPA/COPPA sections
- `/legal-gen/terms-of-service` — terms of service generator
- `/legal-gen/cookie-policy` — cookie policy generator with third-party service tracking
- `/legal-gen/dmca-notice` — DMCA notice generator
- `/remove/agent` — redirects to `/mcp` (301)
- `/why` — expose article about QR code industry
- `/compare` — competitor comparison table
- `/privacy`, `/terms` — legal pages

### Path aliases

Defined in `svelte.config.js`: `$components`, `$qr`, `$pdf`, `$pptx`, `$signature`, `$convert`, `$media`, `$legalgen`, `$server`, `$utils`

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

See [`docs/design.md`](docs/design.md) — users, brand personality, aesthetic direction, color system, design principles.
