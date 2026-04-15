<script lang="ts">
	import MediaToolLayout from '$components/media/MediaToolLayout.svelte';
	import MediaDropZone from '$components/media/MediaDropZone.svelte';
	import MediaLoadingOverlay from '$components/media/MediaLoadingOverlay.svelte';
	import ProcessingProgress from '$components/media/ProcessingProgress.svelte';
	import VideoPresetPicker from '$components/media/VideoPresetPicker.svelte';
	import { getFFmpeg } from '$media/ffmpeg-loader';
	import { compressVideo } from '$media/processor';
	import { VIDEO_PRESETS, type VideoPreset } from '$media/presets';
	import type { VideoCompressConfig, LoadProgress, ProcessingProgress as PP } from '$media/types';

	let file = $state<File | null>(null);
	let preset = $state<string>('social');
	let processing = $state(false);
	let loadProgress = $state<LoadProgress>({ state: 'idle', percent: 0 });
	let processingProgress = $state<PP>({ percent: 0, timeElapsed: 0, estimatedTotal: 0 });
	let error = $state('');
	let result = $state<{ originalSize: number; resultSize: number; keptOriginal: boolean } | null>(null);

	let canProcess = $derived(!!file && !processing && loadProgress.state === 'ready');

	let currentPreset = $derived(VIDEO_PRESETS.find(p => p.id === preset) || VIDEO_PRESETS[0]);

	function formatSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

	async function handleCompress() {
		if (!canProcess || !file) return;

		processing = true;
		error = '';
		result = null;

		try {
			const config: VideoCompressConfig = {
				preset: preset as VideoCompressConfig['preset'],
				crf: currentPreset.crf,
				audioBitrate: currentPreset.audioBitrate,
				maxWidth: currentPreset.maxWidth,
				maxHeight: currentPreset.maxHeight,
				fps: currentPreset.fps
			};

			const mediaResult = await compressVideo(file, config, p => (processingProgress = p));

			const keptOriginal = mediaResult.resultSize >= mediaResult.originalSize;
			const downloadBlob = keptOriginal ? file : mediaResult.blob;
			const downloadName = keptOriginal ? file.name : mediaResult.filename;

			result = {
				originalSize: mediaResult.originalSize,
				resultSize: keptOriginal ? mediaResult.originalSize : mediaResult.resultSize,
				keptOriginal
			};

			const url = URL.createObjectURL(downloadBlob);
			const a = document.createElement('a');
			a.href = url;
			a.download = downloadName;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Compression failed';
		} finally {
			processing = false;
		}
	}

	function handleRetry() {
		loadProgress = { state: 'idle', percent: 0 };
		initFFmpeg();
	}

	function onFileSelect(selectedFile: File) {
		file = selectedFile;
		if (loadProgress.state === 'idle') {
			initFFmpeg();
		}
	}
</script>

<svelte:head>
	<title>Compress Video Free Online — Reduce Video Size | nah</title>
	<meta
		name="description"
		content="Reduce video file size for email or sharing. Choose presets or customize settings. Free, no upload — processed in your browser."
	/>
</svelte:head>

<MediaToolLayout
	title="Compress Video"
	description="Reduce file size without losing much quality. Choose a preset or customize settings."
>
	<section class="mx-auto max-w-2xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<MediaDropZone accept="video/*" onFileSelect={onFileSelect} label="Drop video here or click to browse" />

			{#if file}
				<div class="mt-4 space-y-6">
					<div class="rounded-lg border border-border bg-surface-alt p-3 text-sm text-text-muted">
						<span class="font-medium">File:</span> {file.name} ({formatSize(file.size)})
					</div>

					<VideoPresetPicker bind:selected={preset} presets={VIDEO_PRESETS} />

					{#if preset === 'custom'}
						<div class="space-y-4 rounded-lg border border-border bg-surface-alt p-4">
							<div class="grid gap-4 sm:grid-cols-2">
								<div>
									<label for="crf" class="block text-sm font-medium text-text">Quality (CRF)</label>
									<input
										id="crf"
										type="range"
										min="18"
										max="40"
										bind:value={currentPreset.crf}
										class="mt-2 w-full"
									/>
									<div class="mt-1 flex justify-between text-xs text-text-muted">
										<span>Higher quality</span>
										<span class="font-mono">{currentPreset.crf}</span>
										<span>Smaller file</span>
									</div>
								</div>

								<div>
									<label for="ab" class="block text-sm font-medium text-text">Audio Bitrate</label>
									<input
										id="ab"
										type="text"
										bind:value={currentPreset.audioBitrate}
										class="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
									/>
									<p class="mt-1 text-xs text-text-muted">e.g., 96k, 128k, 192k</p>
								</div>
							</div>

							<div class="grid gap-4 sm:grid-cols-3">
								<div>
									<label for="w" class="block text-sm font-medium text-text">Max Width</label>
									<input
										id="w"
										type="number"
										bind:value={currentPreset.maxWidth}
										class="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
									/>
								</div>

								<div>
									<label for="h" class="block text-sm font-medium text-text">Max Height</label>
									<input
										id="h"
										type="number"
										bind:value={currentPreset.maxHeight}
										class="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
									/>
								</div>

								<div>
									<label for="fps" class="block text-sm font-medium text-text">FPS</label>
									<input
										id="fps"
										type="number"
										bind:value={currentPreset.fps}
										class="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
									/>
									<p class="mt-1 text-xs text-text-muted">Leave blank for original</p>
								</div>
							</div>
						</div>
					{/if}

					<button
						onclick={handleCompress}
						disabled={!canProcess}
						class="w-full rounded-lg bg-accent px-4 py-3 font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-accent/90"
					>
						{#if processing}
							<span>Processing...</span>
						{:else}
							Compress Video
						{/if}
					</button>

					{#if result}
						{#if result.keptOriginal}
							<div class="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
								<div class="font-medium">Already optimized</div>
								<p class="text-xs">
									This video is already smaller than what the compressor would produce. The original file was downloaded instead. Try a more aggressive quality setting or a lower resolution.
								</p>
								<div class="text-xs">
									File size: {formatSize(result.originalSize)}
								</div>
							</div>
						{:else}
							<div class="space-y-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
								<div class="font-medium">Compression complete!</div>
								<div class="space-y-1 text-xs">
									<div>Original: {formatSize(result.originalSize)}</div>
									<div>Compressed: {formatSize(result.resultSize)}</div>
									<div>
										Saved: {formatSize(result.originalSize - result.resultSize)} ({Math.round(
											((result.originalSize - result.resultSize) / result.originalSize) * 100
										)}%)
									</div>
								</div>
							</div>
						{/if}
					{/if}

					{#if error}
						<div class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
							{error}
						</div>
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
