<script lang="ts">
	import { onDestroy } from 'svelte';
	import ImageDropzone from '$components/photo/ImageDropzone.svelte';
	import FormatPicker from '$components/compress/FormatPicker.svelte';
	import QualitySlider from '$components/compress/QualitySlider.svelte';
	import CompressionResultView from '$components/compress/CompressionResult.svelte';
	import ToolShell from '$components/ToolShell.svelte';
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

	const faqs = [
		{
			question: 'Are my images uploaded to compress them?',
			answer:
				'No. Compression runs entirely in your browser using WebAssembly codecs. Your images never leave your device — no upload, no server, no account required.'
		},
		{
			question: 'Which output formats are supported?',
			answer:
				'WebP (best speed/size balance, widely supported), JPEG (universal compatibility), AVIF (40-50% smaller than JPEG, slower to encode), PNG (lossless, standard), OxiPNG (optimized lossless PNG, smaller than standard PNG), and JPEG XL (next-gen quality, limited browser support).'
		},
		{
			question: 'What is the difference between PNG and OxiPNG?',
			answer:
				'Both produce lossless PNG output. OxiPNG applies additional optimization passes (via the oxipng WebAssembly codec) to produce smaller files than the standard browser PNG encoder, at the cost of slightly longer encoding time. The pixel content is identical.'
		},
		{
			question: 'What quality setting should I use?',
			answer:
				'Each codec has a sensible default: WebP at 80, JPEG at 75, AVIF at 50, JPEG XL at 75. Lower values shrink the file further at the cost of visible artifacts. The quality slider adjusts the codec\'s internal quantization parameter — there is no universal "equivalent quality" across codecs.'
		},
		{
			question: 'Why is AVIF so much slower than WebP?',
			answer:
				'AVIF encoding is computationally expensive — the codec trades CPU time for file size. Expect 2-10x longer encoding time compared to WebP at equivalent visual quality. The result is typically 30-50% smaller than WebP, which is worth it for images served at scale.'
		}
	];
</script>

<ToolShell
	path="/photo/compress"
	tagline="Convert and compress images to WebP, AVIF, JPEG XL, or PNG with full quality control. No upload needed."
	seoTitle="Compress Images Online Free — WebP, AVIF, JPEG XL | nah.tools"
	description="Compress images to WebP, AVIF, JPEG, PNG, OxiPNG, or JPEG XL in your browser. Free, unlimited, no upload — powered by WebAssembly codecs."
	{faqs}
>
	<section class="mx-auto max-w-3xl space-y-6">
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

		<div class="space-y-4 rounded-xl border border-border bg-surface-alt p-6">
			<h2 class="font-display text-lg font-700">Six formats, one tool — no upload required</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				Image compression tools that run server-side charge per image, impose file size limits, or quietly retain your uploads. This tool encodes entirely in your browser using WebAssembly builds of the same codecs used in production image pipelines.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				WebP is the right default for most use cases: excellent compression, fast encoding, and universal browser support since 2020. AVIF cuts file size by another 30-50% at the cost of slower encoding — worthwhile for high-traffic pages where bandwidth savings add up. JPEG XL offers the best theoretical quality-to-size ratio but has limited native browser support as of 2026.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				For lossless output — screenshots, graphics, icons — PNG and OxiPNG preserve every pixel. OxiPNG applies extra optimization passes to produce files 10-20% smaller than standard PNG with identical content. All processing happens locally; nothing is transmitted.
			</p>
		</div>
	</section>
</ToolShell>
