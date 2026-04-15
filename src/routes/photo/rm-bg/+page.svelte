<script lang="ts">
	import { onDestroy } from 'svelte';
	import ImageDropzone from '$components/photo/ImageDropzone.svelte';
	import BeforeAfterSlider from '$components/photo/BeforeAfterSlider.svelte';
	import ModelDownloadProgress from '$components/photo/ModelDownloadProgress.svelte';
	import BackendBadge from '$components/photo/BackendBadge.svelte';
	import BackgroundPicker from '$components/photo/BackgroundPicker.svelte';
	import MaskRefinement from '$components/photo/MaskRefinement.svelte';
	import ModelPicker from '$components/photo/ModelPicker.svelte';
	import { removeBackground, isModelCached, terminate } from '$photo/client';
	import { applyMask, compositeOnBackground, canvasToBlob } from '$photo/canvas-utils';
	import { downloadBlob, makeFilename } from '$qr/exporter';
	import type { BackendType, MaskOptions } from '$photo/types';
	import { DEFAULT_MASK_OPTIONS } from '$photo/types';
	import { DEFAULT_BG_MODEL } from '$photo/models';

	type PageState = 'idle' | 'loading-model' | 'processing' | 'result';

	let pageState: PageState = $state('idle');
	let error = $state('');
	let backend: BackendType | null = $state(null);
	let inferenceMs = $state(0);

	// Model download progress
	let downloadLoaded = $state(0);
	let downloadTotal = $state(DEFAULT_BG_MODEL.size);

	// Image state
	let originalSrc = $state('');
	let originalFile: File | null = $state(null);
	let originalBitmap: ImageBitmap | null = $state(null);
	let maskedCanvas: HTMLCanvasElement | null = $state(null);
	let displayCanvas: HTMLCanvasElement | null = $state(null);

	// Background option
	let bgColor = $state('transparent');

	// Model selection
	let selectedModelId = $state(DEFAULT_BG_MODEL.id);

	// Mask refinement
	let maskOptions: MaskOptions = $state({ ...DEFAULT_MASK_OPTIONS });

	// Recomposite when background changes
	$effect(() => {
		if (maskedCanvas && bgColor) {
			if (bgColor === 'transparent') {
				displayCanvas = maskedCanvas;
			} else {
				displayCanvas = compositeOnBackground(maskedCanvas, bgColor);
			}
		}
	});

	async function processImage(file: File, modelId: string, opts: MaskOptions) {
		error = '';

		try {
			// Create object URL for preview
			if (originalSrc) URL.revokeObjectURL(originalSrc);
			originalSrc = URL.createObjectURL(file);

			// Create ImageBitmap for processing
			const bitmap = await createImageBitmap(file);
			originalBitmap = bitmap;

			// Check if model is cached to decide initial state
			const cached = await isModelCached(modelId);
			pageState = cached ? 'processing' : 'loading-model';
			downloadLoaded = 0;
			const result = await removeBackground(
				await createImageBitmap(file), // create a new one since we transfer it
				(loaded, total) => {
					downloadLoaded = loaded;
					downloadTotal = total;
					if (pageState === 'loading-model' && loaded >= total) {
						pageState = 'processing';
					}
				},
				modelId,
				opts
			);

			backend = result.backend;
			inferenceMs = result.inferenceMs;

			// Apply mask to original
			maskedCanvas = applyMask(originalBitmap!, result.mask);
			displayCanvas = bgColor === 'transparent'
				? maskedCanvas
				: compositeOnBackground(maskedCanvas, bgColor);

			pageState = 'result';
		} catch (e) {
			error = e instanceof Error ? e.message : 'An error occurred during processing';
			pageState = 'idle';
		}
	}

	async function handleImage(file: File) {
		originalFile = file;
		await processImage(file, selectedModelId, maskOptions);
	}

	async function reprocess() {
		if (!originalFile) return;
		await processImage(originalFile, selectedModelId, maskOptions);
	}

	async function download() {
		const canvas = bgColor === 'transparent' ? maskedCanvas : displayCanvas;
		if (!canvas) return;

		const blob = await canvasToBlob(canvas, 'image/png');
		downloadBlob(blob, makeFilename('background-removed', 'png'));
	}

	function reset() {
		if (originalSrc) URL.revokeObjectURL(originalSrc);
		originalSrc = '';
		originalFile = null;
		originalBitmap = null;
		maskedCanvas = null;
		displayCanvas = null;
		pageState = 'idle';
		error = '';
	}

	onDestroy(() => {
		if (originalSrc) URL.revokeObjectURL(originalSrc);
		terminate();
	});
