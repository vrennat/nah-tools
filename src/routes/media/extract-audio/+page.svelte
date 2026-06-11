<script lang="ts">
	import ToolShell from '$components/ToolShell.svelte';
	import MediaDropZone from '$components/media/MediaDropZone.svelte';
	import MediaLoadingOverlay from '$components/media/MediaLoadingOverlay.svelte';
	import ProcessingProgress from '$components/media/ProcessingProgress.svelte';
	import { getFFmpeg, cancelFFmpeg } from '$media/ffmpeg-loader';
	import { extractAudio } from '$media/processor';
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
			if (!(e instanceof Error && e.message.includes('terminate'))) {
				error = e instanceof Error ? e.message : 'Extraction failed';
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
		if (loadProgress.state === 'idle') {
			initFFmpeg();
		}
	}

	const faqs = [
		{
			question: 'What output formats does audio extraction support?',
			answer:
				'The tool extracts audio as MP3 (via libmp3lame at 192 kbps), AAC in an M4A container (via the FFmpeg aac encoder at 192 kbps), or OGG Vorbis (via libvorbis at 192 kbps). These are the three formats supported by the extraction function. If you need WAV, FLAC, or other formats, use the Convert Audio tool after extracting.'
		},
		{
			question: 'Does extraction re-encode the audio?',
			answer:
				'Yes. The extractor uses FFmpeg with -vn (strip video) and re-encodes the audio at 192 kbps in your chosen format. This ensures compatibility across output formats regardless of what codec the original video used. The 192 kbps bitrate preserves high quality while keeping file sizes reasonable.'
		},
		{
			question: 'Is my video uploaded to a server?',
			answer:
				'No. Extraction runs in your browser using FFmpeg.wasm — a WebAssembly build of FFmpeg. The WASM binary (about 25 MB) loads from a CDN on first use and is then cached by your browser. Your video files never leave your device.'
		},
		{
			question: 'What video formats can I extract audio from?',
			answer:
				'FFmpeg.wasm handles most common video containers: MP4, MOV, AVI, MKV, WebM, and more. The video must contain an audio track. If the file has no audio stream, FFmpeg will report an error.'
		},
		{
			question: 'Can I extract audio from a recording I made on my phone?',
			answer:
				'Yes. Phone recordings (typically MP4 with AAC audio on iOS, or MP4 with AAC/AMR on Android) are fully supported. Drop the file, choose your preferred output format, and extract. The result downloads directly to your device.'
		}
	];
</script>

<ToolShell
	path="/media/extract-audio"
	tagline="Pull the audio track from any video and save it as MP3, AAC, or OGG — entirely in your browser."
	seoTitle="Extract Audio from Video Free Online — Pull Audio Track"
	description="Extract audio track from any video file. Choose MP3, AAC, or OGG format. Free, no upload — processed in your browser with FFmpeg.wasm."
	{faqs}
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

		<div class="space-y-4 rounded-xl border border-border bg-surface-alt p-6">
			<h2 class="font-display text-lg font-700">Pull audio from video — no server, no upload</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				Extracting audio from a video is useful in many situations: saving the soundtrack from a music video, pulling the audio from a lecture recording, converting a screen recording to a podcast episode, or separating narration from a presentation. Most tools that do this require you to upload potentially large video files to a remote server.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				This extractor uses <strong class="font-medium text-text">FFmpeg.wasm</strong> running directly in your browser. Drop your video, choose the output format (MP3 for maximum compatibility, AAC for better efficiency, OGG for open-source workflows), and extract. The audio is downloaded immediately. Nothing is transmitted to a server.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				The extraction re-encodes the audio at 192 kbps, which is high quality for all three supported formats. If you need the audio in a different format after extraction, the Convert Audio tool on nah.tools can handle the second step.
			</p>
		</div>
	</section>
</ToolShell>

<MediaLoadingOverlay state={loadProgress.state} percent={loadProgress.percent} onRetry={handleRetry} />

{#if processing}
	<ProcessingProgress progress={processingProgress} onCancel={handleCancel} />
{/if}
