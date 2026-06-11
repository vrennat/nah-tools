<script lang="ts">
	import ToolShell from '$components/ToolShell.svelte';
	import MediaDropZone from '$components/media/MediaDropZone.svelte';
	import MediaLoadingOverlay from '$components/media/MediaLoadingOverlay.svelte';
	import ProcessingProgress from '$components/media/ProcessingProgress.svelte';
	import { getFFmpeg, cancelFFmpeg } from '$media/ffmpeg-loader';
	import { fadeAudio } from '$media/processor';
	import { AUDIO_FORMATS, type AudioFormat } from '$media/audio-types';
	import type { LoadProgress, ProcessingProgress as PP } from '$media/types';

	let file = $state<File | null>(null);
	let duration = $state(0);
	let previewUrl = $state('');
	let fadeInDuration = $state(2);
	let fadeOutDuration = $state(2);
	let format = $state<AudioFormat>('mp3');
	let processing = $state(false);
	let loadProgress = $state<LoadProgress>({ state: 'idle', percent: 0 });
	let processingProgress = $state<PP>({ percent: 0, timeElapsed: 0, estimatedTotal: 0 });
	let error = $state('');
	let result = $state<{ originalSize: number; resultSize: number; filename: string } | null>(null);

	// Fade durations must not overlap (in + out <= total duration).
	let canProcess = $derived(
		!!file &&
			!processing &&
			loadProgress.state === 'ready' &&
			duration > 0 &&
			(fadeInDuration > 0 || fadeOutDuration > 0) &&
			fadeInDuration + fadeOutDuration <= duration
	);

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
			await getFFmpeg((p) => (loadProgress = p));
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load FFmpeg';
			loadProgress = { state: 'error', percent: 0 };
		}
	}

	async function handleProcess() {
		if (!canProcess || !file) return;
		processing = true;
		error = '';
		result = null;

		try {
			const mediaResult = await fadeAudio(
				file,
				{ fadeInDuration, fadeOutDuration, totalDuration: duration, format },
				(p) => (processingProgress = p)
			);
			result = {
				originalSize: mediaResult.originalSize,
				resultSize: mediaResult.resultSize,
				filename: mediaResult.filename
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
				error = e instanceof Error ? e.message : 'Processing failed';
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
		if (previewUrl) URL.revokeObjectURL(previewUrl);
		file = selectedFile;
		previewUrl = URL.createObjectURL(selectedFile);
		result = null;
		if (loadProgress.state === 'idle') initFFmpeg();
	}

	$effect(() => {
		return () => {
			if (previewUrl) URL.revokeObjectURL(previewUrl);
		};
	});

	const faqs = [
		{
			question: 'What does a fade in and fade out do?',
			answer:
				'Fade in gradually raises the volume from silence at the start of the clip. Fade out gradually lowers the volume to silence at the end. Both use a linear ramp. They are commonly used to avoid abrupt starts and stops in music, podcasts, and video backing tracks.'
		},
		{
			question: 'Can I apply only a fade in or only a fade out?',
			answer:
				'Yes. Set the duration you do not want to 0 seconds to disable it. You can apply a fade in with no fade out, a fade out with no fade in, or both simultaneously.'
		},
		{
			question: 'Is my audio uploaded anywhere?',
			answer:
				'No. All processing runs in your browser using FFmpeg.wasm — a WebAssembly build of FFmpeg. The WASM binary (about 25 MB) downloads from a CDN on first use and is then cached. Your audio never leaves your device.'
		},
		{
			question: 'Why do I need to know the audio duration?',
			answer:
				'The fade-out start time is calculated as (total duration - fade-out duration). To compute this accurately, the tool reads the duration from the HTML5 audio element after the file loads. Load a file and wait for the player to appear before adjusting the fade settings.'
		},
		{
			question: 'What happens if the fade in and fade out durations overlap?',
			answer:
				'The process button is disabled when the combined fade durations exceed the total audio duration. This prevents creating a fade-out that starts before the fade-in ends, which would produce silence in the middle of the clip.'
		}
	];
</script>

<ToolShell
	path="/audio/fade"
	tagline="Add fade in and fade out to audio clips for smooth starts and endings."
	seoTitle="Add Audio Fade In & Fade Out Free Online"
	description="Add fade in and fade out to any audio clip. Control each duration independently. Free, no upload — runs in your browser with FFmpeg.wasm."
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

					<div class="overflow-hidden rounded-lg border border-border bg-surface-alt">
						<audio
							src={previewUrl}
							controls
							class="w-full"
							onloadedmetadata={(e) => {
								const a = e.currentTarget as HTMLAudioElement;
								duration = a.duration || 0;
							}}
						></audio>
					</div>

					{#if duration > 0}
						<div class="text-xs text-text-muted">
							Duration: {formatTime(duration)} ({duration.toFixed(1)}s)
						</div>

						<label class="block space-y-2">
							<span class="flex items-center justify-between text-sm font-medium text-text">
								<span>Fade In Duration</span>
								<span class="font-mono text-accent">{fadeInDuration}s</span>
							</span>
							<input
								type="range"
								min="0"
								max={Math.floor(duration / 2)}
								step="0.5"
								bind:value={fadeInDuration}
								class="w-full accent-accent"
							/>
							<div class="flex justify-between text-xs text-text-muted">
								<span>0s (no fade in)</span>
								<span>{Math.floor(duration / 2)}s</span>
							</div>
						</label>

						<label class="block space-y-2">
							<span class="flex items-center justify-between text-sm font-medium text-text">
								<span>Fade Out Duration</span>
								<span class="font-mono text-accent">{fadeOutDuration}s</span>
							</span>
							<input
								type="range"
								min="0"
								max={Math.floor(duration / 2)}
								step="0.5"
								bind:value={fadeOutDuration}
								class="w-full accent-accent"
							/>
							<div class="flex justify-between text-xs text-text-muted">
								<span>0s (no fade out)</span>
								<span>{Math.floor(duration / 2)}s</span>
							</div>
						</label>

						{#if fadeInDuration + fadeOutDuration > duration}
							<div class="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
								Combined fade duration exceeds audio length. Reduce fade in or fade out.
							</div>
						{/if}

						<label class="block space-y-1.5">
							<span class="text-sm font-medium text-text">Output Format</span>
							<select
								bind:value={format}
								class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
							>
								{#each AUDIO_FORMATS as fmt}
									<option value={fmt.id}>{fmt.label} — {fmt.description}</option>
								{/each}
							</select>
						</label>

						<button
							onclick={handleProcess}
							disabled={!canProcess}
							class="w-full rounded-lg bg-accent px-4 py-3 font-medium text-white transition-all duration-200 hover:enabled:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{#if processing}
								Processing...
							{:else if fadeInDuration > 0 && fadeOutDuration > 0}
								Apply {fadeInDuration}s Fade In + {fadeOutDuration}s Fade Out
							{:else if fadeInDuration > 0}
								Apply {fadeInDuration}s Fade In
							{:else if fadeOutDuration > 0}
								Apply {fadeOutDuration}s Fade Out
							{:else}
								Set at least one fade duration
							{/if}
						</button>

						{#if result}
							<div class="space-y-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
								<div class="font-medium">Done!</div>
								<div class="space-y-1 text-xs">
									<div>Filename: {result.filename}</div>
									<div>Size: {formatSize(result.resultSize)} (from {formatSize(result.originalSize)})</div>
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
			<h2 class="font-display text-lg font-700">Smooth audio transitions with fade envelopes</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				Abrupt starts and stops are one of the most noticeable signs of rough audio editing. A fade in ramps the volume from silence at the beginning of the clip; a fade out ramps it back down to silence at the end. Together, they are the standard way to introduce and conclude a music track, podcast segment, or audio bed.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				This tool uses FFmpeg's <strong class="font-medium text-text">afade</strong> filter, applied independently for each end. The fade-in window starts at time 0; the fade-out window is positioned so it ends exactly at the last frame. Both use a linear amplitude ramp. Durations up to half the total clip length can be set for each fade.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				Load your audio, play it to confirm timing, set your fade durations, and download the result. Everything runs in your browser with <strong class="font-medium text-text">FFmpeg.wasm</strong>. No upload needed.
			</p>
		</div>
	</section>
</ToolShell>

<MediaLoadingOverlay state={loadProgress.state} percent={loadProgress.percent} onRetry={handleRetry} />

{#if processing}
	<ProcessingProgress progress={processingProgress} onCancel={handleCancel} />
{/if}