</script>

<svelte:head>
	<title>Remove Background — nah</title>
	<meta
		name="description"
		content="Remove image backgrounds instantly in your browser. Free, unlimited, full resolution. No upload, no signup, no watermark."
	/>
</svelte:head>

<div class="mx-auto max-w-3xl space-y-6">
	<!-- Header -->
	<div class="text-center">
		<h1 class="font-display text-4xl font-800 tracking-tight sm:text-5xl md:text-6xl">
			Remove <span class="text-accent">Background</span>
		</h1>
		<p class="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
			100% in your browser. Images never leave your device.
		</p>
	</div>

	<!-- Error -->
	{#if error}
		<div class="rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
			{error}
		</div>
	{/if}

	<!-- Upload area (shown when idle or as "try another" in result) -->
	{#if pageState === 'idle'}
		<div class="space-y-4">
			<div class="flex justify-center">
				<ModelPicker bind:value={selectedModelId} />
			</div>
			<ImageDropzone onimage={handleImage} />
		</div>
	{/if}

	<!-- Model download progress -->
	{#if pageState === 'loading-model'}
		<ModelDownloadProgress loaded={downloadLoaded} total={downloadTotal} />
	{/if}

	<!-- Processing indicator -->
	{#if pageState === 'processing'}
		<div class="rounded-lg border border-border bg-surface-alt p-6 text-center">
			<div class="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent"></div>
			<p class="mt-3 text-sm text-text-muted">Removing background...</p>
		</div>
	{/if}

	<!-- Result -->
	{#if pageState === 'result' && displayCanvas}
		<div class="space-y-4">
			<!-- Before/After Slider -->
			<BeforeAfterSlider {originalSrc} resultCanvas={displayCanvas} />

			<!-- Controls bar -->
			<div class="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-surface-alt px-4 py-3">
				<div class="flex items-center gap-3">
					<BackgroundPicker bind:value={bgColor} />
				</div>

				<div class="flex items-center gap-3">
					<BackendBadge {backend} />
					{#if inferenceMs > 0}
						<span class="text-xs text-text-muted">{inferenceMs}ms</span>
					{/if}
				</div>
			</div>

			<!-- Refinement controls -->
			<div class="rounded-lg border border-border bg-surface-alt px-4 py-3">
				<div class="space-y-3">
					<ModelPicker bind:value={selectedModelId} disabled={pageState !== 'result'} />
					<MaskRefinement bind:value={maskOptions} />
					<button
						type="button"
						class="rounded-md border border-accent bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
						onclick={reprocess}
					>
						Re-process with changes
					</button>
				</div>
			</div>

			<!-- Download + New Image -->
			<div class="flex gap-3">
				<button
					type="button"
					class="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
					onclick={download}
				>
					Download PNG
				</button>
				<button
					type="button"
					class="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text transition-colors hover:bg-surface-alt"
					onclick={reset}
				>
					New Image
				</button>
			</div>
		</div>
	{/if}

	<!-- Info section -->
	<div class="rounded-lg border border-border bg-surface-alt p-6">
		<h2 class="text-sm font-semibold text-text">How it works</h2>
		<p class="mt-2 text-sm text-text-muted">
			An AI model runs directly in your browser using WebGPU (or CPU as fallback). Your images are never uploaded to any server. The model downloads once (~42 MB) and is cached for future use.
		</p>
		<div class="mt-3 space-y-1 text-sm text-text-muted">
			<p><strong class="text-text">People</strong> — Best for portraits, photos of people, hair and skin detail.</p>
			<p><strong class="text-text">General</strong> — Better for objects, products, logos, and graphics.</p>
		</div>
	</div>
</div>
