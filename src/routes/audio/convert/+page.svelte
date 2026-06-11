<script lang="ts">
	import MediaToolLayout from '$components/media/MediaToolLayout.svelte';
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
</script>

<svelte:head>
	<title>Convert Audio Free Online — MP3, WAV, OGG, M4A, FLAC, AAC | nah</title>
	<meta
		name="description"
		content="Convert audio between MP3, WAV, OGG, M4A, FLAC, and AAC. Free, no upload — everything runs in your browser."
	/>
	<link rel="canonical" href="https://nah.tools/audio/convert" />
</svelte:head>

<MediaToolLayout
	title="Convert Audio"
	description="Change your audio file's format. MP3, WAV, OGG, M4A, FLAC, or AAC."
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
	</section>
</MediaToolLayout>

<MediaLoadingOverlay state={loadProgress.state} percent={loadProgress.percent} onRetry={handleRetry} />

{#if processing}
	<ProcessingProgress progress={processingProgress} onCancel={handleCancel} />
{/if}
