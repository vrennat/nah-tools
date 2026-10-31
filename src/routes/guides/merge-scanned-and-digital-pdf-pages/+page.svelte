<script lang="ts">
	import ArticleShell from '$components/ArticleShell.svelte';

	const faqs = [
		{
			question: 'Does merging PDFs make a scanned page searchable?',
			answer:
				'No — merging just combines pages into one file, it doesn\'t change what\'s on them. A scanned page stays a picture of text, not real text, until you run OCR on it separately.'
		},
		{
			question: 'Will OCR mess up the pages that are already digital text?',
			answer:
				'The tool skips pages with more than 50 extracted characters. That is a heuristic: a short digital page may still be processed, and a scanned page with a text header may be skipped. Review the output, especially for mixed-content pages.'
		},
		{
			question: 'Does OCR replace the scanned page with plain text?',
			answer:
				'It preserves the original page and attempts to add invisible recognized text. OCR can misread words or omit characters, so verify search and copy results in the downloaded PDF.'
		},
		{
			question: 'How long does OCR take?',
			answer:
				'Processing time varies with page complexity, language, and device. The OCR engine and selected language data may need network downloads; browser caching is not guaranteed.'
		}
	];
</script>

<ArticleShell
	path="/guides/merge-scanned-and-digital-pdf-pages"
	dek="Combining a scanned document with a digital one into a single PDF is easy. Making the scanned pages actually searchable takes one extra step."
	seoTitle="How to Merge Scanned and Digital PDF Pages Into One File | nah"
	description="Merge a scanned document and a digital PDF into a single file, then run OCR so the scanned pages become searchable text too. Free, in your browser."
	publishedDate="2026-07-28"
	{faqs}
>
	<section class="space-y-4">
		<h2 class="font-display text-2xl font-700 text-text">The problem</h2>
		<p class="leading-relaxed text-text-muted">
			A common situation: you have a signed page from a scanner or a phone photo — which a PDF
			treats as a picture, not text — and a digital PDF that was exported directly with real,
			selectable text. You want both in one file. Combining them is trivial. But if you stop there,
			the scanned page stays exactly what it was: an image. You can't search it, select text from
			it, or copy anything out of it.
		</p>
	</section>

	<section class="space-y-4">
		<h2 class="font-display text-2xl font-700 text-text">Step 1: Merge the files</h2>
		<p class="leading-relaxed text-text-muted">
			Open <a href="/pdf/merge" class="text-accent underline hover:text-accent-hover">/pdf/merge</a>,
			drop in both files in the order you want them to appear, and download the combined PDF. Each
			source file's pages come through in their original order — merging doesn't touch the content
			of either file, it just concatenates them.
		</p>
	</section>

	<section class="space-y-4">
		<h2 class="font-display text-2xl font-700 text-text">Step 2: Make the scanned pages searchable</h2>
		<p class="leading-relaxed text-text-muted">
			Take the merged file to <a href="/pdf/ocr" class="text-accent underline hover:text-accent-hover">/pdf/ocr</a>.
			It runs Tesseract.js — a WebAssembly build of the same open-source OCR engine originally built
			at HP Labs — entirely in your browser, attempting to add invisible recognized text to pages it processes. OCR results can contain
			errors or missing characters; test search and copy in the downloaded PDF. Processing time
			depends on page complexity and your device.
		</p>
	</section>

	<section class="space-y-4">
		<h2 class="font-display text-2xl font-700 text-text">Why merge first, then OCR the whole thing</h2>
		<p class="leading-relaxed text-text-muted">
			You can run OCR on the combined file, but its page detection is approximate: it skips a page
			when more than 50 characters can already be extracted. A short digital page may receive
			duplicate text, while a scan with a digital header may be skipped. For mixed documents,
			consider OCR on the scanned file first, review its output, and then merge. Keep your originals.
		</p>
	</section>
</ArticleShell>
