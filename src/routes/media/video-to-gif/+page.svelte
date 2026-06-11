<script lang="ts">
	import ToolShell from '$components/ToolShell.svelte';
	import MediaDropZone from '$components/media/MediaDropZone.svelte';
	import MediaLoadingOverlay from '$components/media/MediaLoadingOverlay.svelte';
	import ProcessingProgress from '$components/media/ProcessingProgress.svelte';
	import TrimControls from '$components/media/TrimControls.svelte';
	import { getFFmpeg, cancelFFmpeg } from '$media/ffmpeg-loader';
	import { videoToGif } from '$media/processor';
	import type { LoadProgress, ProcessingProgress as PP, GifConfig } from '$media/types';

	let file = $state<File | null>(null);
	let startTime = $state(0);
	let endTime = $state(5);
	let duration = $state(0);
	let fps = $state(15);
	let width = $state(640);
	let processing = $state(false);
	let loadProgress = $state<LoadProgress>({ state: 'idle', percent: 0 });
	let processingProgress = $state<PP>({ percent: 0, timeElapsed: 0, estimatedTotal: 0 });
	let error = $state('');
	let result = $state<{ blob: Blob; filename: string } | null>(null);
	let gifPreviewUrl = $state('');
	let previewUrl = $state('');

	let canProcess = $derived(!!file && !processing && loadProgress.state === 'ready' && endTime > startTime);

	function formatSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}

	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	async function initFFmpeg() {
		if (loadProgress.state !== 'idle') return;

		try {
			await getFFmpeg(p => (loadProgress = p));
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load FFmpeg';
			loadProgress = { state: 'error', percent: 0 };
		}
	}

	async function handleCreateGif() {
		if (!canProcess || !file) return;

		processing = true;
		error = '';
		result = null;

		try {
			const config: GifConfig = {
				fps,
				width,
				startTime,
				endTime
			};

			const mediaResult = await videoToGif(file, config, p => (processingProgress = p));

			if (gifPreviewUrl) URL.revokeObjectURL(gifPreviewUrl);
			result = {
				blob: mediaResult.blob,
				filename: mediaResult.filename
			};
			gifPreviewUrl = URL.createObjectURL(mediaResult.blob);
		} catch (e) {
			if (!(e instanceof Error && e.message.includes('terminate'))) {
				error = e instanceof Error ? e.message : 'GIF creation failed';
			}
		} finally {
			processing = false;
		}
	}

	function handleRetry() {
		loadProgress = { state: 'idle', percent: 0 };
		initFFmpeg();
	}

	function handleCancel() {
		cancelFFmpeg();
		processing = false;
		loadProgress = { state: 'idle', percent: 0 };
	}

	function downloadGif() {
		if (!result) return;

		const url = URL.createObjectURL(result.blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = result.filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	function onFileSelect(selectedFile: File) {
		// Revoke the previous preview URL before creating a new one to avoid leaks.
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
		}
		file = selectedFile;
		previewUrl = URL.createObjectURL(selectedFile);

		if (loadProgress.state === 'idle') {
			initFFmpeg();
		}
	}

	// Revoke both preview URLs on component teardown.
	$effect(() => {
		return () => {
			if (previewUrl) URL.revokeObjectURL(previewUrl);
			if (gifPreviewUrl) URL.revokeObjectURL(gifPreviewUrl);
		};
	});

	const faqs = [
		{
			question: 'How does the GIF conversion work?',
			answer:
				'The tool uses a two-pass FFmpeg.wasm process for better color quality. Pass 1 extracts a palette from the video segment using the palettegen filter — this gives the GIF a custom 256-color palette tuned to the actual content. Pass 2 renders the GIF using that palette with the paletteuse filter and Lanczos scaling. The result is significantly better than a naive single-pass conversion.'
		},
		{
			question: 'Why are GIF files so large compared to the video?',
			answer:
				'GIF is an old format from 1989 that stores each frame as an indexed image with a maximum of 256 colors. It has no inter-frame compression like modern video codecs do. A 5-second clip at 15 fps and 640px wide generates 75 full frames. Keep the clip short (under 10 seconds), lower the FPS, and reduce the width to control file size.'
		},
		{
			question: 'Is my video uploaded to a server?',
			answer:
				'No. The entire conversion runs in your browser using FFmpeg.wasm — WebAssembly compiled from FFmpeg. The WASM binary (about 25 MB) downloads from a CDN on first use and is then cached by your browser. No video data leaves your device.'
		},
		{
			question: 'What FPS should I use?',
			answer:
				'15 fps is a good default — it produces smooth-looking GIFs at a manageable file size. Drop to 10 fps for maximum compression on simple motion or raise to 24-30 fps for fast action like sports clips. Note that most browsers cap GIF playback at 50 ms per frame (20 fps) regardless of the encoded frame rate.'
		},
		{
			question: 'What video formats can I convert to GIF?',
			answer:
				'FFmpeg.wasm reads most common video formats: MP4, MOV, AVI, MKV, WebM, and others. The source video must have a video stream. If your file has no video track (audio-only), the conversion will fail.'
		}
	];
</script>

<ToolShell
	path="/media/video-to-gif"
	tagline="Convert any video clip to a high-quality animated GIF with custom FPS, size, and time range."
	seoTitle="Video to GIF Converter Free Online — Animated GIFs"
	description="Convert video clips to animated GIFs. Adjust FPS, size, and time range. Free, no upload — processed in your browser with FFmpeg.wasm."
	{faqs}
>
	<section class="mx-auto max-w-2xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<MediaDropZone accept="video/*" onFileSelect={onFileSelect} label="Drop video here or click to browse" />

			{#if file}
				<div class="mt-4 space-y-6">
					<div class="rounded-lg border border-border bg-surface-alt p-3 text-sm text-text-muted">
						<span class="font-medium">File:</span> {file.name} ({formatSize(file.size)})
					</div>

					<div class="rounded-lg border border-border bg-surface-alt overflow-hidden">
						<!-- src bound reactively so the element always exists before the URL is set -->
						<video
							src={previewUrl}
							controls
							class="w-full"
							onloadedmetadata={(e) => {
								const v = e.currentTarget as HTMLVideoElement;
								duration = v.duration || 0;
								endTime = Math.min(5, duration);
							}}
						></video>
					</div>

					{#if duration > 0}
						<TrimControls bind:startTime bind:endTime {duration} />

						<div class="space-y-4 rounded-lg border border-border bg-surface-alt p-4">
							<div class="grid gap-4 sm:grid-cols-2">
								<div>
									<label for="fps" class="block text-sm font-medium text-text">
										FPS: {fps}
									</label>
									<input
										id="fps"
										type="range"
										min="5"
										max="30"
										bind:value={fps}
										class="mt-1 w-full accent-accent"
									/>
									<p class="mt-1 text-xs text-text-muted">Lower = smaller file, Higher = smoother</p>
								</div>

								<div>
									<label for="width" class="block text-sm font-medium text-text">
										Max Width: {width}px
									</label>
									<input
										id="width"
										type="range"
										min="320"
										max="1920"
										step="160"
										bind:value={width}
										class="mt-1 w-full accent-accent"
									/>
									<p class="mt-1 text-xs text-text-muted">Aspect ratio maintained</p>
								</div>
							</div>
						</div>

						<button
							onclick={handleCreateGif}
							disabled={!canProcess}
							class="w-full rounded-lg bg-accent px-4 py-3 font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-accent/90"
						>
							{#if processing}
								<span>Creating GIF...</span>
							{:else}
								Create GIF ({formatTime(endTime - startTime)})
							{/if}
						</button>

						{#if result}
							<div class="space-y-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
								<div class="font-medium">GIF created successfully!</div>
								<div class="text-xs">Size: {formatSize(result.blob.size)}</div>
							</div>

							<div class="rounded-lg border border-border bg-surface-alt overflow-hidden p-4">
								<img src={gifPreviewUrl} alt="GIF preview" class="max-w-full rounded" />
							</div>

							<button
								onclick={downloadGif}
								class="w-full rounded-lg border border-border px-4 py-3 font-medium text-text transition-all duration-200 hover:bg-surface-alt"
							>
								Download GIF
							</button>
						{/if}

						{#if error}
							<div class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
								{error}
							</div>
						{/if}
					{/if}
				</div>
			{/if}
		</div>

		<div class="space-y-4 rounded-xl border border-border bg-surface-alt p-6">
			<h2 class="font-display text-lg font-700">Two-pass GIF rendering for better color quality</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				A simple video-to-GIF converter just dumps frames as images and concatenates them. The color quality is usually poor because GIF only supports 256 colors and a generic palette doesn't represent the specific hues in your video well.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				This tool uses a two-pass approach powered by <strong class="font-medium text-text">FFmpeg.wasm</strong>. The first pass analyzes the video segment and generates a custom 256-color palette optimized for the actual content using FFmpeg's <code class="rounded bg-surface px-1 font-mono text-xs">palettegen</code> filter. The second pass renders the GIF using that palette and Lanczos downscaling, which produces noticeably sharper edges and more accurate colors than the default approach.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				Keep clips short — under 10 seconds — for manageable file sizes. Lower the FPS and width if you need a smaller GIF. The preview renders in the browser immediately after creation so you can judge quality before downloading.
			</p>
		</div>
	</section>
</ToolShell>

<MediaLoadingOverlay state={loadProgress.state} percent={loadProgress.percent} onRetry={handleRetry} />

{#if processing}
	<ProcessingProgress progress={processingProgress} onCancel={handleCancel} />
{/if}
