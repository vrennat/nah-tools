<script lang="ts">
	import { onDestroy } from 'svelte';
	import ImageDropzone from '$components/photo/ImageDropzone.svelte';
	import FilterCanvas from '$components/filters/FilterCanvas.svelte';
	import AdjustmentPanel from '$components/filters/AdjustmentPanel.svelte';
	import PresetBar from '$components/filters/PresetBar.svelte';
	import ExportDialog from '$components/filters/ExportDialog.svelte';
	import ToolShell from '$components/ToolShell.svelte';
	import { compressFromImageData, terminate as terminateCompressor } from '$compress/client';
	import { downloadBlob } from '$qr/exporter';
	import type { FilterRenderer } from '$filters/renderer';
	import type { AdjustmentParams } from '$filters/types';
	import type { CodecName } from '$compress/types';
	import { getCodec } from '$compress/codecs';

	type PageState = 'idle' | 'editing' | 'exporting';

	let pageState: PageState = $state('idle');
	let error = $state('');

	// Image state
	let originalSrc = $state('');
	let loadedImage: HTMLImageElement | null = $state(null);
	let fileName = $state('');

	// Filter state
	let params: AdjustmentParams = $state({});
	let activePreset = $state('none');
	let renderer: FilterRenderer | null = $state(null);

	// Export
	let exportOpen = $state(false);
	let exporting = $state(false);

	// Compare (hold to see original)
	let comparing = $state(false);

	async function handleImage(file: File) {
		error = '';
		fileName = file.name.replace(/\.[^.]+$/, '');
		originalSrc = URL.createObjectURL(file);

		const img = new Image();
		img.src = originalSrc;
		await new Promise<void>((resolve, reject) => {
			img.onload = () => resolve();
			img.onerror = () => reject(new Error('Failed to load image'));
		});

		loadedImage = img;
		params = {};
		activePreset = 'none';
		pageState = 'editing';
	}

	function handleRendererReady(r: FilterRenderer) {
		renderer = r;
	}

	function applyPreset(presetParams: AdjustmentParams) {
		params = { ...presetParams };
	}

	async function handleExport(codec: CodecName, quality: number) {
		if (!renderer) return;
		exporting = true;

		try {
			const imageData = renderer.getImageData();
			const result = await compressFromImageData(imageData, codec, quality);
			const codecInfo = getCodec(codec);
			const blob = new Blob([result.buffer], { type: codecInfo.mimeType });
			downloadBlob(blob, `${fileName}-edited.${codecInfo.extension}`);
			exportOpen = false;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Export failed';
		} finally {
			exporting = false;
		}
	}

	function reset() {
		if (originalSrc) URL.revokeObjectURL(originalSrc);
		originalSrc = '';
		loadedImage = null;
		renderer = null;
		params = {};
		activePreset = 'none';
		pageState = 'idle';
		error = '';
	}

	onDestroy(() => {
		if (originalSrc) URL.revokeObjectURL(originalSrc);
		renderer?.destroy();
		terminateCompressor();
	});

	const faqs = [
		{
			question: 'Are my photos uploaded when I apply filters?',
			answer:
				'No. All adjustments run in your browser using WebGL2 fragment shaders. Your images are never sent to any server — editing and export happen entirely on your device.'
		},
		{
			question: 'What adjustments are available?',
			answer:
				'The tool covers the core color correction parameters: brightness, contrast, exposure, highlights, shadows, whites, blacks, saturation, vibrance, temperature, tint, and sharpness. Presets apply preset combinations of these values in one click.'
		},
		{
			question: 'Why is editing so fast?',
			answer:
				'Each adjustment is implemented as a GLSL fragment shader that runs on your GPU. The entire image is processed in parallel across GPU cores, so changes render in under 16ms and update at 60fps regardless of image size.'
		},
		{
			question: 'What formats can I export to?',
			answer:
				'You can export to WebP, JPEG, AVIF, PNG, OxiPNG, or JPEG XL — the same options available in the image compression tool. The export dialog lets you pick format and quality before downloading.'
		},
		{
			question: 'How do I compare the edited version to the original?',
			answer:
				'Hold down the "Hold to compare" button in the editing view. While held, the canvas shows the original image. Release to return to the edited view. This works at full resolution without any reprocessing.'
		}
	];
