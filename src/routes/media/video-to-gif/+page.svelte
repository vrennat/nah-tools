<script lang="ts">
	import MediaToolLayout from '$components/media/MediaToolLayout.svelte';
	import MediaDropZone from '$components/media/MediaDropZone.svelte';
	import MediaLoadingOverlay from '$components/media/MediaLoadingOverlay.svelte';
	import ProcessingProgress from '$components/media/ProcessingProgress.svelte';
	import TrimControls from '$components/media/TrimControls.svelte';
	import { getFFmpeg } from '$media/ffmpeg-loader';
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
	let videoRef: HTMLVideoElement | null = $state(null);

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
			error = e instanceof Error ? e.message : 'GIF creation failed';
		} finally {
			processing = false;
		}
	}

	function handleRetry() {
		loadProgress = { state: 'idle', percent: 0 };
		initFFmpeg();
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
		file = selectedFile;
		const url = URL.createObjectURL(selectedFile);
		if (videoRef) {
			videoRef.src = url;
			videoRef.onloadedmetadata = () => {
				duration = videoRef?.duration || 0;
				endTime = Math.min(5, duration);
			};
		}

		if (loadProgress.state === 'idle') {
			initFFmpeg();
		}
	}
</script>

<svelte:head>
	<title>Convert Video to GIF Free Online — Animated GIFs | nah</title>
	<meta
		name="description"
		content="Convert video clips to animated GIFs. Adjust FPS, size, and time range. Free, no upload — processed in your browser."
	/>
</svelte:head>

<MediaToolLayout
	title="Video to GIF"
	description="Convert video clips to animated GIFs with adjustable quality and duration."
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
						<video
							bind:this={videoRef}
							controls
							class="w-full"
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
	</section>
</MediaToolLayout>

<MediaLoadingOverlay state={loadProgress.state} percent={loadProgress.percent} onRetry={handleRetry} />

{#if processing}
	<ProcessingProgress progress={processingProgress} onCancel={() => (processing = false)} />
{/if}
