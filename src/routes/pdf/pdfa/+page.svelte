<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import PdfToolLayout from '$components/pdf/PdfToolLayout.svelte';
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

	function formatSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}

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
</script>

<svelte:head>
	<title>Prepare for PDF/A Online Free | nah</title>
	<meta
		name="description"
		content="Add archival metadata, embed sRGB color profile, and strip JavaScript for PDF/A compliance. Free, no upload — processed in your browser."
	/>
</svelte:head>

<PdfToolLayout
	title="Prepare for PDF/A"
	description="Add archival metadata and strip non-compliant elements."
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

		<p class="text-center text-xs text-text-muted">
			<a href="/pdf" class="underline hover:text-accent">Back to all PDF tools</a>
		</p>
	</section>
</PdfToolLayout>
