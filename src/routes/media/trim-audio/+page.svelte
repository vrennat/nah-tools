<script lang="ts">
	import ToolShell from '$components/ToolShell.svelte';
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

	const faqs = [
		{
			question: 'Does trimming re-encode the audio?',
			answer:
				'No. The trimmer uses FFmpeg\'s stream-copy mode (-c copy), which cuts the file at the requested timestamps without decoding or re-encoding the audio data. This preserves the original quality and runs very quickly. Cut points snap to the nearest audio keyframe, so the actual boundaries may be off by a few milliseconds.'
		},
		{
			question: 'What audio formats can I trim?',
			answer:
				'FFmpeg.wasm supports the most common audio containers: MP3, M4A, OGG, WAV, FLAC, AAC, and WebM audio. The output keeps the same format as your input — trimming an MP3 gives you an MP3, trimming a WAV gives you a WAV.'
		},
		{
			question: 'Is my audio file uploaded anywhere?',
			answer:
				'No. Everything runs in your browser using FFmpeg.wasm — a WebAssembly build of FFmpeg. The binary (about 25 MB) loads from a CDN on first use and is then cached by your browser. Your audio never leaves your device.'
		},
		{
			question: 'How accurate are the trim points?',
			answer:
				'Stream-copy trimming snaps to keyframe boundaries in the encoded stream, so the actual cut may be within a fraction of a second of your requested time. For most audio formats (MP3, AAC, OGG) the difference is imperceptible. WAV and FLAC are sample-accurate since they are uncompressed.'
		},
		{
			question: 'Can I use this to extract a clip from a long podcast or recording?',
			answer:
				'Yes. Load the audio file, use the built-in player to locate the section you want, then set the start and end times with the trim controls. The tool will extract just that segment and download it with "_trimmed" appended to the filename.'
		}
	];
</script>

<ToolShell
	path="/media/trim-audio"
	tagline="Cut an audio file to exactly the clip you need — set start and end points with a live preview."
	seoTitle="Trim Audio Free Online — Cut Audio to Time Range"
	description="Trim audio to a specific time range. Preview and adjust start/end times. Free, no upload — processed in your browser with FFmpeg.wasm."
	{faqs}
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

		<div class="space-y-4 rounded-xl border border-border bg-surface-alt p-6">
			<h2 class="font-display text-lg font-700">Lossless audio trimming — no quality loss, no server</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				Trimming audio is a common task: cutting a clip from a long recording, removing silence at the start or end of a track, or isolating a section of a podcast. Most online tools send your file to a server to do this work. That means a potentially large upload, waiting for processing, and trusting a third party with your audio content.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				This trimmer uses <strong class="font-medium text-text">FFmpeg.wasm</strong> in stream-copy mode. Stream copy skips the decode-encode cycle entirely — it reads the encoded audio data and cuts it at the requested time boundaries without touching the underlying codec. The output is the same format as your input, at the same quality, and the operation completes in a fraction of the time a full re-encode would take.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				Load your file, listen in the browser player to find your cut points, set the range with the trim controls, and download the clip. Works with MP3, M4A, OGG, WAV, FLAC, and most other common audio formats.
			</p>
		</div>
	</section>
</ToolShell>

<MediaLoadingOverlay state={loadProgress.state} percent={loadProgress.percent} onRetry={handleRetry} />

{#if processing}
	<ProcessingProgress progress={processingProgress} onCancel={handleCancel} />
{/if}
