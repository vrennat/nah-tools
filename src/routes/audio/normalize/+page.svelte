<script lang="ts">
	import ToolShell from '$components/ToolShell.svelte';
	import MediaDropZone from '$components/media/MediaDropZone.svelte';
	import MediaLoadingOverlay from '$components/media/MediaLoadingOverlay.svelte';
	import ProcessingProgress from '$components/media/ProcessingProgress.svelte';
	import { getFFmpeg, cancelFFmpeg } from '$media/ffmpeg-loader';
	import { normalizeAudio } from '$media/processor';
	import { AUDIO_FORMATS, type AudioFormat } from '$media/audio-types';
	import type { LoadProgress, ProcessingProgress as PP } from '$media/types';

	const LOUDNESS_TARGETS = [
		{ value: -23, label: 'Broadcast (-23 LUFS)', description: 'EBU R128 broadcast standard' },
		{ value: -16, label: 'Streaming (-16 LUFS)', description: 'Spotify, podcasts, web' },
		{ value: -14, label: 'Loud (-14 LUFS)', description: 'YouTube, louder playback' }
	];

	let file = $state<File | null>(null);
	let targetLufs = $state(-16);
	let format = $state<AudioFormat>('mp3');
	let processing = $state(false);
	let loadProgress = $state<LoadProgress>({ state: 'idle', percent: 0 });
	let processingProgress = $state<PP>({ percent: 0, timeElapsed: 0, estimatedTotal: 0 });
	let error = $state('');
	let result = $state<{ originalSize: number; resultSize: number; filename: string } | null>(null);

	let canProcess = $derived(!!file && !processing && loadProgress.state === 'ready');

	function formatSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

	async function handleNormalize() {
		if (!canProcess || !file) return;
		processing = true;
		error = '';
		result = null;

		try {
			const mediaResult = await normalizeAudio(file, { targetLufs, format }, (p) => (processingProgress = p));
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
				error = e instanceof Error ? e.message : 'Normalization failed';
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
		file = selectedFile;
		result = null;
		if (loadProgress.state === 'idle') initFFmpeg();
	}

	const faqs = [
		{
			question: 'What is EBU R128 loudness normalization?',
			answer:
				'EBU R128 is the European Broadcasting Union\'s standard for measuring and controlling loudness in audio and broadcast media. It uses integrated loudness in LUFS (Loudness Units relative to Full Scale) rather than peak level, which better matches how human hearing perceives volume. The standard also specifies a true-peak ceiling of -1 dBTP to prevent clipping after digital-to-analog conversion.'
		},
		{
			question: 'What LUFS target should I use?',
			answer:
				'-16 LUFS is the right choice for most streaming content — Spotify targets -14 LUFS, Apple Podcasts recommends -16 LUFS, and most podcast players are calibrated around this range. Use -23 LUFS for broadcast television or radio content that must meet the EBU R128 standard. Use -14 LUFS for YouTube uploads or any context where you want louder playback.'
		},
		{
			question: 'Is this single-pass or two-pass normalization?',
			answer:
				'Single-pass. The tool uses FFmpeg\'s loudnorm filter with integrated loudness target, true-peak ceiling of -1.5 dBTP, and a loudness range (LRA) of 11 LU. Single-pass is fast and produces good results for most content. Two-pass normalization (where a first pass measures the actual loudness before the second pass corrects it) would be more accurate but is not implemented here.'
		},
		{
			question: 'Is my audio uploaded anywhere?',
			answer:
				'No. Normalization runs entirely in your browser using FFmpeg.wasm — a WebAssembly build of FFmpeg. The WASM binary (about 25 MB) downloads from a CDN on first use and is then cached by your browser. Your audio never leaves your device.'
		},
		{
			question: 'What output formats are supported?',
			answer:
				'The normalizer can output MP3, WAV, OGG, M4A, FLAC, or AAC. Lossy formats (MP3, OGG, M4A, AAC) are encoded at 192 kbps. Lossless formats (WAV, FLAC) preserve full sample depth. The input can be any format FFmpeg can read.'
		}
	];
</script>

<ToolShell
	path="/audio/normalize"
	tagline="Even out audio loudness to a consistent level using EBU R128 — broadcast, streaming, or YouTube targets."
	seoTitle="Normalize Audio Volume Free Online — EBU R128 Loudness"
	description="Normalize audio loudness to a consistent level using the EBU R128 standard. Free, no upload — runs entirely in your browser with FFmpeg.wasm."
	{faqs}
>
	<section class="mx-auto max-w-2xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<MediaDropZone accept="audio/*" {onFileSelect} label="Drop audio here or click to browse" />

			{#if file}
				<div class="mt-4 space-y-6">
					<div class="rounded-lg border border-border bg-surface-alt p-3 text-sm text-text-muted">
						<span class="font-medium">File:</span> {file.name} ({formatSize(file.size)})
					</div>

					<fieldset class="space-y-3">
						<legend class="text-sm font-medium text-text">Loudness Target</legend>
						<div class="space-y-2">
							{#each LOUDNESS_TARGETS as target}
								<label
									class="group flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 transition-all duration-200"
									class:border-accent={targetLufs === target.value}
									style={targetLufs === target.value ? 'background-color: rgba(59, 130, 246, 0.05);' : ''}
								>
									<input type="radio" bind:group={targetLufs} value={target.value} class="mt-1" />
									<div class="flex-1">
										<div class="font-medium text-text transition-colors group-hover:text-accent">{target.label}</div>
										<div class="text-xs text-text-muted">{target.description}</div>
									</div>
								</label>
							{/each}
						</div>
					</fieldset>

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
						onclick={handleNormalize}
						disabled={!canProcess}
						class="w-full rounded-lg bg-accent px-4 py-3 font-medium text-white transition-all duration-200 hover:enabled:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{#if processing}Normalizing...{:else}Normalize Audio{/if}
					</button>

					{#if result}
						<div class="space-y-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
							<div class="font-medium">Audio normalized successfully!</div>
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
				</div>
			{/if}
		</div>

		<div class="space-y-4 rounded-xl border border-border bg-surface-alt p-6">
			<h2 class="font-display text-lg font-700">Consistent loudness with EBU R128</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				Volume inconsistency is a common problem when working with audio from multiple sources — field recordings, voiceovers, interviews, or music tracks recorded at different times. One clip sounds quiet; the next blows out the speakers. Peak normalization (raising the loudest peak to 0 dB) doesn't solve this because it doesn't account for the perceptual loudness of a track as a whole.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				EBU R128 integrated loudness normalization measures the average loudness of the entire track in LUFS and adjusts the gain so the output matches your target. This is what streaming platforms do automatically when they ingest your audio — Spotify normalizes to -14 LUFS, Apple Podcasts to -16 LUFS, and broadcast targets -23 LUFS. Matching these targets before upload means your audio won't be silently boosted or attenuated by the platform.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				The normalization runs in your browser using <strong class="font-medium text-text">FFmpeg.wasm</strong>. No upload required. Choose your loudness target, select an output format, and normalize.
			</p>
		</div>
	</section>
</ToolShell>

<MediaLoadingOverlay state={loadProgress.state} percent={loadProgress.percent} onRetry={handleRetry} />

{#if processing}
	<ProcessingProgress progress={processingProgress} onCancel={handleCancel} />
{/if}
