<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import ProgressBar from '$components/pdf/ProgressBar.svelte';
	import PdfToolLayout from '$components/pdf/PdfToolLayout.svelte';
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
</script>

<svelte:head>
	<title>Convert Word to PDF Online Free | nah</title>
	<meta
		name="description"
		content="Convert DOCX files to PDF for free. Supports headings, lists, tables, and images. 100% client-side — files never leave your device."
	/>
</svelte:head>

<PdfToolLayout
	title="Word to PDF"
	description="Convert DOCX files to PDF. Supports text formatting, lists, tables, and images."
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

		<p class="text-center text-xs text-text-muted">
			<a href="/pdf" class="underline hover:text-accent">Back to all PDF tools</a>
		</p>
	</section>
</PdfToolLayout>
