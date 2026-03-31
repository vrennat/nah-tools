<script lang="ts">
	import { onDestroy } from 'svelte';
	import ImageDropzone from '$components/photo/ImageDropzone.svelte';
	import FilterCanvas from '$components/filters/FilterCanvas.svelte';
	import AdjustmentPanel from '$components/filters/AdjustmentPanel.svelte';
	import PresetBar from '$components/filters/PresetBar.svelte';
	import ExportDialog from '$components/filters/ExportDialog.svelte';
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
</script>

<svelte:head>
	<title>Photo Filters — nah</title>
	<meta
		name="description"
		content="Adjust brightness, contrast, exposure, color temperature, and more. Real-time WebGL2 photo editing in your browser."
	/>
</svelte:head>

<div class="mx-auto max-w-6xl space-y-6">
	<!-- Header -->
	<div class="text-center">
		<h1 class="font-display text-3xl font-800 tracking-tight sm:text-4xl md:text-5xl">
			Photo <span class="text-accent">Filters</span>
		</h1>
		<p class="mt-2 text-text-muted">
			Real-time color correction. Everything runs in your browser via WebGL2.
		</p>
	</div>

	<!-- Error -->
	{#if error}
		<div role="alert" class="rounded-lg border border-error/30 bg-error/5 px-3 py-2 text-sm text-error">
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

	<!-- Info section -->
	<div class="mx-auto max-w-3xl rounded-lg border border-border bg-surface-alt p-6">
		<h2 class="text-sm font-semibold text-text">How it works</h2>
		<p class="mt-2 text-sm text-text-muted">
			Adjustments are computed on your GPU using WebGL2 fragment shaders. Changes render in under 16ms, giving you real-time feedback at 60fps. Your images are never uploaded to any server.
		</p>
	</div>
</div>

<!-- Export dialog -->
<ExportDialog bind:open={exportOpen} {exporting} onexport={handleExport} />
