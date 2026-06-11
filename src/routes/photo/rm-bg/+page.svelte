<script lang="ts">
	import { onDestroy } from 'svelte';
	import ImageDropzone from '$components/photo/ImageDropzone.svelte';
	import BeforeAfterSlider from '$components/photo/BeforeAfterSlider.svelte';
	import ModelDownloadProgress from '$components/photo/ModelDownloadProgress.svelte';
	import BackendBadge from '$components/photo/BackendBadge.svelte';
	import BackgroundPicker from '$components/photo/BackgroundPicker.svelte';
	import MaskRefinement from '$components/photo/MaskRefinement.svelte';
	import ModelPicker from '$components/photo/ModelPicker.svelte';
	import ToolShell from '$components/ToolShell.svelte';
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

	const faqs = [
		{
			question: 'Are my images uploaded to a server?',
			answer:
				'No. The AI model runs entirely inside your browser using WebGPU acceleration (with automatic CPU fallback). Your images never leave your device — no upload, no account, no size limit.'
		},
		{
			question: 'Which AI model is used for background removal?',
			answer:
				'Two models are available. "People" uses BRIA RMBG-1.4 (Apache 2.0, ~42 MB quantized ONNX) — optimized for portraits and hair detail. "General" uses IS-Net (Apache 2.0, ~43 MB quantized ONNX) — better for objects, products, and graphics. Both run at 1024x1024 input resolution.'
		},
		{
			question: 'Why does the first run take a moment?',
			answer:
				'The model file (~42-43 MB) downloads once from a CDN on first use and is then cached in your browser via the Cache API. Subsequent uses are instant — the model loads from the local cache without any network request.'
		},
		{
			question: 'What is the difference between WebGPU and CPU inference?',
			answer:
				'WebGPU runs the neural network on your GPU, which is typically 5-15x faster than CPU inference for ONNX models at 1024x1024. The backend used for each image is shown in the result view. CPU fallback is automatic when WebGPU is unavailable.'
		},
		{
			question: 'Can I adjust the mask after processing?',
			answer:
				'Yes. The mask refinement controls let you tune edge smoothing and threshold after the initial result. You can also switch models and click "Re-process" to run the other AI model on the same image without re-uploading.'
		}
	];
</script>

<ToolShell
	path="/photo/rm-bg"
	tagline="AI-powered background removal that runs entirely in your browser. No upload, no watermark, full resolution."
	seoTitle="Remove Image Background Free — On-Device AI | nah.tools"
	description="Remove image backgrounds instantly using on-device AI. Free, unlimited, full resolution. No upload, no signup — runs in your browser with WebGPU or CPU fallback."
	{faqs}
>
	<section class="mx-auto max-w-3xl space-y-6">
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

		<div class="space-y-4 rounded-xl border border-border bg-surface-alt p-6">
			<h2 class="font-display text-lg font-700">How on-device background removal works</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				Most background removal services send your photos to a remote API, charge per image, and retain rights to use uploads for model training. This tool takes the opposite approach: the entire inference pipeline runs inside your browser.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				When you drop an image, the tool checks whether the selected model is already in your browser cache. If not, it downloads the quantized ONNX model (~42-43 MB) once and stores it using the Cache API. All subsequent uses load from local storage — no network request required.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				Inference runs via the ONNX Runtime Web backend. On devices with WebGPU support, the model executes on your GPU for fast results. On older hardware, the CPU backend handles it automatically. Both models process images at 1024x1024 resolution. The "People" model (RMBG-1.4) is tuned for portrait hair and skin edges; the "General" model (IS-Net) handles objects, product photos, and graphics more broadly.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				After removal, you can choose a background color, fine-tune the mask edge with the refinement controls, or switch models and reprocess — all without re-uploading your image.
			</p>
		</div>
	</section>
</ToolShell>
