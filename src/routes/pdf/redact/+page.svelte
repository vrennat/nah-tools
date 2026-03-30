<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import ProgressBar from '$components/pdf/ProgressBar.svelte';
	import PdfToolLayout from '$components/pdf/PdfToolLayout.svelte';
	import type { RedactRegion } from '$pdf/types';

	let files = $state<File[]>([]);
	let pageImages = $state<{ dataUrl: string; width: number; height: number }[]>([]);
	let redactions = $state<Map<number, RedactRegion[]>>(new Map());
	let currentPage = $state(0);
	let loading = $state(false);
	let processing = $state(false);
	let error = $state('');
	let isDrawing = $state(false);
	let drawStart = $state<{ x: number; y: number } | null>(null);
	let drawCurrent = $state<{ x: number; y: number } | null>(null);
	let hoveredRegion = $state<number | null>(null);
	let loadProgress = $state({ current: 0, total: 0 });

	let file = $derived(files[0]);

	let totalRegions = $derived.by(() => {
		let count = 0;
		for (const regions of redactions.values()) {
			count += regions.length;
		}
		return count;
	});

	let pagesWithRedactions = $derived.by(() => {
		let count = 0;
		for (const regions of redactions.values()) {
			if (regions.length > 0) count++;
		}
		return count;
	});

	let currentPageRegions = $derived(redactions.get(currentPage) ?? []);

	$effect(() => {
		if (!file) {
			pageImages = [];
			redactions = new Map();
			currentPage = 0;
			return;
		}
		loadPages();
	});

	async function loadPages() {
		const currentFile = file!;
		loading = true;
		error = '';
		loadProgress = { current: 0, total: 0 };
		try {
			const buf = await currentFile.arrayBuffer();
			if (file !== currentFile) return;

			const { renderThumbnails } = await import('$pdf/renderer');
			// First get page count
			const { getPageCount } = await import('$pdf/processor');
			const count = await getPageCount(buf);
			if (file !== currentFile) return;

			loadProgress = { current: 0, total: count };
			const images: { dataUrl: string; width: number; height: number }[] = [];

			// Render pages in batches for progress reporting
			for (let i = 0; i < count; i++) {
				const result = await renderThumbnails(buf, { maxWidth: 800, pages: [i] });
				if (file !== currentFile) return;
				images.push({
					dataUrl: result[0].dataUrl,
					width: result[0].width,
					height: result[0].height
				});
				loadProgress = { current: i + 1, total: count };
			}

			pageImages = images;
			redactions = new Map();
			currentPage = 0;
		} catch (e) {
			if (file !== currentFile) return;
			error = e instanceof Error ? e.message : 'Failed to load PDF';
		} finally {
			if (file === currentFile) loading = false;
		}
	}

	function getRelativeCoords(e: PointerEvent, container: HTMLElement): { x: number; y: number } {
		const rect = container.getBoundingClientRect();
		return {
			x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
			y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
		};
	}

	function handlePointerDown(e: PointerEvent) {
		const target = e.currentTarget as HTMLElement;
		target.setPointerCapture(e.pointerId);
		const coords = getRelativeCoords(e, target);
		drawStart = coords;
		drawCurrent = coords;
		isDrawing = true;
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isDrawing || !drawStart) return;
		const target = e.currentTarget as HTMLElement;
		drawCurrent = getRelativeCoords(e, target);
	}

	function handlePointerUp(e: PointerEvent) {
		if (!isDrawing || !drawStart || !drawCurrent) {
			isDrawing = false;
			drawStart = null;
			drawCurrent = null;
			return;
		}

		const target = e.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();

		// Normalize coordinates (handle drawing in any direction)
		const x = Math.min(drawStart.x, drawCurrent.x);
		const y = Math.min(drawStart.y, drawCurrent.y);
		const width = Math.abs(drawCurrent.x - drawStart.x);
		const height = Math.abs(drawCurrent.y - drawStart.y);

		// Minimum 5px threshold to avoid accidental clicks
		const minThreshold = 5;
		const pixelWidth = width * rect.width;
		const pixelHeight = height * rect.height;

		if (pixelWidth >= minThreshold && pixelHeight >= minThreshold) {
			const region: RedactRegion = { x, y, width, height };
			const updated = new Map(redactions);
			const existing = updated.get(currentPage) ?? [];
			updated.set(currentPage, [...existing, region]);
			redactions = updated;
		}

		isDrawing = false;
		drawStart = null;
		drawCurrent = null;
	}

	function removeRegion(pageIndex: number, regionIndex: number) {
		const updated = new Map(redactions);
		const existing = updated.get(pageIndex) ?? [];
		const filtered = existing.filter((_, i) => i !== regionIndex);
		if (filtered.length > 0) {
			updated.set(pageIndex, filtered);
		} else {
			updated.delete(pageIndex);
		}
		redactions = updated;
	}

	function clearCurrentPage() {
		const updated = new Map(redactions);
		updated.delete(currentPage);
		redactions = updated;
	}

	function clearAll() {
		redactions = new Map();
	}

	function pageHasRedactions(pageIndex: number): boolean {
		return (redactions.get(pageIndex)?.length ?? 0) > 0;
	}

	let progressCurrent = $state(0);
	let progressTotal = $state(0);

	async function apply() {
		if (!file || totalRegions === 0) return;
		processing = true;
		error = '';
		progressCurrent = 0;
		progressTotal = 0;
		try {
			const { redactPDF } = await import('$pdf/redactor');
			const { downloadPDF, makeFilename } = await import('$pdf/exporter');
			const buf = await file.arrayBuffer();

			// Build config from redactions map
			const pages = Array.from(redactions.entries()).map(([pageIndex, regions]) => ({
				pageIndex,
				regions
			}));

			const result = await redactPDF(buf, { pages }, (current, total) => {
				progressCurrent = current;
				progressTotal = total;
			});
			downloadPDF(result, makeFilename('redacted', 'pdf'));
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to redact PDF';
		} finally {
			processing = false;
		}
	}

	// Preview rectangle during drawing
	let previewRect = $derived.by(() => {
		if (!isDrawing || !drawStart || !drawCurrent) return null;
		return {
			x: Math.min(drawStart.x, drawCurrent.x),
			y: Math.min(drawStart.y, drawCurrent.y),
			width: Math.abs(drawCurrent.x - drawStart.x),
			height: Math.abs(drawCurrent.y - drawStart.y)
		};
	});
