<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import ProgressBar from '$components/pdf/ProgressBar.svelte';
	import ToolShell from '$components/ToolShell.svelte';
	import type { PageCompareResult } from '$pdf/types';

	let originalFiles = $state<File[]>([]);
	let revisedFiles = $state<File[]>([]);
	let results = $state<PageCompareResult[]>([]);
	let currentPage = $state(0);
	let viewMode = $state<'side-by-side' | 'overlay' | 'diff'>('side-by-side');
	let sliderPosition = $state(50);
	let loading = $state(false);
	let error = $state('');
	let progress = $state({ current: 0, total: 0 });
	let draggingSlider = $state(false);
	let overlayContainer: HTMLDivElement | undefined = $state();

	let canCompare = $derived(
		originalFiles.length > 0 && revisedFiles.length > 0 && !loading
	);
	let hasResults = $derived(results.length > 0);
	let currentResult = $derived(hasResults ? results[currentPage] : null);

	function diffBadgeColor(percent: number): string {
		if (percent < 1) return 'bg-green-500/15 text-green-600 dark:text-green-400';
		if (percent < 5) return 'bg-amber-500/15 text-amber-600 dark:text-amber-400';
		return 'bg-red-500/15 text-red-600 dark:text-red-400';
	}

	function diffBorderColor(percent: number): string {
		if (percent < 1) return 'border-green-500/30';
		if (percent < 5) return 'border-amber-500/30';
		return 'border-red-500/30';
	}

	async function compare() {
		if (!canCompare) return;
		loading = true;
		error = '';
		results = [];
		currentPage = 0;
		progress = { current: 0, total: 0 };

		try {
			const { comparePDFs } = await import('$pdf/comparator');

			const [origBuf, revBuf] = await Promise.all([
				originalFiles[0].arrayBuffer(),
				revisedFiles[0].arrayBuffer()
			]);

			results = await comparePDFs(origBuf, revBuf, undefined, (current, total) => {
				progress = { current, total };
			});

			if (results.length === 0) {
				error = 'No pages found in the provided PDFs.';
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to compare PDFs';
		} finally {
			loading = false;
		}
	}

	function handleSliderPointerDown(e: PointerEvent) {
		draggingSlider = true;
		(e.target as HTMLElement).setPointerCapture(e.pointerId);
		updateSlider(e);
	}

	function handleSliderPointerMove(e: PointerEvent) {
		if (!draggingSlider) return;
		updateSlider(e);
	}

	function handleSliderPointerUp() {
		draggingSlider = false;
	}

	function updateSlider(e: PointerEvent) {
		if (!overlayContainer) return;
		const rect = overlayContainer.getBoundingClientRect();
		const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
		sliderPosition = (x / rect.width) * 100;
	}

	const faqs = [
		{
			question: 'How does the visual diff work?',
			answer:
				'Both PDFs are rendered to images page by page. The diff view subtracts pixel values between the original and revised images, highlighting changed pixels in red while dimming unchanged areas. This is a pixel-level visual comparison — it detects any visual difference including text changes, layout shifts, image replacements, and formatting changes.'
		},
		{
			question: 'Are the files uploaded to a server for comparison?',
			answer:
				'No. Both PDFs are rendered entirely in your browser using pdfjs-dist. No files are transmitted to any server. The comparison runs locally using canvas pixel math.'
		},
		{
			question: 'What is the overlay view?',
			answer:
				'The overlay view shows both versions superimposed, with a draggable slider to reveal the original on the left and the revised version on the right. It is useful for spotting layout and content shifts by sliding between the two versions.'
		},
		{
			question: 'What does the percentage badge mean?',
			answer:
				'The percentage shows what fraction of the page\'s pixels changed between the two versions. Under 1% is green (nearly identical), 1–5% is amber (minor changes), and above 5% is red (significant differences). The percentage is approximate and depends on rendering resolution.'
		},
		{
			question: 'Can I compare PDFs with different page counts?',
			answer:
				'Yes. Pages are compared by index — page 1 of the original against page 1 of the revised, and so on. If the documents have different page counts, the comparison covers the pages they share in common and notes the difference in total pages.'
		}
	];
</script>

<ToolShell
	path="/pdf/compare"
	tagline="Upload two PDFs and get a pixel-level visual diff — side-by-side, overlay slider, or highlighted diff view."
	seoTitle="Compare PDFs Online Free — Visual Side-by-Side Diff | nah.tools"
	description="Compare two PDFs side-by-side with pixel-level visual diff. Free, no upload — files are compared in your browser."
	{faqs}
>
	{#if !hasResults}
		<section class="mx-auto max-w-3xl space-y-6">
			<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
				<div class="grid gap-6 sm:grid-cols-2">
					<div>
						<p class="mb-2 text-sm font-medium text-text">Original</p>
						<FileDropZone accept=".pdf" multiple={false} bind:files={originalFiles} label="Drop original PDF" />
					</div>
					<div>
						<p class="mb-2 text-sm font-medium text-text">Revised</p>
						<FileDropZone accept=".pdf" multiple={false} bind:files={revisedFiles} label="Drop revised PDF" />
					</div>
				</div>

				{#if error}
					<p class="mt-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
				{/if}

				{#if loading}
					<div class="mt-4">
						<ProgressBar current={progress.current} total={progress.total} label="Comparing page {progress.current} of {progress.total}..." />
					</div>
				{/if}

				<div class="mt-6">
					<button
						type="button"
						class="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
						disabled={!canCompare}
						onclick={compare}
					>
						{#if loading}
							Comparing...
						{:else if originalFiles.length === 0 || revisedFiles.length === 0}
							Add both PDFs to compare
						{:else}
							Compare PDFs
						{/if}
					</button>
				</div>
			</div>

			<div class="space-y-4 rounded-xl border border-border bg-surface-alt p-6">
				<h2 class="font-display text-lg font-700">When you need to know exactly what changed</h2>
				<p class="text-sm leading-relaxed text-text-muted">
					Contract revisions, regulatory filings, design proofs, technical documentation — any
					situation where you need to confirm that two versions of a PDF are either identical or
					understand precisely what differs. Text-based diff tools miss layout changes and image
					replacements. A trained eye misses subtle font or spacing shifts.
				</p>
				<p class="text-sm leading-relaxed text-text-muted">
					This tool renders both PDFs to images and computes a pixel-level diff, so it catches
					every visual difference regardless of whether it is text, an image, a border, or a
					spacing change. The overlay slider is particularly useful for layout comparisons — drag
					it back and forth to see exactly how the two versions align.
				</p>
				<p class="text-sm leading-relaxed text-text-muted">
					Both files are processed entirely in your browser. No content is sent to any server.
				</p>
			</div>
		</section>
	{:else}
		<!-- Results view — needs full width for side-by-side display -->
		<section class="space-y-4">
			<!-- Toolbar -->
			<div class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-sm">
				<!-- View mode tabs -->
				<div class="flex gap-1 rounded-lg bg-surface-alt p-1">
					{#each [
						{ value: 'side-by-side', label: 'Side by side' },
						{ value: 'overlay', label: 'Overlay' },
						{ value: 'diff', label: 'Diff' }
					] as tab}
						<button
							type="button"
							class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors {viewMode === tab.value
								? 'bg-accent text-white'
								: 'text-text-muted hover:text-text'}"
							onclick={() => (viewMode = tab.value as typeof viewMode)}
						>
							{tab.label}
						</button>
					{/each}
				</div>

				<!-- Page nav -->
				<div class="flex items-center gap-2">
					<button
						type="button"
						class="rounded-md px-2 py-1 text-sm text-text-muted transition-colors hover:text-text disabled:opacity-30"
						disabled={currentPage === 0}
						onclick={() => (currentPage = Math.max(0, currentPage - 1))}
						aria-label="Previous page"
					>
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
						</svg>
					</button>
					<span class="text-sm text-text">
						Page {currentPage + 1} of {results.length}
					</span>
					<button
						type="button"
						class="rounded-md px-2 py-1 text-sm text-text-muted transition-colors hover:text-text disabled:opacity-30"
						disabled={currentPage >= results.length - 1}
						onclick={() => (currentPage = Math.min(results.length - 1, currentPage + 1))}
						aria-label="Next page"
					>
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					</button>

					{#if currentResult}
						<span class="ml-1 rounded-full px-2.5 py-0.5 text-xs font-medium {diffBadgeColor(currentResult.diffPercent)}">
							{currentResult.diffPercent}% changed
						</span>
					{/if}
				</div>

				<!-- Start over -->
				<button
					type="button"
					class="text-sm text-text-muted underline transition-colors hover:text-accent"
					onclick={() => {
						results = [];
						originalFiles = [];
						revisedFiles = [];
						currentPage = 0;
						error = '';
					}}
				>
					Start over
				</button>
			</div>

			<!-- Main view -->
			{#if currentResult}
				<div class="rounded-xl border border-border bg-surface p-4 shadow-sm">
					{#if viewMode === 'side-by-side'}
						<div class="grid gap-4 md:grid-cols-2">
							<div class="space-y-2">
								<p class="text-center text-xs font-medium text-text-muted">Original</p>
								<div class="overflow-auto rounded-lg border border-border bg-surface-alt">
									<img
										src={currentResult.originalDataUrl}
										alt="Original page {currentPage + 1}"
										class="mx-auto block"
										style="max-width: 100%; height: auto;"
									/>
								</div>
							</div>
							<div class="space-y-2">
								<p class="text-center text-xs font-medium text-text-muted">Revised</p>
								<div class="overflow-auto rounded-lg border border-border bg-surface-alt">
									<img
										src={currentResult.revisedDataUrl}
										alt="Revised page {currentPage + 1}"
										class="mx-auto block"
										style="max-width: 100%; height: auto;"
									/>
								</div>
							</div>
						</div>
					{:else if viewMode === 'overlay'}
						<div
							class="relative mx-auto overflow-hidden rounded-lg border border-border bg-surface-alt"
							style="max-width: {currentResult.width}px;"
							bind:this={overlayContainer}
							onpointerdown={handleSliderPointerDown}
							onpointermove={handleSliderPointerMove}
							onpointerup={handleSliderPointerUp}
							role="slider"
							aria-label="Overlay comparison slider"
							aria-valuenow={Math.round(sliderPosition)}
							aria-valuemin={0}
							aria-valuemax={100}
							tabindex="0"
						>
							<img
								src={currentResult.originalDataUrl}
								alt="Original page {currentPage + 1}"
								class="block w-full select-none"
								draggable="false"
							/>
							<img
								src={currentResult.revisedDataUrl}
								alt="Revised page {currentPage + 1}"
								class="absolute inset-0 block w-full select-none"
								style="clip-path: inset(0 0 0 {sliderPosition}%);"
								draggable="false"
							/>
							<div
								class="absolute top-0 bottom-0 w-1 bg-accent"
								style="left: {sliderPosition}%; transform: translateX(-50%);"
							>
								<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent p-1.5 shadow-md">
									<svg class="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
									</svg>
								</div>
							</div>
							<span class="absolute top-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">Original</span>
							<span class="absolute top-2 right-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">Revised</span>
						</div>
					{:else}
						<div class="mx-auto" style="max-width: {currentResult.width}px;">
							<div class="overflow-auto rounded-lg border border-border bg-surface-alt">
								<img
									src={currentResult.diffDataUrl}
									alt="Diff of page {currentPage + 1}"
									class="mx-auto block"
									style="max-width: 100%; height: auto;"
								/>
							</div>
							<p class="mt-2 text-center text-xs text-text-muted">
								Changed pixels are highlighted in red. Unchanged areas are dimmed.
							</p>
						</div>
					{/if}
				</div>

				<!-- Page thumbnail strip -->
				{#if results.length > 1}
					<div class="rounded-xl border border-border bg-surface p-3 shadow-sm">
						<div class="flex gap-2 overflow-x-auto pb-1">
							{#each results as page, i}
								<button
									type="button"
									class="group relative flex-shrink-0 rounded-lg border-2 p-1 transition-colors {i === currentPage
										? 'border-accent'
										: 'border-border hover:border-accent/50'}"
									onclick={() => (currentPage = i)}
									aria-label="Go to page {i + 1}"
								>
									<img
										src={page.diffDataUrl}
										alt="Page {i + 1} diff thumbnail"
										class="h-20 w-auto rounded"
									/>
									<span
										class="absolute -top-1.5 -right-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none {diffBadgeColor(page.diffPercent)} {diffBorderColor(page.diffPercent)} border"
									>
										{page.diffPercent}%
									</span>
									<span class="mt-1 block text-center text-[10px] text-text-muted">{i + 1}</span>
								</button>
							{/each}
						</div>
					</div>
				{/if}
			{/if}
		</section>
	{/if}
</ToolShell>
