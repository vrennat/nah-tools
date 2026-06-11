<script lang="ts">
	import ToolShell from '$components/ToolShell.svelte';
	import MediaDropZone from '$components/media/MediaDropZone.svelte';
	import MediaLoadingOverlay from '$components/media/MediaLoadingOverlay.svelte';
	import ProcessingProgress from '$components/media/ProcessingProgress.svelte';
	import { getFFmpeg, cancelFFmpeg } from '$media/ffmpeg-loader';
	import { shiftAudioPitch } from '$media/processor';
	import { AUDIO_FORMATS, type AudioFormat } from '$media/audio-types';
	import type { LoadProgress, ProcessingProgress as PP } from '$media/types';

	const SEMITONE_PRESETS = [
		{ value: -12, label: '-12st', description: 'Down one octave' },
		{ value: -7, label: '-7st', description: 'Down a fifth' },
		{ value: -5, label: '-5st', description: 'Down a fourth' },
		{ value: -2, label: '-2st', description: 'Down a tone' },
		{ value: 0, label: '0st', description: 'Original' },
		{ value: 2, label: '+2st', description: 'Up a tone' },
		{ value: 5, label: '+5st', description: 'Up a fourth' },
		{ value: 7, label: '+7st', description: 'Up a fifth' },
		{ value: 12, label: '+12st', description: 'Up one octave' }
	];

	let file = $state<File | null>(null);
	let semitones = $state(0);
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

	function formatSemitones(n: number): string {
		if (n === 0) return '0 semitones (original)';
		return `${n > 0 ? '+' : ''}${n} semitone${Math.abs(n) === 1 ? '' : 's'}`;
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
			const mediaResult = await shiftAudioPitch(
				file,
				{ semitones, format },
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
		file = selectedFile;
		result = null;
		if (loadProgress.state === 'idle') initFFmpeg();
	}

	const faqs = [
		{
			question: 'How does pitch shifting work without changing speed?',
			answer:
				'The tool uses a three-step FFmpeg filter chain: asetrate changes the interpreted sample rate to shift the pitch (higher sample rate = higher perceived pitch), aresample converts the audio back to the original sample rate (which stretches/compresses the waveform), and atempo adjusts the playback speed to compensate so the duration stays the same. The result is a pitch shift at constant speed.'
		},
		{
			question: 'What is a semitone?',
			answer:
				'A semitone is the smallest interval in standard Western music — one step on a piano keyboard. There are 12 semitones in an octave. Shifting by +12 semitones doubles the frequency (raises by one octave); shifting by -12 halves it. Smaller shifts like ±2 semitones are used to transpose a recording to a different key.'
		},
		{
			question: 'Is my audio uploaded anywhere?',
			answer:
				'No. All processing runs entirely in your browser using FFmpeg.wasm. The WASM binary (about 25 MB) downloads from a CDN on first use and is then cached. Your audio never leaves your device.'
		},
		{
			question: 'Will pitch shifting affect the quality?',
			answer:
				'The asetrate/aresample/atempo approach involves resampling, which introduces some minor quality trade-off at extreme shifts. For moderate ranges (±7 semitones), the result is generally clean. Using a lossless output format (WAV or FLAC) preserves as much quality as possible from the processing chain.'
		},
		{
			question: 'Why does the first run take longer?',
			answer:
				'FFmpeg.wasm (about 25 MB) downloads on first use and is cached by your browser. After that, subsequent operations start immediately without another download.'
		}
	];
</script>

<ToolShell
	path="/audio/pitch"
	tagline="Shift audio pitch up or down by semitones without changing playback speed."
	seoTitle="Shift Audio Pitch Free Online — Semitone Transposer"
	description="Transpose audio pitch by semitones without changing playback speed. Raise or lower by up to an octave. Free, no upload — runs in your browser with FFmpeg.wasm."
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

					<div class="space-y-3">
						<p class="text-sm font-medium text-text">Quick Presets</p>
						<div class="grid grid-cols-3 gap-2 sm:grid-cols-5">
							{#each SEMITONE_PRESETS as preset}
								<button
									onclick={() => (semitones = preset.value)}
									class="rounded-lg border px-2 py-2 text-xs font-medium transition-all duration-200"
									class:border-accent={semitones === preset.value}
									class:bg-accent={semitones === preset.value}
									class:text-white={semitones === preset.value}
									class:border-border={semitones !== preset.value}
									class:text-text={semitones !== preset.value}
									class:hover:border-accent={semitones !== preset.value}
								>
									{preset.label}
								</button>
							{/each}
						</div>
					</div>

					<label class="block space-y-2">
						<span class="flex items-center justify-between text-sm font-medium text-text">
							<span>Pitch Shift</span>
							<span class="font-mono text-accent">{semitones > 0 ? '+' : ''}{semitones} st</span>
						</span>
						<input
							type="range"
							min="-12"
							max="12"
							step="1"
							bind:value={semitones}
							class="w-full accent-accent"
						/>
						<div class="flex justify-between text-xs text-text-muted">
							<span>-12 (one octave down)</span>
							<span>+12 (one octave up)</span>
						</div>
					</label>

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
						{#if processing}Processing...{:else}Shift Pitch {formatSemitones(semitones)}{/if}
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
				</div>
			{/if}
		</div>

		<div class="space-y-4 rounded-xl border border-border bg-surface-alt p-6">
			<h2 class="font-display text-lg font-700">Transpose audio to any key</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				Pitch shifting has many practical uses: transposing a backing track to match a vocalist's range, moving an instrument recording to a different key for a mix, or creating harmonies and special effects. Standard pitch changes — like resampling — alter the duration as well as the pitch. That is rarely what you want.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				This tool chains three FFmpeg filters — <strong class="font-medium text-text">asetrate</strong>, <strong class="font-medium text-text">aresample</strong>, and <strong class="font-medium text-text">atempo</strong> — to change pitch while keeping playback duration constant. The input is first normalized to 44100 Hz, then the sample rate is adjusted to produce the desired pitch shift, then resampled back and time-stretched to compensate. The range is ±12 semitones (one full octave).
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				Everything runs in your browser with <strong class="font-medium text-text">FFmpeg.wasm</strong>. No server, no upload, no account.
			</p>
		</div>
	</section>
</ToolShell>

<MediaLoadingOverlay state={loadProgress.state} percent={loadProgress.percent} onRetry={handleRetry} />

{#if processing}
	<ProcessingProgress progress={processingProgress} onCancel={handleCancel} />
{/if}
