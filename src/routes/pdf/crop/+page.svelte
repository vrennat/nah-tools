<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import ProgressBar from '$components/pdf/ProgressBar.svelte';
	import PdfToolLayout from '$components/pdf/PdfToolLayout.svelte';
	import type { PageThumbnail } from '$pdf/types';

	type Unit = 'pt' | 'mm' | 'in';

	const UNIT_TO_PT: Record<Unit, number> = {
		pt: 1,
		mm: 2.835,
		in: 72
	};

	let files = $state<File[]>([]);
	let thumbnails = $state<PageThumbnail[]>([]);
	let pageSizes = $state<{ width: number; height: number }[]>([]);
	let loading = $state(false);
	let processing = $state(false);
	let error = $state('');

	let unit = $state<Unit>('pt');
	let top = $state(0);
	let right = $state(0);
	let bottom = $state(0);
	let left = $state(0);

	let applyTo = $state<'all' | 'selected'>('all');
	let selectedPages = $state<Set<number>>(new Set());

	let file = $derived(files[0]);

	let topPt = $derived(top * UNIT_TO_PT[unit]);
	let rightPt = $derived(right * UNIT_TO_PT[unit]);
	let bottomPt = $derived(bottom * UNIT_TO_PT[unit]);
	let leftPt = $derived(left * UNIT_TO_PT[unit]);

	let hasMargins = $derived(topPt > 0 || rightPt > 0 || bottomPt > 0 || leftPt > 0);
	let hasSelection = $derived(applyTo === 'all' || selectedPages.size > 0);
	let canApply = $derived(!!file && hasMargins && hasSelection && !processing);

	// Preview overlay percentages for the first thumbnail
	let previewInsets = $derived.by(() => {
		if (!pageSizes.length) return { top: 0, right: 0, bottom: 0, left: 0 };
		const page = pageSizes[0];
		return {
			top: Math.min((topPt / page.height) * 100, 49),
			right: Math.min((rightPt / page.width) * 100, 49),
			bottom: Math.min((bottomPt / page.height) * 100, 49),
			left: Math.min((leftPt / page.width) * 100, 49)
		};
	});

	$effect(() => {
		if (!file) {
			thumbnails = [];
			pageSizes = [];
			selectedPages = new Set();
			return;
		}
		loadThumbnails();
	});

	async function loadThumbnails() {
		const currentFile = file!;
		loading = true;
		error = '';
		try {
			const buf = await currentFile.arrayBuffer();
			if (file !== currentFile) return;

			const [{ renderThumbnails }, { getPageSizes }] = await Promise.all([
				import('$pdf/renderer'),
				import('$pdf/processor')
			]);

			const [thumbs, sizes] = await Promise.all([
				renderThumbnails(buf),
				getPageSizes(buf)
			]);

			if (file !== currentFile) return;
			thumbnails = thumbs;
			pageSizes = sizes;
			selectedPages = new Set();
		} catch (e) {
			if (file !== currentFile) return;
			error = e instanceof Error ? e.message : 'Failed to load PDF';
		} finally {
			if (file === currentFile) loading = false;
		}
	}

	function togglePage(pageIndex: number) {
		const updated = new Set(selectedPages);
		if (updated.has(pageIndex)) {
			updated.delete(pageIndex);
		} else {
			updated.add(pageIndex);
		}
		selectedPages = updated;
	}

	async function apply() {
		if (!canApply || !file) return;
		processing = true;
		error = '';
		try {
			const { cropPages } = await import('$pdf/processor');
			const { downloadPDF, makeFilename } = await import('$pdf/exporter');

			const buf = await file.arrayBuffer();
			const indices = applyTo === 'all' ? undefined : [...selectedPages];
			const result = await cropPages(
				buf,
				{ top: topPt, right: rightPt, bottom: bottomPt, left: leftPt },
				indices
			);

			downloadPDF(result, makeFilename('cropped', 'pdf'));
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to crop PDF';
		} finally {
			processing = false;
		}
	}
</script>

<svelte:head>
	<title>Crop PDF Online Free | nah</title>
	<meta
		name="description"
		content="Trim margins from PDF pages. Set custom top, right, bottom, left insets in points, mm, or inches. Free, no upload — processed in your browser."
	/>
</svelte:head>

