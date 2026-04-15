<script lang="ts">
	import MediaToolLayout from '$components/media/MediaToolLayout.svelte';
	import MediaDropZone from '$components/media/MediaDropZone.svelte';
	import MediaLoadingOverlay from '$components/media/MediaLoadingOverlay.svelte';
	import ProcessingProgress from '$components/media/ProcessingProgress.svelte';
	import { getFFmpeg } from '$media/ffmpeg-loader';
	import { extractAudio } from '$media/processor';
	import { AUDIO_BITRATES } from '$media/presets';
	import type { LoadProgress, ProcessingProgress as PP } from '$media/types';

	let file = $state<File | null>(null);
	let format = $state<'mp3' | 'aac' | 'ogg'>('mp3');
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
			await getFFmpeg(p => (loadProgress = p));
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load FFmpeg';
			loadProgress = { state: 'error', percent: 0 };
		}
	}

	async function handleExtract() {
		if (!canProcess || !file) return;

		processing = true;
		error = '';
		result = null;

		try {
			const mediaResult = await extractAudio(file, format, p => (processingProgress = p));

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
			error = e instanceof Error ? e.message : 'Extraction failed';
		} finally {
			processing = false;
		}
	}

	function handleRetry() {
		loadProgress = { state: 'idle', percent: 0 };
		initFFmpeg();
	}

	function onFileSelect(selectedFile: File) {
		file = selectedFile;
		if (loadProgress.state === 'idle') {
			initFFmpeg();
		}
	}
</script>

<svelte:head>
	<title>Extract Audio from Video Free Online — Pull Audio Track | nah</title>
	<meta
		name="description"
		content="Extract audio track from any video file. Choose MP3, AAC, or OGG format. Free, no upload — processed in your browser."
	/>
</svelte:head>

<MediaToolLayout
	title="Extract Audio"
	description="Pull the audio track from any video file and save it as audio."
>
	<section class="mx-auto max-w-2xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<MediaDropZone accept="video/*" onFileSelect={onFileSelect} label="Drop video here or click to browse" />

			{#if file}
				<div class="mt-4 space-y-6">
					<div class="rounded-lg border border-border bg-surface-alt p-3 text-sm text-text-muted">
						<span class="font-medium">File:</span> {file.name} ({formatSize(file.size)})
					</div>

					<fieldset class="space-y-3">
						<legend class="text-sm font-medium text-text">Output Format</legend>
						<div class="space-y-2">
							<label
								class="group flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer transition-all duration-200"
								class:border-accent={format === 'mp3'}
								style={format === 'mp3' ? 'background-color: rgba(59, 130, 246, 0.05);' : ''}
							>
								<input
									type="radio"
									bind:group={format}
									value="mp3"
									class="mt-1"
								/>
								<div class="flex-1">
									<div class="font-medium text-text group-hover:text-accent transition-colors">MP3</div>
									<div class="text-xs text-text-muted">Universal compatibility</div>
								</div>
							</label>

							<label
								class="group flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer transition-all duration-200"
								class:border-accent={format === 'aac'}
								style={format === 'aac' ? 'background-color: rgba(59, 130, 246, 0.05);' : ''}
							>
								<input
									type="radio"
									bind:group={format}
									value="aac"
									class="mt-1"
								/>
								<div class="flex-1">
									<div class="font-medium text-text group-hover:text-accent transition-colors">AAC</div>
									<div class="text-xs text-text-muted">Better compression</div>
								</div>
							</label>

							<label
								class="group flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer transition-all duration-200"
								class:border-accent={format === 'ogg'}
								style={format === 'ogg' ? 'background-color: rgba(59, 130, 246, 0.05);' : ''}
							>
								<input
									type="radio"
									bind:group={format}
									value="ogg"
									class="mt-1"
								/>
								<div class="flex-1">
									<div class="font-medium text-text group-hover:text-accent transition-colors">OGG</div>
									<div class="text-xs text-text-muted">Open format, good quality</div>
								</div>
							</label>
						</div>
					</fieldset>

					<button
						onclick={handleExtract}
						disabled={!canProcess}
						class="w-full rounded-lg bg-accent px-4 py-3 font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-accent/90"
					>
						{#if processing}
							<span>Extracting...</span>
						{:else}
							Extract Audio
						{/if}
					</button>

					{#if result}
						<div class="space-y-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
							<div class="font-medium">Audio extracted successfully!</div>
							<div class="space-y-1 text-xs">
								<div>Filename: {result.filename}</div>
								<div>Size: {formatSize(result.resultSize)}</div>
								<div>
									Reduced from: {formatSize(result.originalSize)}
								</div>
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
	<ProcessingProgress progress={processingProgress} onCancel={() => (processing = false)} />
{/if}
