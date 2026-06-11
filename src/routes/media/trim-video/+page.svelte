<script lang="ts">
	import ToolShell from '$components/ToolShell.svelte';
	import MediaDropZone from '$components/media/MediaDropZone.svelte';
	import MediaLoadingOverlay from '$components/media/MediaLoadingOverlay.svelte';
	import ProcessingProgress from '$components/media/ProcessingProgress.svelte';
	import TrimControls from '$components/media/TrimControls.svelte';
	import { getFFmpeg, cancelFFmpeg } from '$media/ffmpeg-loader';
	import { trimVideo } from '$media/processor';
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

			const mediaResult = await trimVideo(file, config, p => (processingProgress = p));

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

	const faqs = [
		{
			question: 'Does trimming re-encode the video?',
			answer:
				'No. The trimmer uses FFmpeg\'s stream-copy mode (-c copy), which cuts the video at the requested timestamps without decoding or re-encoding the frames. This makes trimming very fast and preserves the original quality exactly. The tradeoff is that cut points snap to the nearest keyframe, so the actual start or end may be off by a fraction of a second.'
		},
		{
			question: 'Is my video uploaded anywhere?',
			answer:
				'No. Trimming runs entirely in your browser using FFmpeg.wasm — WebAssembly compiled from the same FFmpeg codebase used in professional video production. The WASM binary (about 25 MB) downloads once from a CDN on first use, then is cached by your browser. Your video files never leave your device.'
		},
		{
			question: 'What video formats can I trim?',
			answer:
				'FFmpeg.wasm supports most common containers: MP4, MOV, AVI, MKV, and WebM. The output is always an MP4 file. If your source container is not compatible with stream copy, FFmpeg will return an error and you may need to compress rather than trim.'
		},
		{
			question: 'How do I set precise start and end times?',
			answer:
				'After selecting a video, the HTML5 player appears above the trim controls. Scrub to find your cut points, then type exact values into the start and end time fields. The controls show the selected clip duration so you can confirm the range before trimming.'
		},
		{
			question: 'Why is the trimmed file slightly larger than expected?',
			answer:
				'Stream-copy includes any audio or video data between the last keyframe before your start point and the first keyframe after your end point. The extra frames are present in the file but are not displayed during playback. This is normal behavior for keyframe-aligned trimming.'
		}
	];
</script>

<ToolShell
	path="/media/trim-video"
	tagline="Cut a video to exactly the clip you need — set start and end times with a live preview."
	seoTitle="Trim Video Free Online — Cut Video to Time Range"
	description="Trim video to a specific time range. Preview and adjust start/end times. Free, no upload — processed in your browser with FFmpeg.wasm."
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
								endTime = Math.min(30, duration);
							}}
						></video>
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
								Trim Video ({formatTime(endTime - startTime)})
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

		<div class="space-y-4 rounded-xl border border-border bg-surface-alt p-6">
			<h2 class="font-display text-lg font-700">Fast, lossless video trimming in your browser</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				Video trimming tools usually work in one of two ways: upload your file to a server, or re-encode every frame locally to get frame-accurate cuts. Both approaches have costs — the first risks your privacy and is slow on large files; the second takes significant CPU time and degrades quality slightly with each encode.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				This tool takes a third path. It uses <strong class="font-medium text-text">FFmpeg.wasm</strong> in stream-copy mode, which cuts the video at keyframe boundaries without touching the encoded data. The result is near-instant trimming that preserves exactly the original codec, resolution, and quality. For most clips, the trim completes in a few seconds regardless of file size, because no video decoding occurs.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				Load your video, use the built-in player to identify your start and end points, then set the trim range with the controls below. The clip duration is shown in real time so you know exactly what you'll get before clicking Trim.
			</p>
		</div>
	</section>
</ToolShell>

<MediaLoadingOverlay state={loadProgress.state} percent={loadProgress.percent} onRetry={handleRetry} />

{#if processing}
	<ProcessingProgress progress={processingProgress} onCancel={handleCancel} />
{/if}
