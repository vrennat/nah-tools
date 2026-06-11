<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import ToolShell from '$components/ToolShell.svelte';
	import type { OCRProgress } from '$pdf/ocr';

	const LANGUAGES = [
		{ code: 'eng', name: 'English' },
		{ code: 'spa', name: 'Spanish' },
		{ code: 'fra', name: 'French' },
		{ code: 'deu', name: 'German' },
		{ code: 'por', name: 'Portuguese' },
		{ code: 'ita', name: 'Italian' },
		{ code: 'chi_sim', name: 'Chinese (Simplified)' },
		{ code: 'jpn', name: 'Japanese' },
		{ code: 'kor', name: 'Korean' },
		{ code: 'ara', name: 'Arabic' },
		{ code: 'hin', name: 'Hindi' },
		{ code: 'rus', name: 'Russian' }
	];

	let files = $state<File[]>([]);
	let language = $state('eng');
	let processing = $state(false);
	let error = $state('');
	let progress = $state<OCRProgress | null>(null);
	let result = $state<{
		wordsFound: number;
		pageCount: number;
		originalSize: number;
		newSize: number;
	} | null>(null);

	let file = $derived(files[0]);
	let canProcess = $derived(!!file && !processing);

	function formatSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}

	function progressLabel(p: OCRProgress): string {
		const phaseLabels = {
			rendering: 'Rendering',
			recognizing: 'Recognizing text',
			embedding: 'Embedding text'
		};
		const pct = Math.round(p.pageProgress * 100);
		return `Page ${p.page}/${p.totalPages} — ${phaseLabels[p.phase]}${p.phase === 'recognizing' ? ` (${pct}%)` : ''}`;
	}

	async function process() {
		if (!canProcess || !file) return;
		processing = true;
		error = '';
		result = null;
		progress = null;

		try {
			const { ocrPDF } = await import('$pdf/ocr');
			const { downloadPDF, makeFilename } = await import('$pdf/exporter');

			const buf = await file.arrayBuffer();
			const originalSize = buf.byteLength;

			const ocrResult = await ocrPDF(buf, { language }, (p) => {
				progress = p;
			});

			result = {
				wordsFound: ocrResult.wordsFound,
				pageCount: ocrResult.pageCount,
				originalSize,
				newSize: ocrResult.pdfBytes.byteLength
			};

			downloadPDF(ocrResult.pdfBytes, makeFilename('ocr', 'pdf'));
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to process PDF';
		} finally {
			processing = false;
			progress = null;
		}
	}

	const faqs = [
		{
			question: 'What OCR engine does this use?',
			answer:
				'The tool uses Tesseract.js, which is a WebAssembly port of the Tesseract OCR engine — the same engine originally developed at HP Labs and now maintained by Google. It runs entirely in your browser; no cloud OCR API is called.'
		},
		{
			question: 'Why does it take so long?',
			answer:
				'OCR is computationally intensive. Tesseract.js typically takes 15-60 seconds per page depending on page complexity and your device speed. The first use also downloads language data (~4 MB per language), which is cached for future sessions.'
		},
		{
			question: 'What does the output PDF look like?',
			answer:
				'The output is visually identical to the original — your scanned images are preserved exactly as they appear. An invisible text layer is added beneath the images. This makes the text selectable, copyable, and searchable without altering the visual appearance.'
		},
		{
			question: 'Which languages are supported?',
			answer:
				'English, Spanish, French, German, Portuguese, Italian, Chinese (Simplified), Japanese, Korean, Arabic, Hindi, and Russian. Select the language that matches your document before processing for best accuracy.'
		},
		{
			question: 'Will OCR work on a PDF that already has text?',
			answer:
				'The tool will still process it, adding an additional text layer. For PDFs that already contain selectable text, OCR is unnecessary — use the PDF to CSV tool to extract structured data, or simply open and copy text from the existing text layer.'
		}
	];
</script>

<ToolShell
	path="/pdf/ocr"
	tagline="Add an invisible text layer to scanned PDFs so they become searchable and selectable."
	seoTitle="OCR PDF Free — Make Scanned PDFs Searchable | nah.tools"
	description="Make scanned PDFs searchable by adding an invisible text layer using OCR. Free, no upload — processed entirely in your browser."
	{faqs}
>
	<section class="mx-auto max-w-2xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<FileDropZone accept=".pdf" acceptPendingFile={true} bind:files label="Drop a scanned PDF here or click to browse" />

			{#if file}
				<div class="mt-4">
					<label for="language" class="mb-1 block text-sm font-medium text-text">Language</label>
					<select
						id="language"
						bind:value={language}
						disabled={processing}
						class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
					>
						{#each LANGUAGES as lang}
							<option value={lang.code}>{lang.name}</option>
						{/each}
					</select>
				</div>
			{/if}

			<div class="mt-4 rounded-lg border border-border bg-surface-alt px-4 py-3">
				<p class="text-sm text-text-muted">
					OCR adds an invisible text layer over scanned pages, making them searchable and
					selectable. First use downloads language data (~4 MB, cached for future use). Processing
					takes 15-60 seconds per page.
				</p>
			</div>

			{#if progress}
				<div class="mt-4">
					<div class="mb-1 text-sm text-text-muted">{progressLabel(progress)}</div>
					<div class="h-2 w-full overflow-hidden rounded-full bg-surface-alt">
						<div
							class="h-full rounded-full bg-accent transition-all duration-300"
							style="width: {((progress.page - 1 + progress.pageProgress) / progress.totalPages) * 100}%"
						></div>
					</div>
				</div>
			{/if}

			{#if result}
				<div class="mt-4 rounded-lg bg-success/10 px-4 py-3">
					<p class="text-sm font-medium text-success">
						{result.wordsFound.toLocaleString()} words recognized across {result.pageCount} pages
					</p>
					<p class="mt-1 text-xs text-success/80">
						{formatSize(result.originalSize)} → {formatSize(result.newSize)}
					</p>
				</div>
			{/if}

			{#if error}
				<p class="mt-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
			{/if}

			<div class="mt-6">
				<button
					type="button"
					class="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
					disabled={!canProcess}
					onclick={process}
				>
					{#if processing}
						Processing...
					{:else if !file}
						Upload a PDF to OCR
					{:else}
						Make Searchable
					{/if}
				</button>
			</div>
		</div>

		<div class="space-y-4 rounded-xl border border-border bg-surface-alt p-6">
			<h2 class="font-display text-lg font-700">OCR for scanned PDFs, entirely in your browser</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				Scanned PDFs are essentially image files wrapped in a PDF container. The pages
				look like documents but contain no selectable text — you can't search them,
				copy from them, or process their content programmatically. OCR (Optical Character
				Recognition) fixes this by analyzing the image and inferring where text is,
				then embedding that text as an invisible layer in the PDF.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				This tool uses <strong class="font-medium text-text">Tesseract.js</strong>, a
				WebAssembly build of the Tesseract OCR engine. Everything runs locally —
				your scanned pages are never transmitted to a cloud service. On first use,
				the language data (~4 MB for English) downloads from a CDN and is cached in
				your browser for subsequent sessions.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				Processing is slow by nature — expect 15 to 60 seconds per page depending on
				complexity. The output PDF looks identical to the input but gains a searchable
				text layer, making it compatible with PDF search, screen readers, and tools
				like PDF to CSV.
			</p>
		</div>
	</section>
</ToolShell>
