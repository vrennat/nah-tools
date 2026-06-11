<script lang="ts">
	import ToolShell from '$components/ToolShell.svelte';
	import MediaDropZone from '$components/media/MediaDropZone.svelte';
	import MediaLoadingOverlay from '$components/media/MediaLoadingOverlay.svelte';
	import ProcessingProgress from '$components/media/ProcessingProgress.svelte';
	import { getFFmpeg, cancelFFmpeg } from '$media/ffmpeg-loader';
	import { compressAudio } from '$media/processor';
	import { AUDIO_BITRATES } from '$media/presets';
	import type { AudioCompressConfig, LoadProgress, ProcessingProgress as PP } from '$media/types';

	let file = $state<File | null>(null);
	let bitrate = $state('128k');
	let format = $state<'mp3' | 'aac' | 'ogg'>('mp3');
	let processing = $state(false);
	let loadProgress = $state<LoadProgress>({ state: 'idle', percent: 0 });
	let processingProgress = $state<PP>({ percent: 0, timeElapsed: 0, estimatedTotal: 0 });
	let error = $state('');
	let result = $state<{ originalSize: number; resultSize: number; keptOriginal: boolean } | null>(null);

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

	async function handleCompress() {
		if (!canProcess || !file) return;

		processing = true;
		error = '';
		result = null;

		try {
			const config: AudioCompressConfig = {
				bitrate,
				format
			};

			const mediaResult = await compressAudio(file, config, p => (processingProgress = p));

			const keptOriginal = mediaResult.resultSize >= mediaResult.originalSize;
			const downloadBlob = keptOriginal ? file : mediaResult.blob;
			const downloadName = keptOriginal ? file.name : mediaResult.filename;

			result = {
				originalSize: mediaResult.originalSize,
				resultSize: keptOriginal ? mediaResult.originalSize : mediaResult.resultSize,
				keptOriginal
			};

			const url = URL.createObjectURL(downloadBlob);
			const a = document.createElement('a');
			a.href = url;
			a.download = downloadName;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch (e) {
			if (!(e instanceof Error && e.message.includes('terminate'))) {
				error = e instanceof Error ? e.message : 'Compression failed';
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
			question: 'What output formats does audio compression support?',
			answer:
				'The compressor outputs MP3 (via libmp3lame), AAC in an M4A container (via the FFmpeg aac encoder), or OGG Vorbis (via libvorbis). All three are lossy formats — the tool re-encodes your audio at the selected bitrate. MP3 is the most universally compatible. AAC offers better quality at the same bitrate. OGG is open-source and works well in web contexts.'
		},
		{
			question: 'What bitrate should I choose?',
			answer:
				'64 kbps is suitable for speech-only content where file size matters most. 128 kbps is a good all-purpose setting for podcasts and general audio. 192 kbps is high quality and appropriate for music or anything where fidelity matters. 320 kbps is near-transparent quality for most listeners and produces the largest files.'
		},
		{
			question: 'Is my audio uploaded to a server?',
			answer:
				'No. Compression runs in your browser using FFmpeg.wasm — a WebAssembly port of FFmpeg. The WASM binary (about 25 MB) downloads from a CDN the first time you use a media tool, then is cached for future visits. Your audio files never leave your device.'
		},
		{
			question: 'What if the compressed file is larger than the original?',
			answer:
				'This can happen when the source file is already highly compressed or at a lower bitrate than your selected target. The tool detects this and downloads the original file instead, with a note explaining what happened. Try selecting a lower bitrate.'
		},
		{
			question: 'Can I compress WAV or FLAC files down to MP3?',
			answer:
				'Yes. The input can be any audio format that FFmpeg can read — including WAV, FLAC, M4A, OGG, and more. Select MP3 as the output format and the desired bitrate, and the tool will convert and compress in one step.'
		}
	];
</script>

<ToolShell
	path="/media/compress-audio"
	tagline="Shrink audio files by adjusting bitrate and format — choose MP3, AAC, or OGG output."
	seoTitle="Compress Audio Free Online — Reduce Audio File Size"
	description="Reduce audio file size with adjustable bitrate. Choose MP3, AAC, or OGG format. Free, no upload — processed in your browser with FFmpeg.wasm."
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

					<fieldset class="space-y-2">
						<legend class="text-sm font-medium text-text">Format</legend>
						<div class="grid gap-2 sm:grid-cols-3">
							<label class="flex items-center gap-2">
								<input type="radio" bind:group={format} value="mp3" />
								<span class="text-sm text-text">MP3</span>
							</label>
							<label class="flex items-center gap-2">
								<input type="radio" bind:group={format} value="aac" />
								<span class="text-sm text-text">AAC</span>
							</label>
							<label class="flex items-center gap-2">
								<input type="radio" bind:group={format} value="ogg" />
								<span class="text-sm text-text">OGG</span>
							</label>
						</div>
					</fieldset>

					<fieldset class="space-y-2">
						<legend class="text-sm font-medium text-text">Bitrate</legend>
						<div class="space-y-2">
							{#each AUDIO_BITRATES as option (option.value)}
								<label
									class="group flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer transition-all duration-200"
									class:border-accent={bitrate === option.value}
									style={bitrate === option.value ? 'background-color: rgba(59, 130, 246, 0.05);' : ''}
								>
									<input
										type="radio"
										bind:group={bitrate}
										value={option.value}
										class="mt-1"
									/>
									<div class="flex-1">
										<div class="font-medium text-text group-hover:text-accent transition-colors">{option.label}</div>
										<div class="text-xs text-text-muted">{option.description}</div>
									</div>
								</label>
							{/each}
						</div>
					</fieldset>

					<button
						onclick={handleCompress}
						disabled={!canProcess}
						class="w-full rounded-lg bg-accent px-4 py-3 font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-accent/90"
					>
						{#if processing}
							<span>Compressing...</span>
						{:else}
							Compress Audio
						{/if}
					</button>

					{#if result}
						{#if result.keptOriginal}
							<div class="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
								<div class="font-medium">Already optimized</div>
								<p class="text-xs">
									This audio file is already smaller than what the compressor would produce. The original file was downloaded instead. Try a lower bitrate.
								</p>
								<div class="text-xs">
									File size: {formatSize(result.originalSize)}
								</div>
							</div>
						{:else}
							<div class="space-y-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
								<div class="font-medium">Compression complete!</div>
								<div class="space-y-1 text-xs">
									<div>Original: {formatSize(result.originalSize)}</div>
									<div>Compressed: {formatSize(result.resultSize)}</div>
									<div>
										Saved: {formatSize(result.originalSize - result.resultSize)} ({Math.round(
											((result.originalSize - result.resultSize) / result.originalSize) * 100
										)}%)
									</div>
								</div>
							</div>
						{/if}
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
			<h2 class="font-display text-lg font-700">Why compress audio in your browser?</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				Large audio files create friction: slow email attachments, storage limits on messaging apps, and long upload times for podcast hosts. Compression reduces file size by re-encoding at a lower bitrate — the perceived quality loss is minimal at 128 kbps or higher for most content.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				This tool runs <strong class="font-medium text-text">FFmpeg.wasm</strong> in your browser, with no server involved. The FFmpeg WASM binary (about 25 MB) downloads from a CDN on first use and is cached for future visits. Compression happens locally — useful for audio containing sensitive or private content you don't want passing through a third-party service.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				Choose your output format (MP3 for widest compatibility, AAC for better quality-per-bit, OGG for open-source contexts) and target bitrate, then compress. If your file is already smaller than the target, the original is returned unchanged.
			</p>
		</div>
	</section>
</ToolShell>

<MediaLoadingOverlay state={loadProgress.state} percent={loadProgress.percent} onRetry={handleRetry} />

{#if processing}
	<ProcessingProgress progress={processingProgress} onCancel={handleCancel} />
{/if}
