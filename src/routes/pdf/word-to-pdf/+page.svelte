<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import ProgressBar from '$components/pdf/ProgressBar.svelte';
	import ToolShell from '$components/ToolShell.svelte';
	import type { PageSize, MarginPreset } from '$pdf/converter';

	let files = $state<File[]>([]);
	let pageSize = $state<PageSize>('a4');
	let marginPreset = $state<MarginPreset>('normal');
	let processing = $state(false);
	let progress = $state({ current: 0, total: 0 });
	let error = $state('');
	let previewHtml = $state('');
	let loadingPreview = $state(false);

	let canConvert = $derived(files.length > 0 && !processing);

	// Load preview when first file changes
	$effect(() => {
		const file = files[0];
		if (!file) {
			previewHtml = '';
			return;
		}

		loadingPreview = true;
		file
			.arrayBuffer()
			.then(async (buf) => {
				const { docxToHtml } = await import('$pdf/converter');
				previewHtml = await docxToHtml(buf);
			})
			.catch(() => {
				previewHtml = '<p style="color: #94a3b8;">Could not preview this document.</p>';
			})
			.finally(() => {
				loadingPreview = false;
			});
	});

	async function convert() {
		if (!canConvert) return;
		processing = true;
		error = '';
		progress = { current: 0, total: files.length };

		try {
			const { docxToPDF, batchDocxToPDF } = await import('$pdf/converter');
			const { downloadBlob, makeFilename } = await import('$pdf/exporter');

			if (files.length === 1) {
				const file = files[0];
				const buf = await file.arrayBuffer();
				const blob = await docxToPDF(buf, pageSize, marginPreset);
				const pdfName = file.name.replace(/\.(docx?|DOCX?)$/, '.pdf');
				downloadBlob(blob, pdfName);
				progress = { current: 1, total: 1 };
			} else {
				const results = await batchDocxToPDF(files, pageSize, marginPreset, (current, total) => {
					progress = { current, total };
				});

				if (results.length === 1) {
					downloadBlob(results[0].blob, results[0].name);
				} else {
					// Package as ZIP
					const { downloadAsZip } = await import('$pdf/exporter');
					const zipFiles = results.map((r) => ({
						name: r.name,
						data: r.blob
					}));
					await downloadAsZip(zipFiles, makeFilename('word-to-pdf', 'zip'));
				}
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to convert document';
		} finally {
			processing = false;
		}
	}

	const faqs = [
		{
			question: 'What Word formats are supported?',
			answer:
				'The tool accepts .docx and .doc files. DOCX (the modern Office Open XML format) is fully supported. Older .doc (binary Word 97-2003) files are accepted but may have limited formatting fidelity depending on the features used.'
		},
		{
			question: 'How faithfully does the conversion preserve formatting?',
			answer:
				'The converter handles headings, paragraphs, bold, italic, underline, bullet lists, numbered lists, tables, and embedded images. Complex features like tracked changes, comments, custom styles, text boxes, and advanced table formatting may not convert accurately. The live preview helps you check the result before downloading.'
		},
		{
			question: 'Can I convert multiple files at once?',
			answer:
				'Yes. Drop multiple DOCX files to convert them in a batch. If you add more than one file, the results are packaged as a ZIP archive with each PDF named to match its source document.'
		},
		{
			question: 'What do A4 vs Letter and the margin options do?',
			answer:
				'These control the output page dimensions and margins. A4 (210 × 297 mm) is standard in most of the world; Letter (8.5 × 11 in) is standard in North America. Normal margins are 1 inch, narrow are 0.5 in, and wide are 1.5 in.'
		},
		{
			question: 'Are my files uploaded?',
			answer:
				'No. Conversion runs entirely in your browser using a client-side DOCX parsing library. Your Word documents never leave your device.'
		}
	];
</script>

<ToolShell
	path="/pdf/word-to-pdf"
	tagline="Convert DOCX files to PDF with formatting preserved. Batch convert multiple files at once."
	seoTitle="Word to PDF Free — DOCX Converter | nah.tools"
	description="Convert DOCX files to PDF for free. Supports headings, lists, tables, and images. 100% client-side — files never leave your device."
	{faqs}
>
	<section class="mx-auto max-w-2xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<FileDropZone
				accept=".docx,.doc"
				multiple={true}
				bind:files
				label="Drop Word documents here or click to browse"
			/>

			{#if files.length > 0}
				<div class="mt-4 grid grid-cols-2 gap-4">
					<div>
						<label for="pageSize" class="mb-1 block text-sm font-medium text-text"
							>Page size</label
						>
						<select
							id="pageSize"
							bind:value={pageSize}
							class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
						>
							<option value="a4">A4</option>
							<option value="letter">Letter</option>
						</select>
					</div>
					<div>
						<label for="margins" class="mb-1 block text-sm font-medium text-text"
							>Margins</label
						>
						<select
							id="margins"
							bind:value={marginPreset}
							class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
						>
							<option value="normal">Normal (1 in)</option>
							<option value="narrow">Narrow (0.5 in)</option>
							<option value="wide">Wide (1.5 in)</option>
						</select>
					</div>
				</div>
			{/if}

			{#if previewHtml && files.length > 0}
				<div class="mt-4">
					<p class="mb-2 text-sm font-medium text-text">Preview</p>
					<div
						class="max-h-64 overflow-y-auto rounded-lg border border-border bg-white p-4 text-sm text-gray-900 dark:bg-slate-800 dark:text-slate-100"
					>
						{@html previewHtml}
					</div>
				</div>
			{:else if loadingPreview && files.length > 0}
				<div
					class="mt-4 flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/5 px-3 py-2 text-sm text-text-muted"
				>
					<div
						class="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent"
					></div>
					Loading preview...
				</div>
			{/if}

			{#if error}
				<p class="mt-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
			{/if}

			{#if processing}
				<div class="mt-4">
					<ProgressBar current={progress.current} total={progress.total} />
				</div>
			{/if}

			<div class="mt-6">
				<button
					type="button"
					class="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
					disabled={!canConvert}
					onclick={convert}
				>
					{#if processing}
						Converting...
					{:else if files.length === 0}
						Upload a Word document
					{:else if files.length === 1}
						Convert to PDF
					{:else}
						Convert {files.length} files to PDF
					{/if}
				</button>
			</div>
		</div>

		<div class="space-y-4 rounded-xl border border-border bg-surface-alt p-6">
			<h2 class="font-display text-lg font-700">Convert Word documents to PDF without uploading</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				Converting a DOCX to PDF is a routine task that most people accomplish either
				by opening Word and using File > Save As, or by uploading to a conversion service.
				Both work, but the upload route passes your document — which may contain confidential
				business content, contracts, or personal data — through a third-party server.
				This tool converts entirely in your browser, so your documents stay on your device.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				A live preview shows how the document will render before you convert. The converter
				handles common formatting — headings, paragraphs, bold, italic, bullet and numbered
				lists, tables, and embedded images. Choose A4 or Letter page size and set margins
				to Normal, Narrow, or Wide to match your target layout. For batch work, drop
				multiple files at once and download all the converted PDFs as a ZIP.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				Highly complex documents with advanced table styles, tracked changes, or custom
				theme fonts may have limited fidelity — check the preview to confirm the output
				looks correct before distributing.
			</p>
		</div>
	</section>
</ToolShell>