</script>

<svelte:head>
	<title>Redact PDF Online Free | nah</title>
	<meta
		name="description"
		content="Permanently redact sensitive content from PDFs. Draw rectangles to black out text and images. Free, no upload — processed in your browser."
	/>
</svelte:head>

<PdfToolLayout title="Redact PDF" description="Permanently black out sensitive content.">
	<section class="mx-auto max-w-5xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			{#if pageImages.length === 0}
				<FileDropZone accept=".pdf" bind:files label="Drop a PDF here or click to browse" />

				{#if loading}
					<div class="mt-4">
						{#if loadProgress.total > 0}
							<ProgressBar
								current={loadProgress.current}
								total={loadProgress.total}
								label="Rendering pages..."
							/>
						{:else}
							<ProgressBar current={0} total={0} label="Loading PDF..." />
						{/if}
					</div>
				{/if}
			{:else}
				<!-- Main editing view -->
				<div class="flex gap-4">
					<!-- Left sidebar: page thumbnails -->
					<div class="hidden w-24 shrink-0 sm:block">
						<div class="flex flex-col gap-2 overflow-y-auto" style="max-height: 70vh;">
							{#each pageImages as img, i}
								<button
									type="button"
									class="relative rounded-lg border-2 transition-colors {i === currentPage
										? 'border-accent'
										: 'border-border hover:border-accent/50'}"
									onclick={() => (currentPage = i)}
								>
									<img
										src={img.dataUrl}
										alt="Page {i + 1}"
										class="w-full rounded-md"
									/>
									<span
										class="absolute bottom-0.5 left-0.5 rounded bg-brand/70 px-1 py-0.5 text-[10px] font-medium text-white"
									>
										{i + 1}
									</span>
									{#if pageHasRedactions(i)}
										<span
											class="absolute top-0.5 right-0.5 h-2.5 w-2.5 rounded-full bg-red-500"
										></span>
									{/if}
								</button>
							{/each}
						</div>
					</div>

					<!-- Center: current page with canvas overlay -->
					<div class="min-w-0 flex-1">
						<!-- Mobile page selector -->
						<div class="mb-3 flex items-center justify-between sm:hidden">
							<button
								type="button"
								class="rounded border border-border px-2 py-1 text-sm text-text-muted transition-colors hover:bg-surface-alt disabled:opacity-40"
								disabled={currentPage === 0}
								onclick={() => (currentPage = Math.max(0, currentPage - 1))}
							>
								Prev
							</button>
							<span class="text-sm text-text-muted">
								Page {currentPage + 1} of {pageImages.length}
							</span>
							<button
								type="button"
								class="rounded border border-border px-2 py-1 text-sm text-text-muted transition-colors hover:bg-surface-alt disabled:opacity-40"
								disabled={currentPage === pageImages.length - 1}
								onclick={() =>
									(currentPage = Math.min(pageImages.length - 1, currentPage + 1))}
							>
								Next
							</button>
						</div>

						<p class="mb-2 text-sm text-text-muted">
							Draw rectangles on the page to mark areas for redaction.
						</p>

						<!-- Page image with drawing overlay -->
						<div
							class="relative mx-auto select-none overflow-hidden rounded-lg border border-border bg-surface-alt"
							style="max-width: {pageImages[currentPage]?.width ?? 800}px;"
						>
							<img
								src={pageImages[currentPage]?.dataUrl}
								alt="Page {currentPage + 1}"
								class="block w-full"
								draggable="false"
							/>

							<!-- Drawing overlay -->
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div
								class="absolute inset-0 cursor-crosshair"
								onpointerdown={handlePointerDown}
								onpointermove={handlePointerMove}
								onpointerup={handlePointerUp}
								role="application"
								aria-label="Draw redaction regions on page {currentPage + 1}"
							>
								<!-- Committed redaction regions -->
								{#each currentPageRegions as region, i}
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<div
										class="absolute"
										style="left: {region.x * 100}%; top: {region.y * 100}%; width: {region.width *
											100}%; height: {region.height * 100}%;"
										onpointerenter={() => (hoveredRegion = i)}
										onpointerleave={() => (hoveredRegion = null)}
									>
										<div class="h-full w-full bg-black/70"></div>
										{#if hoveredRegion === i}
											<button
												type="button"
												class="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-sm transition-colors hover:bg-red-600"
												aria-label="Remove redaction region"
												onpointerdown={(e) => {
													e.stopPropagation();
													removeRegion(currentPage, i);
												}}
											>
												<svg
													class="h-3 w-3"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M6 18L18 6M6 6l12 12"
													/>
												</svg>
											</button>
										{/if}
									</div>
								{/each}

								<!-- Preview rectangle while drawing -->
								{#if previewRect}
									<div
										class="absolute border-2 border-dashed border-red-500 bg-red-500/20"
										style="left: {previewRect.x * 100}%; top: {previewRect.y *
											100}%; width: {previewRect.width * 100}%; height: {previewRect.height *
											100}%;"
									></div>
								{/if}
							</div>
						</div>

						<!-- Page nav for desktop -->
						<div class="mt-3 hidden items-center justify-center gap-3 sm:flex">
							<button
								type="button"
								class="rounded border border-border px-2 py-1 text-sm text-text-muted transition-colors hover:bg-surface-alt disabled:opacity-40"
								disabled={currentPage === 0}
								onclick={() => (currentPage = Math.max(0, currentPage - 1))}
							>
								Previous
							</button>
							<span class="text-sm text-text-muted">
								Page {currentPage + 1} of {pageImages.length}
							</span>
							<button
								type="button"
								class="rounded border border-border px-2 py-1 text-sm text-text-muted transition-colors hover:bg-surface-alt disabled:opacity-40"
								disabled={currentPage === pageImages.length - 1}
								onclick={() =>
									(currentPage = Math.min(pageImages.length - 1, currentPage + 1))}
							>
								Next
							</button>
						</div>

						<!-- Controls -->
						<div class="mt-4 flex flex-wrap items-center gap-3">
							<button
								type="button"
								class="rounded-full border border-border px-3 py-1.5 text-sm font-medium text-text transition-colors hover:bg-surface-alt disabled:opacity-40"
								disabled={currentPageRegions.length === 0}
								onclick={clearCurrentPage}
							>
								Clear this page
							</button>
							<button
								type="button"
								class="rounded-full border border-border px-3 py-1.5 text-sm font-medium text-text transition-colors hover:bg-surface-alt disabled:opacity-40"
								disabled={totalRegions === 0}
								onclick={clearAll}
							>
								Clear all
							</button>
							{#if totalRegions > 0}
								<span class="text-sm text-text-muted">
									{totalRegions} region{totalRegions !== 1 ? 's' : ''} on {pagesWithRedactions} page{pagesWithRedactions !== 1 ? 's' : ''}
								</span>
							{/if}
						</div>
					</div>
				</div>

				<!-- Security notice -->
				{#if totalRegions > 0}
					<div class="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
						<p class="text-sm text-amber-700 dark:text-amber-400">
							<svg
								class="mr-1.5 inline-block h-4 w-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
								/>
							</svg>
							Redacted pages will be flattened to images. Text on those pages will no longer be
							selectable or searchable. This ensures redacted content is permanently removed.
						</p>
					</div>
				{/if}

				{#if processing}
					<div class="mt-4">
						<ProgressBar
							current={progressCurrent}
							total={progressTotal}
							label="Applying redactions..."
						/>
					</div>
				{/if}
			{/if}

			{#if error}
				<p class="mt-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
			{/if}

			{#if pageImages.length > 0}
				<div class="mt-6">
					<button
						type="button"
						class="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
						disabled={totalRegions === 0 || processing}
						onclick={apply}
					>
						{#if processing}
							Applying Redactions...
						{:else if totalRegions === 0}
							Draw regions to redact
						{:else}
							Apply Redactions & Download
						{/if}
					</button>
				</div>
			{/if}
		</div>

		<p class="text-center text-xs text-text-muted">
			<a href="/pdf" class="underline hover:text-accent">Back to all PDF tools</a>
		</p>
	</section>
</PdfToolLayout>
