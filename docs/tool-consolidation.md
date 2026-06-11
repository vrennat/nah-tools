# Tool Consolidation Design Pass

June 2026. Context: the site has grown to ~100 routes across 16 tool families
(qr, links, bio, pdf, pptx, signature, convert, media, audio, photo, dev, text,
legal-gen, resume, invoice, remove, mcp). The June 2026 audit surfaced the cost
of the current growth pattern: `formatSize` duplicated ~19 times, the sitemap
drifted ~25 routes behind reality, FFmpeg loader/cancel handling re-implemented
across 9 pages, and upload -> options -> process -> download logic copy-pasted
per tool page.

## The tension

SEO wants many thin doors: one URL per search intent ("compress pdf free",
"heic to jpg"), each with its own H1, copy, and FAQPage schema. That per-intent
URL structure is the moat — long-tail rankings accrue to specific pages over
time and do not transfer if pages merge.

Engineering wants few capable rooms: shared components, one processing engine
per media type, one place to add a tool.

These are not actually in conflict. The resolution is to separate the
*marketing surface* (URLs, copy, schema) from the *tool surface* (engines,
shells, state). Keep every URL forever; consolidate everything behind them.

## Recommendations, in order of leverage

### 1. Central tool registry

One `src/lib/registry.ts` (or per-family registries composed into one)
describing every tool: slug, family, title, meta description, H1, FAQ entries,
related-tool slugs, accept types, and the component/config that implements it.
`src/lib/convert/pairs.ts` is the in-repo proof of this pattern — 17 SEO pages
driven by one registry file.

Generate from the registry: the sitemap, hub page tool grids, the header nav,
the landing-page picker, and related-tools blocks. This kills the entire
"sitemap drifted 25 routes" bug class — a tool that exists is indexed, linked,
and navigable by construction.

### 2. Shared FileToolShell

`DevToolShell` and `TextToolShell` already exist for text-in/text-out tools.
Generalize the same idea for file-based families (pdf: ~25 pages, pptx: 10,
media: 6, audio: 4, photo: 7): dropzone -> options panel (snippet/slot) ->
progress -> result/download, with shared error handling, size formatting, and
object-URL lifecycle (all four were audit findings in per-page copies).

Each tool page then reduces to: SEO copy + registry config + an options
snippet. The code that remains per-page is exactly the content that
differentiates the page for search. Expect 50-70% page-code reduction in the
PDF family alone.

### 3. One engine, many doors

Audio processing currently lives in two families with two processor modules:
`/media/trim-audio|compress-audio|extract-audio` (`src/lib/media/processor.ts`)
and `/audio/convert|merge|normalize` (`src/lib/audio/processor.ts`), both on
the same FFmpeg singleton. The cancel-button fix had to touch 9 pages because
of this split. Unify the engine layer (one FFmpeg processor module, one
loader/cancel surface); keep all existing URLs pointing at the unified engine
with per-page presets. Same pattern applies to photo compression vs format
conversion (both already share the compress worker — finish the job).

Rule of thumb going forward: a new search intent gets a new URL; it should not
get a new engine.

### 4. Hub-and-spoke internal linking

Hubs (`/pdf`, `/media`, `/dev`, ...) exist but are thin link lists. Make them
content-bearing: intro copy, tool grid with one-line descriptions, a
family-level FAQ. Spokes cross-link 3-4 related spokes (from the registry
`related` field) and link back to the hub. Add BreadcrumbList schema
(hub -> tool) alongside the existing FAQPage schema. This builds topical
authority clusters so new long-tail pages inherit ranking power from the
family instead of starting cold.

### 5. Workbench as upsell, not replacement

Single-purpose pages convert search visitors best — they land, do the one
thing, leave. Do not funnel users into a mega-tool up front. Instead, after a
successful operation, offer "do more with this file": chain into `/pdf/edit`
(already exists) or suggest the next-most-common operation (split -> compress,
trim -> compress). Deepens sessions (a positive engagement signal) without
adding or diluting URLs.

### 6. SEO mechanics checklist

- `export const prerender = true` on every static tool page (~10 PDF pages
  currently missing it — they cold-start a Worker for no reason)
- Unique H1 + 150-300 words of intent-matching copy per page, server-rendered
- FAQPage schema per page (exists), add BreadcrumbList, HowTo where honest
- URLs are forever: if a tool moves families, 301 the old slug

## What NOT to do

- Do not merge or retire URLs to "clean up the IA" — rankings die with them.
- Do not move SEO copy inside client-only shells; it must be in server-rendered
  markup.
- Do not big-bang refactor. The main risk of this whole effort is regressing
  100 working pages for maintainability gains users never see. Migrate one
  family per PR, behind unchanged URLs, with visual parity and the test suite
  as the gate.

## Sequencing

1. Registry + generated sitemap/hub grids (no visual change, kills drift)
2. FileToolShell, migrate the PDF family first (largest duplication)
3. media/audio engine unification
4. Related-tools cross-links + breadcrumbs from registry
5. Workbench upsell hooks after successful operations
