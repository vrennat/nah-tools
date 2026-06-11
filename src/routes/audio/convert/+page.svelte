<script lang="ts">
	import ToolShell from '$components/ToolShell.svelte';
	import MediaDropZone from '$components/media/MediaDropZone.svelte';
	import MediaLoadingOverlay from '$components/media/MediaLoadingOverlay.svelte';
	import ProcessingProgress from '$components/media/ProcessingProgress.svelte';
	import { getFFmpeg, cancelFFmpeg } from '$media/ffmpeg-loader';
	import { convertAudio } from '$media/processor';
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

	async function handleConvert() {
		if (!canProcess || !file) return;
		processing = true;
		error = '';
		result = null;

		try {
			const mediaResult = await convertAudio(file, format, (p) => (processingProgress = p));
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
				error = e instanceof Error ? e.message : 'Conversion failed';
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
			question: 'What audio formats can I convert between?',
			answer:
				'The converter supports MP3, WAV, OGG, M4A, FLAC, and AAC as output formats. WAV and FLAC are lossless; MP3, OGG, M4A, and AAC are lossy and encoded at 192 kbps. The input can be any audio format that FFmpeg can read, which includes all of the above plus others like WebM audio, AIFF, and more.'
		},
		{
			question: 'Does converting to a lossless format improve quality?',
			answer:
				'No. Converting a lossy file (like an MP3) to a lossless format (like WAV or FLAC) does not recover the quality lost during the original lossy encoding. It simply stores the same degraded audio in a larger container. Use lossless output only when your source is already lossless, or when you need format compatibility with a lossless-only target.'
		},
		{
			question: 'Is my audio file uploaded anywhere?',
			answer:
				'No. Conversion runs entirely in your browser using FFmpeg.wasm — a WebAssembly build of FFmpeg. The WASM binary (about 25 MB) loads from a CDN on first use, then is cached by your browser for future visits. Your audio never leaves your device.'
		},
		{
			question: 'What bitrate are lossy conversions encoded at?',
			answer:
				'Lossy output formats (MP3, OGG, M4A, AAC) are encoded at 192 kbps, which is high quality and suitable for most uses. If you need a specific bitrate, use the Compress Audio tool, which lets you select 64, 128, 192, or 320 kbps for MP3, AAC, and OGG output.'
		},
		{
			question: 'Why would I convert to M4A instead of AAC?',
			answer:
				'M4A is AAC audio wrapped in an MP4 container. The audio codec is the same; the difference is the file extension and container format. M4A is what Apple devices and iTunes expect. Raw AAC (.aac) is a headerless stream that some players prefer. Both are produced by the same FFmpeg aac encoder here.'
		}
	];
</script>

<ToolShell
	path="/audio/convert"
	tagline="Convert audio between MP3, WAV, OGG, M4A, FLAC, and AAC — all in your browser, no upload."
	seoTitle="Convert Audio Free Online — MP3, WAV, OGG, M4A, FLAC, AAC"
	description="Convert audio between MP3, WAV, OGG, M4A, FLAC, and AAC. Free, no upload — everything runs in your browser with FFmpeg.wasm."
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
						<legend class="text-sm font-medium text-text">Output Format</legend>
						<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
							{#each AUDIO_FORMATS as fmt}
								<label
									class="group flex cursor-pointer flex-col gap-0.5 rounded-lg border border-border p-3 transition-all duration-200"
									class:border-accent={format === fmt.id}
									style={format === fmt.id ? 'background-color: rgba(59, 130, 246, 0.05);' : ''}
								>
									<input type="radio" bind:group={format} value={fmt.id} class="sr-only" />
									<div class="font-medium text-text transition-colors group-hover:text-accent">{fmt.label}</div>
									<div class="text-xs text-text-muted">{fmt.description}</div>
								</label>
							{/each}
						</div>
					</fieldset>

					<button
						onclick={handleConvert}
						disabled={!canProcess}
						class="w-full rounded-lg bg-accent px-4 py-3 font-medium text-white transition-all duration-200 hover:enabled:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{#if processing}Converting...{:else}Convert Audio{/if}
					</button>

					{#if result}
						<div class="space-y-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
							<div class="font-medium">Audio converted successfully!</div>
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
			<h2 class="font-display text-lg font-700">Browser-based audio conversion with FFmpeg</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				Audio format requirements vary by platform and workflow. A podcast host might require MP3; a video editor might import WAV; an iOS device expects M4A; a web audio pipeline might want OGG for browser compatibility. Converting between these formats usually means finding an online converter that uploads your file, or installing desktop software.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				This converter runs <strong class="font-medium text-text">FFmpeg.wasm</strong> — the full FFmpeg encoder suite compiled to WebAssembly — directly in your browser tab. Lossy formats (MP3, OGG, M4A, AAC) are encoded at 192 kbps, which is high quality for general use. Lossless formats (WAV, FLAC) preserve every sample from your source without re-encoding losses.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				The first visit loads the WASM binary (roughly 25 MB) from a CDN, which your browser then caches. Subsequent conversions start immediately. No file leaves your device at any point.
			</p>
		</div>
	</section>
</ToolShell>

<MediaLoadingOverlay state={loadProgress.state} percent={loadProgress.percent} onRetry={handleRetry} />

{#if processing}
	<ProcessingProgress progress={processingProgress} onCancel={handleCancel} />
{/if}
