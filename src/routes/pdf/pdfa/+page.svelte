<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import ToolShell from '$components/ToolShell.svelte';
	import type { PdfAPreparationConfig } from '$pdf/types';

	let files = $state<File[]>([]);
	let processing = $state(false);
	let error = $state('');
	let warnings = $state<string[]>([]);
	let done = $state(false);

	let conformanceLevel = $state<PdfAPreparationConfig['conformanceLevel']>('PDF/A-1b');
	let title = $state('');

	let file = $derived(files[0]);
	let canPrepare = $derived(!!file && !processing);

	async function prepare() {
		if (!canPrepare || !file) return;
		processing = true;
		error = '';
		warnings = [];
		done = false;

		try {
			const { preparePdfA } = await import('$pdf/processor');
			const { downloadPDF, makeFilename } = await import('$pdf/exporter');

			const buf = await file.arrayBuffer();
			const result = await preparePdfA(buf, {
				conformanceLevel,
				title: title.trim() || undefined
			});

			warnings = result.warnings;
			done = true;
			downloadPDF(result.data, makeFilename('pdfa', 'pdf'));
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to prepare PDF for PDF/A';
		} finally {
			processing = false;
		}
	}

	const faqs = [
		{
			question: 'What does this tool actually do to make a PDF/A compliant?',
			answer:
				'It adds an XMP metadata stream with pdfaid:part and pdfaid:conformance entries, embeds an sRGB ICC color profile as an OutputIntent, sets the document title and producer metadata, and strips JavaScript actions from the catalog. It does not re-embed fonts or flatten transparency — those limitations are disclosed in the warnings after processing.'
		},
		{
			question: 'What is the difference between PDF/A-1b and PDF/A-2b?',
			answer:
				'PDF/A-1b (Part 1, Level B) is the most widely accepted archival format and prohibits transparency, JPEG 2000, and several other features. PDF/A-2b (Part 2, Level B) relaxes those restrictions — it allows transparency layers and JPEG 2000 compression. Choose PDF/A-1b for maximum compatibility with archival repositories; choose PDF/A-2b if your document uses transparency or JPEG 2000 images.'
		},
		{
			question: 'Will this tool guarantee the output passes PDF/A validation?',
			answer:
				'No. This tool performs best-effort preparation — it adds the required metadata and color profile, but it cannot re-embed missing fonts or flatten existing transparency. The output may still fail strict PDF/A validation if the source document has embedded font issues or prohibited features. Always validate the output with a tool like veraPDF before submitting to an archival system.'
		},
		{
			question: 'Why does the tool warn about fonts?',
			answer:
				'PDF/A requires all fonts used in the document to be fully embedded. This tool cannot re-embed fonts that were subset-embedded or omitted in the original file. The font warning appears for every output as a reminder to verify font embedding with a validator, not as a confirmation that fonts are missing.'
		},
		{
			question: 'Are my files sent to a server for processing?',
			answer:
				'No. All processing runs in your browser using pdf-lib. Your file is never uploaded anywhere.'
		}
	];
</script>

<ToolShell
	path="/pdf/pdfa"
	tagline="Add archival XMP metadata, embed an sRGB color profile, and strip JavaScript to prepare a PDF for long-term preservation."
	seoTitle="Prepare PDF for PDF/A Archival Format Free | nah.tools"
	description="Add archival metadata, embed sRGB color profile, and strip JavaScript for PDF/A compliance. Free, no upload — processed in your browser."
	{faqs}
>
	<section class="mx-auto max-w-2xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<FileDropZone accept=".pdf" bind:files label="Drop a PDF here or click to browse" />

			<div class="mt-4 space-y-4">
				<div>
					<label for="conformance" class="mb-1 block text-sm font-medium text-text">
						Conformance Level
					</label>
					<select
						id="conformance"
						bind:value={conformanceLevel}
						class="w-full rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					>
						<option value="PDF/A-1b">PDF/A-1b (most compatible)</option>
						<option value="PDF/A-2b">PDF/A-2b (allows JPEG2000, transparency)</option>
					</select>
				</div>

				<div>
					<label for="title" class="mb-1 block text-sm font-medium text-text">
						Document Title <span class="text-text-muted">(optional)</span>
					</label>
					<input
						id="title"
						type="text"
						bind:value={title}
						placeholder="Uses existing title if empty"
						class="w-full rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					/>
				</div>
			</div>

			<div class="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-200">
				<p class="font-medium">Preparation, not certification</p>
				<p class="mt-1">
					This tool prepares your PDF for PDF/A compliance by adding required metadata, embedding
					an sRGB color profile, and removing JavaScript. It cannot re-embed missing fonts or
					flatten transparency. Validate the output with a tool like
					<a
						href="https://verapdf.org/"
						target="_blank"
						rel="noopener noreferrer"
						class="underline hover:text-accent">veraPDF</a
					> before submission.
				</p>
			</div>

			{#if done}
				<div class="mt-4 rounded-lg bg-success/10 px-4 py-3">
					<p class="text-sm font-medium text-success">
						PDF/A preparation complete. File downloaded.
					</p>
				</div>
			{/if}

			{#if warnings.length > 0}
				<div class="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
					<p class="text-sm font-medium text-amber-700 dark:text-amber-300">Warnings</p>
					<ul class="mt-1 list-inside list-disc space-y-1 text-sm text-amber-700 dark:text-amber-200">
						{#each warnings as warning}
							<li>{warning}</li>
						{/each}
					</ul>
				</div>
			{/if}

			{#if error}
				<p class="mt-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
			{/if}

			<div class="mt-6">
				<button
					type="button"
					class="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
					disabled={!canPrepare}
					onclick={prepare}
				>
					{#if processing}
						Preparing...
					{:else if !file}
						Upload a PDF to prepare
					{:else}
						Prepare for PDF/A
					{/if}
				</button>
			</div>
		</div>

		<div class="space-y-4 rounded-xl border border-border bg-surface-alt p-6">
			<h2 class="font-display text-lg font-700">What PDF/A is and why it matters for archiving</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				PDF/A is an ISO standard (ISO 19005) designed for long-term digital preservation. The core
				idea is that a PDF/A file must be fully self-contained — all fonts embedded, color profiles
				declared, and no content that depends on external resources or runtime features like
				JavaScript. A reader should be able to render the document identically 50 years from now
				without any external dependencies.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				Government agencies, courts, libraries, and enterprise document management systems
				increasingly require PDF/A for archival submissions. Many DMS platforms reject PDFs that
				lack the required XMP metadata or color profile declarations.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				This tool handles the metadata and color profile steps — the most common reasons a standard
				PDF fails PDF/A validation. If your source document already has fonts fully embedded and no
				transparency, the output will typically pass validation. More complex documents may need
				additional processing in a full PDF/A conversion tool.
			</p>
		</div>
	</section>
</ToolShell>
