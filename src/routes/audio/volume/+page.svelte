<script lang="ts">
	import ToolShell from '$components/ToolShell.svelte';
	import MediaDropZone from '$components/media/MediaDropZone.svelte';
	import MediaLoadingOverlay from '$components/media/MediaLoadingOverlay.svelte';
	import ProcessingProgress from '$components/media/ProcessingProgress.svelte';
	import { getFFmpeg, cancelFFmpeg } from '$media/ffmpeg-loader';
	import { adjustAudioVolume } from '$media/processor';
	import { AUDIO_FORMATS, type AudioFormat } from '$media/audio-types';
	import type { LoadProgress, ProcessingProgress as PP } from '$media/types';

	const VOLUME_PRESETS = [
		{ value: -20, label: '-20 dB', description: 'Much quieter' },
		{ value: -10, label: '-10 dB', description: 'Quieter' },
		{ value: -6, label: '-6 dB', description: 'Half volume' },
		{ value: 0, label: '0 dB', description: 'No change' },
		{ value: 3, label: '+3 dB', description: 'Slightly louder' },
		{ value: 6, label: '+6 dB', description: 'Double volume' },
		{ value: 10, label: '+10 dB', description: 'Much louder' },
		{ value: 20, label: '+20 dB', description: 'Boost' }
	];

	let file = $state<File | null>(null);
	let decibels = $state(0);
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

	function formatDb(db: number): string {
		return `${db >= 0 ? '+' : ''}${db} dB`;
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
			const mediaResult = await adjustAudioVolume(
				file,
				{ decibels, format },
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
			question: 'What does dB mean for volume?',
			answer:
				'+6 dB doubles the perceived loudness; -6 dB halves it. 0 dB means no change. +3 dB is a noticeable but moderate boost. Values above +10 dB risk digital clipping if the source is already close to full scale — use the normalize tool if you want loudness-safe adjustment.'
		},
		{
			question: 'Can boosting volume cause distortion?',
			answer:
				'Yes. If the audio waveform already has peaks near 0 dBFS, a positive gain will push those peaks over 0 dBFS, causing hard clipping and audible distortion. To boost safely, first run normalization to bring the loudness down to a comfortable level, then apply the volume boost.'
		},
		{
			question: 'Is my audio uploaded anywhere?',
			answer:
				'No. All processing runs in your browser using FFmpeg.wasm — a WebAssembly build of FFmpeg. The WASM binary (about 25 MB) downloads from a CDN on first use and is then cached. Your audio never leaves your device.'
		},
		{
			question: 'What is the difference between volume adjustment and normalization?',
			answer:
				'Volume adjustment applies a fixed dB gain to the entire file. Normalization measures the integrated loudness of the file and adjusts the gain to hit a target level (e.g., -16 LUFS). Use normalization when you want consistent loudness; use volume adjustment when you have a specific gain offset in mind.'
		},
		{
			question: 'Why does the first run take longer?',
			answer:
				'FFmpeg.wasm (about 25 MB) downloads on first use and is cached by your browser. After that, subsequent operations start immediately.'
		}
	];
</script>

<ToolShell
	path="/audio/volume"
	tagline="Boost or reduce audio volume by a precise dB amount — no upload required."
	seoTitle="Adjust Audio Volume Free Online — dB Booster & Reducer"
	description="Boost or reduce audio volume by a specific number of decibels. Simple gain control from -20 dB to +20 dB. Free, no upload — runs in your browser with FFmpeg.wasm."
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
						<div class="grid grid-cols-4 gap-2">
							{#each VOLUME_PRESETS as preset}
								<button
									onclick={() => (decibels = preset.value)}
									class="rounded-lg border px-2 py-2 text-xs font-medium transition-all duration-200"
									class:border-accent={decibels === preset.value}
									class:bg-accent={decibels === preset.value}
									class:text-white={decibels === preset.value}
									class:border-border={decibels !== preset.value}
									class:text-text={decibels !== preset.value}
									class:hover:border-accent={decibels !== preset.value}
								>
									{preset.label}
								</button>
							{/each}
						</div>
					</div>

					<label class="block space-y-2">
						<span class="flex items-center justify-between text-sm font-medium text-text">
							<span>Volume Adjustment</span>
							<span class="font-mono text-accent">{formatDb(decibels)}</span>
						</span>
						<input
							type="range"
							min="-20"
							max="20"
							step="1"
							bind:value={decibels}
							class="w-full accent-accent"
						/>
						<div class="flex justify-between text-xs text-text-muted">
							<span>-20 dB (quieter)</span>
							<span>+20 dB (louder)</span>
						</div>
					</label>

					{#if decibels > 10}
						<div class="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
							High boosts may clip audio that is already close to full scale. Consider normalizing first.
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
						{#if processing}Processing...{:else}Adjust Volume {formatDb(decibels)}{/if}
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
			<h2 class="font-display text-lg font-700">Precise decibel-level volume control</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				Sometimes you have audio that is simply too quiet or too loud, and you want to apply a specific gain rather than target a loudness standard. A podcast recorded too quietly, a notification sound that is too jarring, a background music track that needs to sit under a voiceover — these are all fixed with a direct dB adjustment.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				The tool applies FFmpeg's <strong class="font-medium text-text">volume</strong> filter, which multiplies the audio samples by the linear equivalent of your dB value. The adjustment range is -20 to +20 dB. At +6 dB, amplitude doubles; at -6 dB, it halves. Boosts above the file's headroom will clip — to avoid this, normalize the file first.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				Processing runs entirely in your browser with <strong class="font-medium text-text">FFmpeg.wasm</strong>. No upload, no server, no account required.
			</p>
		</div>
	</section>
</ToolShell>

<MediaLoadingOverlay state={loadProgress.state} percent={loadProgress.percent} onRetry={handleRetry} />

{#if processing}
	<ProcessingProgress progress={processingProgress} onCancel={handleCancel} />
{/if}