<PdfToolLayout title="Crop PDF" description="Trim margins from all or specific pages.">
	<section class="mx-auto max-w-4xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<FileDropZone accept=".pdf" bind:files label="Drop a PDF here or click to browse" />

			{#if loading}
				<div class="mt-4">
					<ProgressBar current={0} total={0} label="Loading pages..." />
				</div>
			{/if}

			{#if thumbnails.length > 0}
				<div class="mt-6 space-y-6">
					<!-- Unit selector + margin inputs -->
					<div class="space-y-4">
						<div>
							<label for="cropUnit" class="mb-1 block text-sm font-medium text-text">Unit</label>
							<select
								id="cropUnit"
								bind:value={unit}
								class="rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
							>
								<option value="pt">Points (pt)</option>
								<option value="mm">Millimeters (mm)</option>
								<option value="in">Inches (in)</option>
							</select>
						</div>

						<div class="grid grid-cols-2 gap-4">
							<div>
								<label for="cropTop" class="mb-1 block text-sm font-medium text-text"
									>Top ({unit})</label
								>
								<input
									id="cropTop"
									type="number"
									min="0"
									step={unit === 'in' ? '0.1' : '1'}
									bind:value={top}
									class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
								/>
							</div>
							<div>
								<label for="cropRight" class="mb-1 block text-sm font-medium text-text"
									>Right ({unit})</label
								>
								<input
									id="cropRight"
									type="number"
									min="0"
									step={unit === 'in' ? '0.1' : '1'}
									bind:value={right}
									class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
								/>
							</div>
							<div>
								<label for="cropBottom" class="mb-1 block text-sm font-medium text-text"
									>Bottom ({unit})</label
								>
								<input
									id="cropBottom"
									type="number"
									min="0"
									step={unit === 'in' ? '0.1' : '1'}
									bind:value={bottom}
									class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
								/>
							</div>
							<div>
								<label for="cropLeft" class="mb-1 block text-sm font-medium text-text"
									>Left ({unit})</label
								>
								<input
									id="cropLeft"
									type="number"
									min="0"
									step={unit === 'in' ? '0.1' : '1'}
									bind:value={left}
									class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
								/>
							</div>
						</div>
					</div>

					<!-- Apply to toggle -->
					<div>
						<span class="mb-2 block text-sm font-medium text-text">Apply to</span>
						<div class="flex gap-2">
							<button
								type="button"
								class="rounded-full border px-3 py-1.5 text-sm font-medium transition-colors {applyTo === 'all'
									? 'border-accent bg-accent/10 text-accent'
									: 'border-border text-text hover:bg-surface-alt'}"
								onclick={() => (applyTo = 'all')}
							>
								All pages
							</button>
							<button
								type="button"
								class="rounded-full border px-3 py-1.5 text-sm font-medium transition-colors {applyTo === 'selected'
									? 'border-accent bg-accent/10 text-accent'
									: 'border-border text-text hover:bg-surface-alt'}"
								onclick={() => (applyTo = 'selected')}
							>
								Selected pages
							</button>
						</div>
					</div>

					<!-- Thumbnail grid with preview overlay -->
					<div class="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
						{#each thumbnails as thumb}
							{@const isFirst = thumb.pageIndex === 0}
							{@const isSelected = selectedPages.has(thumb.pageIndex)}
							{@const isClickable = applyTo === 'selected'}
							<div class="space-y-1.5">
								<button
									type="button"
									class="relative w-full overflow-hidden rounded-lg border bg-surface-alt {isClickable && isSelected
										? 'border-accent'
										: 'border-border'} {isClickable ? 'cursor-pointer' : 'cursor-default'}"
									onclick={() => isClickable && togglePage(thumb.pageIndex)}
									disabled={!isClickable}
								>
									<img
										src={thumb.dataUrl}
										alt="Page {thumb.pageIndex + 1}"
										class="w-full"
									/>
									<!-- Crop preview overlay on first thumbnail -->
									{#if isFirst && hasMargins}
										<div
											class="pointer-events-none absolute inset-0"
										>
											<!-- Top -->
											<div
												class="absolute top-0 right-0 left-0 bg-red-500/20"
												style="height: {previewInsets.top}%"
											></div>
											<!-- Bottom -->
											<div
												class="absolute right-0 bottom-0 left-0 bg-red-500/20"
												style="height: {previewInsets.bottom}%"
											></div>
											<!-- Left -->
											<div
												class="absolute top-0 bottom-0 left-0 bg-red-500/20"
												style="width: {previewInsets.left}%"
											></div>
											<!-- Right -->
											<div
												class="absolute top-0 right-0 bottom-0 bg-red-500/20"
												style="width: {previewInsets.right}%"
											></div>
											<!-- Dashed crop border -->
											<div
												class="absolute border-2 border-dashed border-red-500/60"
												style="top: {previewInsets.top}%; right: {previewInsets.right}%; bottom: {previewInsets.bottom}%; left: {previewInsets.left}%"
											></div>
										</div>
									{/if}
									<span
										class="absolute bottom-1 left-1 rounded bg-brand/70 px-1.5 py-0.5 text-xs font-medium text-white"
									>
										{thumb.pageIndex + 1}
									</span>
									{#if isClickable && isSelected}
										<span
											class="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white"
										>
											<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
											</svg>
										</span>
									{/if}
								</button>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			{#if error}
				<p role="alert" class="mt-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
			{/if}

			<div class="mt-6">
				<button
					type="button"
					class="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
					disabled={!canApply}
					onclick={apply}
				>
					{#if processing}
						Cropping...
					{:else if !file}
						Upload a PDF
					{:else if !hasMargins}
						Set crop margins
					{:else if applyTo === 'selected' && selectedPages.size === 0}
						Select pages to crop
					{:else}
						Crop & Download
					{/if}
				</button>
			</div>
		</div>

		<p class="text-center text-xs text-text-muted">
			<a href="/pdf" class="underline hover:text-accent">Back to all PDF tools</a>
		</p>
	</section>
</PdfToolLayout>
