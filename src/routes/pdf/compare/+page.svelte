<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import ProgressBar from '$components/pdf/ProgressBar.svelte';
	import PdfToolLayout from '$components/pdf/PdfToolLayout.svelte';
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
</script>

<svelte:head>
	<title>Compare PDFs Online Free — Visual PDF Diff | nah</title>
	<meta
		name="description"
		content="Compare two PDFs side-by-side with pixel-level visual diff. Free, no upload — files are compared in your browser."
	/>
</svelte:head>

<PdfToolLayout
	title="Compare PDFs"
	description="Side-by-side visual diff of two PDFs. Spot every change, pixel by pixel."
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

			<p class="text-center text-xs text-text-muted">
				<a href="/pdf" class="underline hover:text-accent">Back to all PDF tools</a>
			</p>
		</section>
	{:else}
		<section class="mx-auto max-w-6xl space-y-4">
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
							<!-- Original (full, behind) -->
							<img
								src={currentResult.originalDataUrl}
								alt="Original page {currentPage + 1}"
								class="block w-full select-none"
								draggable="false"
							/>
							<!-- Revised (clipped) -->
							<img
								src={currentResult.revisedDataUrl}
								alt="Revised page {currentPage + 1}"
								class="absolute inset-0 block w-full select-none"
								style="clip-path: inset(0 0 0 {sliderPosition}%);"
								draggable="false"
							/>
							<!-- Slider bar -->
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
							<!-- Labels -->
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

			<p class="text-center text-xs text-text-muted">
				<a href="/pdf" class="underline hover:text-accent">Back to all PDF tools</a>
			</p>
		</section>
	{/if}
</PdfToolLayout>
