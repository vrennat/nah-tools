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
				'No. The OCR tool checks each page for existing text content first and skips any page that already has meaningful text — it only processes pages that are effectively images. Run it on the whole merged file and it leaves your already-digital pages untouched.'
		},
		{
			question: 'Does OCR replace the scanned page with plain text?',
			answer:
				'No, and this matters: it keeps the original scanned image exactly as it looks, and adds an invisible, searchable text layer underneath it. Visually nothing changes — you can now select and search the text that\'s really there.'
		},
		{
			question: 'How long does OCR take?',
			answer:
				'Roughly 15–60 seconds per page depending on how complex the page is and how fast your device is. The OCR engine\'s language data (~4MB) downloads once and is cached for next time.'
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
			at HP Labs — entirely in your browser, adding an invisible text layer under each scanned page
			so it becomes searchable and selectable while looking exactly the same. Expect roughly
			15–60 seconds per page depending on complexity and your device.
		</p>
	</section>

	<section class="space-y-4">
		<h2 class="font-display text-2xl font-700 text-text">Why merge first, then OCR the whole thing</h2>
		<p class="leading-relaxed text-text-muted">
			It's tempting to OCR the scanned file separately before merging, but there's no need — and
			running OCR on the combined file is actually simpler. The OCR tool checks each page for
			existing text before processing it, and skips any page that already has real text. Run it once
			on the merged file: the already-digital pages pass through untouched, and only the genuinely
			scanned pages get the OCR text layer added. One pass, correct result, no risk of degrading the
			pages that didn't need it.
		</p>
	</section>
</ArticleShell>
