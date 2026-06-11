<script lang="ts">
	import ToolShell from '$components/ToolShell.svelte';
	import MediaDropZone from '$components/media/MediaDropZone.svelte';
	import MediaLoadingOverlay from '$components/media/MediaLoadingOverlay.svelte';
	import ProcessingProgress from '$components/media/ProcessingProgress.svelte';
	import { getFFmpeg, cancelFFmpeg } from '$media/ffmpeg-loader';
	import { changeAudioSpeed } from '$media/processor';
	import { AUDIO_FORMATS, type AudioFormat } from '$media/audio-types';
	import type { LoadProgress, ProcessingProgress as PP } from '$media/types';

	const SPEED_PRESETS = [
		{ value: 0.25, label: '0.25x', description: 'Quarter speed' },
		{ value: 0.5, label: '0.5x', description: 'Half speed' },
		{ value: 0.75, label: '0.75x', description: 'Slower' },
		{ value: 1.0, label: '1x', description: 'Original' },
		{ value: 1.25, label: '1.25x', description: 'Faster' },
		{ value: 1.5, label: '1.5x', description: 'Quicker' },
		{ value: 2.0, label: '2x', description: 'Double speed' },
		{ value: 3.0, label: '3x', description: 'Triple speed' }
	];

	let file = $state<File | null>(null);
	let speed = $state(1.5);
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

	async function handleProcess() {
		if (!canProcess || !file) return;
		processing = true;
		error = '';
		result = null;

		try {
			const mediaResult = await changeAudioSpeed(
				file,
				{ speed, format },
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
			question: 'Does changing speed affect audio pitch?',
			answer:
				'No. This tool uses FFmpeg\'s atempo filter, which changes playback speed while preserving the original pitch. It does this with time-domain resampling (TDHS), which stretches or compresses the audio without shifting frequency content. You get faster or slower audio that sounds the same tonally.'
		},
		{
			question: 'What speed range is supported?',
			answer:
				'0.25x to 3.0x. The atempo filter natively supports 0.5–2.0; speeds outside that range are handled by chaining multiple atempo filters. For example, 0.25x is achieved with atempo=0.5,atempo=0.5 and 3.0x with atempo=2.0,atempo=1.5.'
		},
		{
			question: 'Is my audio uploaded anywhere?',
			answer:
				'No. All processing runs in your browser using FFmpeg.wasm — a WebAssembly build of FFmpeg. The WASM binary (about 25 MB) downloads from a CDN on first use and is cached by your browser. Your audio never leaves your device.'
		},
		{
			question: 'Why does the first run take a moment to start?',
			answer:
				'The FFmpeg WebAssembly engine (~25 MB) has to download on first use. After that it is cached by the browser and subsequent operations start immediately.'
		},
		{
			question: 'What formats does this support?',
			answer:
				'Input: any format FFmpeg can read — MP3, WAV, OGG, M4A, FLAC, AAC, OPUS, AIFF, and more. Output: MP3, WAV, OGG, M4A, FLAC, or AAC. Lossy formats are encoded at 192 kbps; lossless formats preserve full bit depth.'
		}
	];
</script>

<ToolShell
	path="/audio/speed"
	tagline="Change audio playback speed without altering pitch — from quarter-speed to triple-speed."
	seoTitle="Change Audio Speed Free Online — Pitch-Preserving"
	description="Speed up or slow down audio without pitch distortion. Choose from presets or a custom multiplier. Free, no upload — runs in your browser with FFmpeg.wasm."
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
						<p class="text-sm font-medium text-text">Speed Presets</p>
						<div class="grid grid-cols-4 gap-2">
							{#each SPEED_PRESETS as preset}
								<button
									onclick={() => (speed = preset.value)}
									class="rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200"
									class:border-accent={speed === preset.value}
									class:bg-accent={speed === preset.value}
									class:text-white={speed === preset.value}
									class:border-border={speed !== preset.value}
									class:text-text={speed !== preset.value}
									class:hover:border-accent={speed !== preset.value}
								>
									{preset.label}
								</button>
							{/each}
						</div>
					</div>

					<label class="block space-y-2">
						<span class="flex items-center justify-between text-sm font-medium text-text">
							<span>Custom Speed</span>
							<span class="font-mono text-accent">{speed}x</span>
						</span>
						<input
							type="range"
							min="0.25"
							max="3"
							step="0.05"
							bind:value={speed}
							class="w-full accent-accent"
						/>
						<div class="flex justify-between text-xs text-text-muted">
							<span>0.25x (slowest)</span>
							<span>3x (fastest)</span>
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
						{#if processing}Processing...{:else}Change Speed to {speed}x{/if}
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
			<h2 class="font-display text-lg font-700">Pitch-preserving speed change</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				Changing audio speed is useful in many practical situations: speeding up a recorded lecture to save listening time, slowing down a music track to learn an instrument part, or stretching a clip to fit a specific duration. A naive speed change — like resampling — shifts pitch proportionally to the tempo. That produces the "chipmunk" effect at high speeds and a sluggish, bass-heavy result at low speeds.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				This tool uses FFmpeg's <strong class="font-medium text-text">atempo</strong> filter, which uses time-domain harmonic scaling (TDHS) to change duration without touching frequency content. The pitch of voices and instruments stays the same at any speed setting. Supported range is 0.25x to 3x; the output duration scales inversely with the speed factor.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				Processing runs entirely in your browser with <strong class="font-medium text-text">FFmpeg.wasm</strong>. No file upload, no account, no limit on file size.
			</p>
		</div>
	</section>
</ToolShell>

<MediaLoadingOverlay state={loadProgress.state} percent={loadProgress.percent} onRetry={handleRetry} />

{#if processing}
	<ProcessingProgress progress={processingProgress} onCancel={handleCancel} />
{/if}