</script>

<ToolShell
	path="/photo/filters"
	tagline="Real-time brightness, contrast, exposure, and color temperature adjustments powered by WebGL2. No upload."
	seoTitle="Photo Color Correction Free — Real-Time WebGL2 Editor | nah.tools"
	description="Adjust brightness, contrast, exposure, temperature, and more with real-time WebGL2 rendering. Free photo editor in your browser — no upload, no signup."
	{faqs}
>
	<section class="mx-auto max-w-6xl space-y-6">
		<!-- Error -->
		{#if error}
			<div class="rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
				{error}
			</div>
		{/if}

		<!-- Upload -->
		{#if pageState === 'idle'}
			<div class="mx-auto max-w-3xl">
				<ImageDropzone onimage={handleImage} />
			</div>
		{/if}

		<!-- Editor -->
		{#if pageState === 'editing' && loadedImage}
			<!-- Presets -->
			<PresetBar bind:active={activePreset} onapply={applyPreset} />

			<div class="flex flex-col gap-6 lg:flex-row">
				<!-- Preview canvas -->
				<div class="min-w-0 flex-1">
					<div class="relative">
							<div class:hidden={comparing}>
							<FilterCanvas
								image={loadedImage}
								{params}
								onrenderer={handleRendererReady}
							/>
						</div>
						{#if comparing}
							<img
								src={originalSrc}
								alt="Original"
								class="max-h-[60vh] w-full rounded-lg border border-border object-contain"
							/>
							<div class="absolute left-3 top-3 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white">
								Original
							</div>
						{/if}
					</div>

					<!-- Controls bar -->
					<div class="mt-3 flex flex-wrap items-center justify-between gap-3">
						<button
							type="button"
							class="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-muted transition-colors hover:bg-surface-alt"
							onpointerdown={() => (comparing = true)}
							onpointerup={() => (comparing = false)}
							onpointerleave={() => (comparing = false)}
						>
							Hold to compare
						</button>

						<div class="flex gap-2">
							<button
								type="button"
								class="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-muted transition-colors hover:bg-surface-alt"
								onclick={reset}
							>
								New Image
							</button>
							<button
								type="button"
								class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
								onclick={() => (exportOpen = true)}
							>
								Export
							</button>
						</div>
					</div>
				</div>

				<!-- Adjustment sidebar -->
				<div class="w-full shrink-0 lg:w-72 xl:w-80">
					<div class="rounded-lg border border-border bg-surface-alt p-4">
						<AdjustmentPanel bind:params />
					</div>
				</div>
			</div>
		{/if}

		<div class="mx-auto max-w-3xl space-y-4 rounded-xl border border-border bg-surface-alt p-6">
			<h2 class="font-display text-lg font-700">GPU-accelerated color correction in the browser</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				Photo editing tools typically require a desktop app, a subscription, or at minimum a server-side render. This tool runs the entire color pipeline on your GPU using WebGL2 fragment shaders — the same technology used for real-time graphics in games and creative applications.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				Each adjustment maps directly to a shader parameter. When you move a slider, the GPU recalculates every pixel in parallel and redraws the canvas in under 16ms. You get 60fps feedback without any round-trips, encoding delays, or quality loss from intermediate steps.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				When you are ready to save, the export step encodes the final adjusted image via WebAssembly codecs — the same pipeline used in the image compression tool. You can choose WebP, JPEG, AVIF, or any other supported format at your preferred quality setting.
			</p>
		</div>
	</section>
</ToolShell>

<!-- Export dialog -->
<ExportDialog bind:open={exportOpen} {exporting} onexport={handleExport} />
