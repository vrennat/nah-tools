<script lang="ts">
	import MediaToolLayout from '$components/media/MediaToolLayout.svelte';
	import MediaDropZone from '$components/media/MediaDropZone.svelte';
	import MediaLoadingOverlay from '$components/media/MediaLoadingOverlay.svelte';
	import ProcessingProgress from '$components/media/ProcessingProgress.svelte';
	import TrimControls from '$components/media/TrimControls.svelte';
	import { getFFmpeg, cancelFFmpeg } from '$media/ffmpeg-loader';
	import { trimAudio } from '$media/processor';
	import type { LoadProgress, ProcessingProgress as PP, TrimConfig } from '$media/types';

	let file = $state<File | null>(null);
	let startTime = $state(0);
	let endTime = $state(30);
	let duration = $state(0);
	let processing = $state(false);
	let loadProgress = $state<LoadProgress>({ state: 'idle', percent: 0 });
	let processingProgress = $state<PP>({ percent: 0, timeElapsed: 0, estimatedTotal: 0 });
	let error = $state('');
	let result = $state<{ originalSize: number; resultSize: number } | null>(null);
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

	async function handleTrim() {
		if (!canProcess || !file) return;

		processing = true;
		error = '';
		result = null;

		try {
			const config: TrimConfig = {
				startTime,
				endTime
			};

			const mediaResult = await trimAudio(file, config, p => (processingProgress = p));

			result = {
				originalSize: mediaResult.originalSize,
				resultSize: mediaResult.resultSize
			};

			const url = URL.createObjectURL(mediaResult.blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = mediaResult.filename;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch (e) {
			if (!(e instanceof Error && e.message.includes('terminate'))) {
				error = e instanceof Error ? e.message : 'Trim failed';
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

	// Revoke preview URL on component teardown.
	$effect(() => {
		return () => {
			if (previewUrl) URL.revokeObjectURL(previewUrl);
		};
	});
</script>

<svelte:head>
	<title>Trim Audio Free Online — Cut Audio Time Range | nah</title>
	<meta
		name="description"
		content="Trim audio to a specific time range. Preview and adjust start/end times. Free, no upload — processed in your browser."
	/>
</svelte:head>

<MediaToolLayout
	title="Trim Audio"
	description="Cut audio to a specific time range. Set start and end points with preview."
>
	<section class="mx-auto max-w-2xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<MediaDropZone accept="audio/*" onFileSelect={onFileSelect} label="Drop audio here or click to browse" />

			{#if file}
				<div class="mt-4 space-y-6">
					<div class="rounded-lg border border-border bg-surface-alt p-3 text-sm text-text-muted">
						<span class="font-medium">File:</span> {file.name} ({formatSize(file.size)})
					</div>

					<div class="rounded-lg border border-border bg-surface-alt overflow-hidden">
						<!-- src bound reactively so the element always exists before the URL is set -->
						<audio
							src={previewUrl}
							controls
							class="w-full"
							onloadedmetadata={(e) => {
								const a = e.currentTarget as HTMLAudioElement;
								duration = a.duration || 0;
								endTime = Math.min(30, duration);
							}}
						></audio>
					</div>

					{#if duration > 0}
						<TrimControls bind:startTime bind:endTime {duration} />

						<button
							onclick={handleTrim}
							disabled={!canProcess}
							class="w-full rounded-lg bg-accent px-4 py-3 font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-accent/90"
						>
							{#if processing}
								<span>Trimming...</span>
							{:else}
								Trim Audio ({formatTime(endTime - startTime)})
							{/if}
						</button>

						{#if result}
							<div class="space-y-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
								<div class="font-medium">Trim complete!</div>
								<div class="space-y-1 text-xs">
									<div>Original: {formatSize(result.originalSize)}</div>
									<div>Trimmed: {formatSize(result.resultSize)}</div>
									<div>
										Saved: {formatSize(result.originalSize - result.resultSize)} ({Math.round(
											((result.originalSize - result.resultSize) / result.originalSize) * 100
										)}%)
									</div>
								</div>
							</div>
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
	<ProcessingProgress progress={processingProgress} onCancel={handleCancel} />
{/if}
