<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import PdfToolLayout from '$components/pdf/PdfToolLayout.svelte';
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
</script>

<svelte:head>
	<title>OCR PDF — Make Scanned PDFs Searchable | nah</title>
	<meta
		name="description"
		content="Make scanned PDFs searchable by adding an invisible text layer using OCR. Free, no upload — processed entirely in your browser."
	/>
</svelte:head>

<PdfToolLayout
	title="OCR PDF"
	description="Make scanned PDFs searchable by recognizing text and adding a searchable layer."
>
	<section class="mx-auto max-w-2xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<FileDropZone accept=".pdf" bind:files label="Drop a scanned PDF here or click to browse" />

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
							class="h-full rounded-full bg-accent transition-all duration-200"
							style="width: {((progress.page - 1 + progress.pageProgress) / progress.totalPages) * 100}%"
						></div>
					</div>
				</div>
			{/if}

			{#if result}
				<div role="alert" class="mt-4 rounded-lg bg-success/10 px-3 py-2">
					<p class="text-sm font-medium text-success">
						{result.wordsFound.toLocaleString()} words recognized across {result.pageCount} pages
					</p>
					<p class="mt-1 text-xs text-success/80">
						{formatSize(result.originalSize)} → {formatSize(result.newSize)}
					</p>
				</div>
			{/if}

			{#if error}
				<p role="alert" class="mt-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
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

		<p class="text-center text-xs text-text-muted">
			<a href="/pdf" class="underline hover:text-accent">Back to all PDF tools</a>
		</p>
	</section>
</PdfToolLayout>
