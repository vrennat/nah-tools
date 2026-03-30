<script lang="ts">
	import { onDestroy } from 'svelte';
	import ImageDropzone from '$components/photo/ImageDropzone.svelte';
	import FormatPicker from '$components/compress/FormatPicker.svelte';
	import QualitySlider from '$components/compress/QualitySlider.svelte';
	import CompressionResultView from '$components/compress/CompressionResult.svelte';
	import { compress, terminate } from '$compress/client';
	import { getCodec } from '$compress/codecs';
	import { downloadBlob } from '$qr/exporter';
	import type { CodecName, CompressionResult } from '$compress/types';

	type PageState = 'idle' | 'loaded' | 'compressing' | 'result';

	let pageState: PageState = $state('idle');
	let error = $state('');

	// Image state
	let originalFile: File | null = $state(null);
	let originalSrc = $state('');
	let originalSize = $state(0);
	let imageDimensions = $state({ width: 0, height: 0 });

	// Compression options
	let codec: CodecName = $state('webp');
	let quality = $state(80);

	// Result
	let result: CompressionResult | null = $state(null);

	// Update quality default when codec changes
	$effect(() => {
		const info = getCodec(codec);
		quality = info.defaultQuality;
	});

	async function handleImage(file: File) {
		error = '';
		originalFile = file;
		originalSize = file.size;
		originalSrc = URL.createObjectURL(file);

		// Get dimensions
		const img = new Image();
		img.src = originalSrc;
		await new Promise((resolve) => (img.onload = resolve));
		imageDimensions = { width: img.naturalWidth, height: img.naturalHeight };

		pageState = 'loaded';
	}

	async function handleCompress() {
		if (!originalFile) return;
		error = '';
		pageState = 'compressing';

		try {
			const buffer = await originalFile.arrayBuffer();
			result = await compress(buffer, originalFile.type, codec, quality);
			pageState = 'result';
		} catch (e) {
			error = e instanceof Error ? e.message : 'Compression failed';
			pageState = 'loaded';
		}
	}

	function download() {
		if (!result) return;
		const blob = new Blob([result.buffer], { type: result.mimeType });
		const baseName = originalFile?.name.replace(/\.[^.]+$/, '') ?? 'compressed';
		downloadBlob(blob, `${baseName}.${result.extension}`);
	}

	function reset() {
		if (originalSrc) URL.revokeObjectURL(originalSrc);
		originalSrc = '';
		originalFile = null;
		originalSize = 0;
		result = null;
		pageState = 'idle';
		error = '';
	}

	function formatSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
	}

	onDestroy(() => {
		if (originalSrc) URL.revokeObjectURL(originalSrc);
		terminate();
	});
</script>

<svelte:head>
	<title>Compress Images — nah</title>
	<meta
		name="description"
		content="Compress images to WebP, AVIF, JPEG, PNG, or JPEG XL in your browser. Free, unlimited, no upload required."
	/>
</svelte:head>

<div class="mx-auto max-w-3xl space-y-6">
	<!-- Header -->
	<div class="text-center">
		<h1 class="font-display text-3xl font-800 tracking-tight sm:text-4xl md:text-5xl">
			Compress <span class="text-accent">Images</span>
		</h1>
		<p class="mt-2 text-text-muted">
			Convert and compress to modern formats. Everything runs in your browser.
		</p>
	</div>

	<!-- Error -->
	{#if error}
		<div class="rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
			{error}
		</div>
	{/if}

	<!-- Upload -->
	{#if pageState === 'idle'}
		<ImageDropzone onimage={handleImage} />
	{/if}

	<!-- Loaded: show preview + controls -->
	{#if pageState === 'loaded' || pageState === 'compressing'}
		<div class="space-y-4">
			<!-- Preview -->
			<div class="overflow-hidden rounded-lg border border-border bg-surface-alt">
				<img
					src={originalSrc}
					alt="Original"
					class="mx-auto max-h-80 object-contain"
				/>
				<div class="border-t border-border px-4 py-2 text-center text-xs text-text-muted">
					{imageDimensions.width} x {imageDimensions.height} &middot; {formatSize(originalSize)} &middot; {originalFile?.type}
				</div>
			</div>

			<!-- Controls -->
			<div class="space-y-4 rounded-lg border border-border bg-surface-alt p-4">
				<FormatPicker bind:value={codec} disabled={pageState === 'compressing'} />
				<QualitySlider bind:value={quality} {codec} disabled={pageState === 'compressing'} />

				{#if codec === 'avif'}
					<p class="rounded-md bg-warning/5 border border-warning/20 px-3 py-2 text-xs text-warning">
						AVIF produces the smallest files but encodes 2-10x slower than WebP.
					</p>
				{/if}
			</div>

			<!-- Compress button -->
			<button
				type="button"
				class="w-full rounded-lg bg-accent px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
				onclick={handleCompress}
				disabled={pageState === 'compressing'}
			>
				{#if pageState === 'compressing'}
					<span class="inline-flex items-center gap-2">
						<span class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
						Compressing...
					</span>
				{:else}
					Compress to {getCodec(codec).label}
				{/if}
			</button>

			{#if pageState !== 'compressing'}
				<button
					type="button"
					class="w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm text-text-muted transition-colors hover:bg-surface-alt"
					onclick={reset}
				>
					Choose different image
				</button>
			{/if}
		</div>
	{/if}

	<!-- Result -->
	{#if pageState === 'result' && result}
		<div class="space-y-4">
			<!-- Preview -->
			<div class="overflow-hidden rounded-lg border border-border bg-surface-alt">
				<img
					src={originalSrc}
					alt="Original"
					class="mx-auto max-h-80 object-contain"
				/>
			</div>

			<CompressionResultView
				{originalSize}
				{result}
				ondownload={download}
				onreset={reset}
			/>
		</div>
	{/if}

	<!-- Info section -->
	<div class="rounded-lg border border-border bg-surface-alt p-6">
		<h2 class="text-sm font-semibold text-text">How it works</h2>
		<p class="mt-2 text-sm text-text-muted">
			Images are compressed entirely in your browser using WebAssembly codecs from Google's Squoosh project. Nothing is uploaded to any server. Supports JPEG, WebP, AVIF, PNG, OxiPNG, and JPEG XL.
		</p>
	</div>
</div>
