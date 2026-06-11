<script lang="ts">
	import ToolShell from '$components/ToolShell.svelte';
	import MediaDropZone from '$components/media/MediaDropZone.svelte';
	import MediaLoadingOverlay from '$components/media/MediaLoadingOverlay.svelte';
	import ProcessingProgress from '$components/media/ProcessingProgress.svelte';
	import { getFFmpeg, cancelFFmpeg } from '$media/ffmpeg-loader';
	import { reverseAudio } from '$media/processor';
	import { AUDIO_FORMATS, type AudioFormat } from '$media/audio-types';
	import type { LoadProgress, ProcessingProgress as PP } from '$media/types';

	let file = $state<File | null>(null);
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
			const mediaResult = await reverseAudio(file, format, (p) => (processingProgress = p));
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
			question: 'Does reversing audio affect quality?',
			answer:
				'The reversal itself is lossless — it is a sample-order operation. However, the output is re-encoded to your chosen format. Choosing a lossless format (WAV or FLAC) means no quality loss from encoding. Lossy formats (MP3, OGG, M4A, AAC) apply compression, the same as any other encode.'
		},
		{
			question: 'Why might reversal fail on very long files?',
			answer:
				'FFmpeg\'s areverse filter must buffer the entire audio stream in memory before it can start writing reversed output. For very long files on devices with limited RAM (mobile phones, older hardware), this can exhaust available memory and cause the process to fail. As a rough guide, files over 30–60 minutes may be at risk depending on the sample rate and number of channels.'
		},
		{
			question: 'Is my audio uploaded anywhere?',
			answer:
				'No. All processing runs in your browser using FFmpeg.wasm — a WebAssembly build of FFmpeg. The WASM binary (about 25 MB) downloads from a CDN on first use and is then cached. Your audio never leaves your device.'
		},
		{
			question: 'What is reversed audio used for?',
			answer:
				'Common uses include creating reversed reverb effects (recording a sound, reversing it, adding reverb, reversing again), creating ambient textures, and audio production effects. Reversing speech produces the classic "backmasking" effect used in film and music production.'
		},
		{
			question: 'Why does the first run take a moment to start?',
			answer:
				'FFmpeg.wasm (about 25 MB) downloads on first use and is cached by your browser. After that, subsequent operations start immediately.'
		}
	];
</script>

<ToolShell
	path="/audio/reverse"
	tagline="Play audio backwards — reverse any clip for effects, ambient textures, or production work."
	seoTitle="Reverse Audio Free Online — Play Audio Backwards"
	description="Reverse any audio file to play it backwards. Simple one-click reversal for effects and production. Free, no upload — runs in your browser with FFmpeg.wasm."
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

					<div class="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
						The areverse filter buffers the entire file in memory before reversing. Very long files (30+ minutes) may fail on low-RAM devices.
					</div>

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
						{#if processing}Processing...{:else}Reverse Audio{/if}
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
			<h2 class="font-display text-lg font-700">Reverse audio for effects and production</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				Reversed audio is a classic production technique used in film, music, and sound design. Reversed reverb — where a sound is reversed, treated with reverb, then reversed again — creates a characteristic swoosh before the main hit that has been used in recorded music since the 1960s. Reversed speech, reversed ambient recordings, and reversed instrument samples each produce distinct textural effects.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				This tool uses FFmpeg's <strong class="font-medium text-text">areverse</strong> filter to flip the sample order of the entire audio stream. Because the filter must read all samples into memory before writing any output, the processing time and memory usage scale with file size. Short sound effects and clips will process quickly; very long recordings may take longer or require a desktop browser with sufficient RAM.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				Drop your file, select an output format, and download the reversed result. Everything runs in your browser with <strong class="font-medium text-text">FFmpeg.wasm</strong>. Nothing is uploaded.
			</p>
		</div>
	</section>
</ToolShell>

<MediaLoadingOverlay state={loadProgress.state} percent={loadProgress.percent} onRetry={handleRetry} />

{#if processing}
	<ProcessingProgress progress={processingProgress} onCancel={handleCancel} />
{/if}
