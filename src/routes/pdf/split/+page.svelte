<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import ProgressBar from '$components/pdf/ProgressBar.svelte';
	import PdfToolLayout from '$components/pdf/PdfToolLayout.svelte';
	import type { PageRange } from '$pdf/types';

	let files = $state<File[]>([]);
	let rangeText = $state('');
	let splitMode = $state<'ranges' | 'individual'>('ranges');
	let processing = $state(false);
	let error = $state('');
	let pageCount = $state(0);

	let file = $derived(files[0]);

	$effect(() => {
		if (!file) {
			pageCount = 0;
			return;
		}
		const currentFile = file;
		pageCount = 0;
		currentFile.arrayBuffer().then(async (buf) => {
			if (file !== currentFile) return;
			const { getPageCount } = await import('$pdf/processor');
			const count = await getPageCount(buf);
			if (file !== currentFile) return;
			pageCount = count;
		}).catch((e) => {
			if (file !== currentFile) return;
			error = e instanceof Error ? e.message : 'Failed to read PDF';
		});
	});

	function parseRanges(text: string, max: number): PageRange[] | null {
		if (!text.trim()) return null;
		const ranges: PageRange[] = [];
		for (const part of text.split(',')) {
			const trimmed = part.trim();
			if (!trimmed) continue;
			const match = trimmed.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
			if (!match) return null;
			const start = parseInt(match[1]);
			const end = match[2] ? parseInt(match[2]) : start;
			if (start < 1 || end < start || end > max) return null;
			ranges.push({ start, end });
		}
		return ranges.length > 0 ? ranges : null;
	}

	let parsedRanges = $derived(
		splitMode === 'ranges' ? parseRanges(rangeText, pageCount) : null
	);

	let canSplit = $derived(
		!!file && pageCount > 0 && !processing && (splitMode === 'individual' || !!parsedRanges)
	);

	async function split() {
		if (!canSplit || !file) return;
		processing = true;
		error = '';

		try {
			const { splitPDF } = await import('$pdf/processor');
			const { downloadPDF, downloadAsZip, makeFilename } = await import('$pdf/exporter');
			const buf = await file.arrayBuffer();

			let ranges: PageRange[];
			if (splitMode === 'individual') {
				ranges = Array.from({ length: pageCount }, (_, i) => ({ start: i + 1, end: i + 1 }));
			} else {
				ranges = parsedRanges!;
			}

			const results = await splitPDF(buf, ranges);

			if (results.length === 1) {
				downloadPDF(results[0], makeFilename('split', 'pdf'));
			} else {
				const zipFiles = results.map((data, i) => ({
					name: `pages-${ranges[i].start}${ranges[i].end !== ranges[i].start ? `-${ranges[i].end}` : ''}.pdf`,
					data
				}));
				await downloadAsZip(zipFiles, makeFilename('split-pages', 'zip'));
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to split PDF';
		} finally {
			processing = false;
		}
	}
</script>

<svelte:head>
	<title>Split PDF Online Free — Extract Pages | nah</title>
	<meta
		name="description"
		content="Split PDF files into separate documents. Extract page ranges or individual pages. Free, no upload — processed in your browser."
	/>
</svelte:head>

<PdfToolLayout title="Split PDF" description="Extract pages or split into separate documents.">
	<section class="mx-auto max-w-2xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<FileDropZone accept=".pdf" bind:files label="Drop a PDF here or click to browse" />

			{#if file && pageCount > 0}
				<div class="mt-4 space-y-4">
					<p class="text-sm text-text-muted">{pageCount} pages detected</p>

					<div class="flex gap-3">
						<button
							type="button"
							class="rounded-full px-4 py-1.5 text-sm font-medium transition-colors {splitMode === 'ranges'
								? 'bg-accent text-white'
								: 'border border-border text-text hover:bg-surface-alt'}"
							onclick={() => (splitMode = 'ranges')}
						>
							Custom ranges
						</button>
						<button
							type="button"
							class="rounded-full px-4 py-1.5 text-sm font-medium transition-colors {splitMode === 'individual'
								? 'bg-accent text-white'
								: 'border border-border text-text hover:bg-surface-alt'}"
							onclick={() => (splitMode = 'individual')}
						>
							Individual pages
						</button>
					</div>

					{#if splitMode === 'ranges'}
						<div>
							<label for="ranges" class="mb-1 block text-sm font-medium text-text"
								>Page ranges</label
							>
							<input
								id="ranges"
								type="text"
								bind:value={rangeText}
								placeholder="e.g. 1-3, 5, 8-12"
								class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
							/>
							<p class="mt-1 text-xs text-text-muted">
								Comma-separated ranges. Each range becomes a separate PDF.
							</p>
						</div>
					{:else}
						<p class="text-sm text-text-muted">
							Each page will be extracted as a separate PDF and downloaded as a ZIP.
						</p>
					{/if}
				</div>
			{/if}

			{#if error}
				<p class="mt-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
			{/if}

			{#if processing}
				<div class="mt-4">
					<ProgressBar current={0} total={0} label="Splitting PDF..." />
				</div>
			{/if}

			<div class="mt-6">
				<button
					type="button"
					class="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
					disabled={!canSplit}
					onclick={split}
				>
					{#if processing}
						Splitting...
					{:else if !file}
						Upload a PDF to split
					{:else}
						Split PDF
					{/if}
				</button>
			</div>
		</div>

		<p class="text-center text-xs text-text-muted">
			<a href="/pdf" class="underline hover:text-accent">Back to all PDF tools</a>
		</p>
	</section>
</PdfToolLayout>
