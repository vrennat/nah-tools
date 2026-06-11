<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import ProgressBar from '$components/pdf/ProgressBar.svelte';
	import ToolShell from '$components/ToolShell.svelte';
	import NextSteps from '$components/pdf/NextSteps.svelte';
	import type { PageRange } from '$pdf/types';

	let files = $state<File[]>([]);
	let rangeText = $state('');
	let splitMode = $state<'ranges' | 'individual'>('ranges');
	let processing = $state(false);
	let error = $state('');
	let pageCount = $state(0);
	let lastResult = $state<{ bytes: Uint8Array | null; name: string; singlePdf: boolean } | null>(null);

	let file = $derived(files[0]);

	$effect(() => {
		if (!file) {
			pageCount = 0;
			lastResult = null;
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
		lastResult = null;

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
				const name = makeFilename('split', 'pdf');
				downloadPDF(results[0], name);
				lastResult = { bytes: results[0], name, singlePdf: true };
			} else {
				const zipFiles = results.map((data, i) => ({
					name: `pages-${ranges[i].start}${ranges[i].end !== ranges[i].start ? `-${ranges[i].end}` : ''}.pdf`,
					data
				}));
				const zipName = makeFilename('split-pages', 'zip');
				await downloadAsZip(zipFiles, zipName);
				lastResult = { bytes: null, name: zipName, singlePdf: false };
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to split PDF';
		} finally {
			processing = false;
		}
	}

	const faqs = [
		{
			question: 'Are my files uploaded when I split a PDF?',
			answer:
				'No. Splitting happens entirely in your browser. Your PDF is never transmitted to a server — the tool reads the file locally and processes it with JavaScript.'
		},
		{
			question: 'How do I specify page ranges?',
			answer:
				'Enter comma-separated ranges in the format "1-3, 5, 8-12". Each range becomes a separate PDF. If you specify a single range, you get one PDF; multiple ranges are packaged as a ZIP.'
		},
		{
			question: 'What does "Individual pages" mode do?',
			answer:
				'Individual pages mode extracts every page as its own PDF and packages them all into a single ZIP file for download. Useful when you need each page separately.'
		},
		{
			question: 'Is there a page count limit?',
			answer:
				'There is no enforced limit. The tool reads the full PDF in memory, so very large documents may be slow on low-memory devices, but no hard cap is imposed.'
		},
		{
			question: 'Will my split PDFs have the same quality as the original?',
			answer:
				'Yes. The tool uses pdf-lib to copy pages without re-encoding them, so there is no quality loss. Images, fonts, and vector content are preserved exactly as in the source.'
		}
	];
</script>

<ToolShell
	path="/pdf/split"
	tagline="Extract page ranges or individual pages from any PDF. No upload needed."
	seoTitle="Split PDF Online Free — Extract Pages Instantly | nah.tools"
	description="Split PDF files into separate documents. Extract page ranges or individual pages. Free, no upload — processed in your browser."
	{faqs}
>
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

		{#if lastResult}
			<NextSteps path="/pdf/split" resultBytes={() => lastResult?.bytes ?? null} resultName={lastResult.name} singlePdf={lastResult.singlePdf} />
		{/if}

		<div class="space-y-4 rounded-xl border border-border bg-surface-alt p-6">
			<h2 class="font-display text-lg font-700">When do you need to split a PDF?</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				PDFs accumulate pages over time — reports grow, forms get combined, presentations get merged.
				Splitting lets you extract exactly the pages you need without re-creating the document from
				scratch.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				Common use cases: extracting a single chapter from a large report, separating invoices that
				were merged for archival, pulling the signature page from a contract, or distributing
				individual slides from a presentation exported as PDF.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				Use <strong class="font-medium text-text">custom ranges</strong> when you need specific sections
				(e.g. pages 1-5 and 12-18 as two separate files) or
				<strong class="font-medium text-text">individual pages</strong> when you need every page as its
				own document. Multiple outputs are automatically packaged as a ZIP.
			</p>
		</div>
	</section>
</ToolShell>
