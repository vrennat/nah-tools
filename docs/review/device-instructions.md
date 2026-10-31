# Device instructions review

Prepared 2026-10-31. Working branch: `feat/device-instructions`.

## Scope

The registry has 116 entries: 110 tools plus six guides. The old “116 tools” total incorrectly counted the guides. The homepage now labels 110 tools and six guides separately.

110 tools retain their existing URLs and functionality. Each has explicit browser steps, limitations, and Mac, Windows, iPhone/iPad, and Android answers. Where a verified native method is unavailable in this review, the platform answer uses the browser workflow. This does not claim that a native method cannot exist.

53 source-backed primary native/app alternatives cover 29 task routes. Three additional recording-only recipes are optional disclosures, not equivalents for arbitrary uploaded files or counted as primary native coverage. See `instruction-coverage.json` for every exact route and platform mapping. Android Google Photos and Pixel Recorder are labeled separate apps. Apple versions are explicit where controls vary. iPhone source recipes do not claim identical iPad navigation.

The homepage leads with everyday tasks and preserves the complete directory in server-rendered disclosures. Six existing guides were corrected against implementation. Policy drafts, resume checks, and broker requests no longer promise legal compliance, ATS outcomes, or automatic removal. PDF/PPTX copy now discloses the actual 100 MB per-file picker limit.

## Verification

- All 110 browser workflows match registered tool paths; no guide receives a tool instructions panel.
- Native methods require a source, checked date, steps, and caveat.
- Production build succeeds, prerendering the existing routes.
- Full test suite: 291 tests across 23 files passed, including OCR output/cleanup and recording-only alternative regressions.
- Svelte check: zero errors; three existing warnings (BrokerCard initial prop capture, two video-preview caption tracks).
- Local browser checks: task homepage, direct Mac platform anchor, Windows browser fallback, arrow-key navigation to iPhone guidance, and 390px phone-width layout.

## Limits and follow-up

Instructions are documentation-verified, not tested on physical Mac/Windows/iPhone/Android combinations. File processing, clipboard, downloads, model assets, and hosted APIs need device-specific smoke checks before claiming tested platform support. No user files were uploaded and no hosted records were created. No push, deployment, database migration, DNS, or domain move was performed.

Fixed two existing OCR defects: explicitly request `blocks: true` from Tesseract v7, and give PDF.js a copy of the input buffer because its worker transfer detaches the original before pdf-lib can load it. The regression harness models both v7’s text-only default and PDF.js buffer transfer, runs the real PDF embedding/export code, verifies a recognized word appears as a PDF text operator, and checks cleanup after recognition failure. Rasterization and recognition are controlled in that harness; it is not a full-engine recognition benchmark.



## Representative browser export smoke tests

Synthetic, nonpersonal fixtures only, through the local production preview in the desktop in-app browser. No phone QA is claimed. Tests exercise representative exports rather than every tool or input format.

| Category | Browser workflow | Output verification |
| --- | --- | --- |
| PDF | Merge two one-page PDFs | Downloaded PDF has two pages in alpha/beta order; `pdftotext` reads both labels. |
| PPTX | Remove notes from minimal one-slide OOXML fixture | Downloaded archive retains slide text; notes parts and slide relationship are absent. Not opened in PowerPoint. |
| Image | PNG to JPG | Downloaded JPEG decodes as 64×48. Output grew from 146 to 637 bytes, so conversion is not a size guarantee. |
| Media | Trim three-second PCM WAV to selected one-second range | Actual FFmpeg.wasm download/export succeeds. Output is valid WAV, 1.024 seconds; packet rounding is disclosed. A 0.9-second range on a one-second input remained one second. |
| Text | Replace both beta occurrences in alpha beta beta | Downloaded UTF-8 result is exactly alpha gamma gamma. |

Review fixes also narrow Word conversion to DOCX (legacy DOC must first be saved as DOCX), flattening to supported form fields/widgets, and audio trimming to codec/packet-boundary precision. Browser processing remains primary for arbitrary media; Voice Memos/Pixel Recorder recipes apply only to recordings already in those apps.


## Final OCR runtime verification

The first real browser attempt exposed a detached input buffer before recognition. After the buffer-copy correction, a fresh production build and real Tesseract OCR export succeeded: three words recognized on one image-only synthetic PDF page. `pdftotext` extracts **SMOKE CHECK 123** from the exported file; the input contains no selectable text. The output retains one page at 500 × 150 points. Poppler renders before/after at 1000 × 300 pixels are pixel-identical, confirming original page appearance is preserved for this fixture. See `smoke-results.json` for pixel checksums and artifact hashes; files are in `/tmp/nah-tools-smoke`.

Final source validation: production build passes; 291 tests across 23 files pass; Svelte check reports zero errors and three existing warnings. The built HTML includes all 110 tool panels, DOCX-only input acceptance, and optional recording-only disclosures. No publication or hosted record creation occurred. Real OCR recognition remains language/scan dependent; this one clean English fixture does not validate all languages, mixed pages, complex layouts, or phones.

Validation execution requests covered local checks/builds, synthetic fixtures, and loopback previews. Browser file selections used only `/tmp/nah-tools-smoke`. The temporary agent-owned previews are shut down at handoff. No approval denial remains pending.
