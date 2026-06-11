<script lang="ts">
	import ToolShell from '$components/ToolShell.svelte';
	import MediaDropZone from '$components/media/MediaDropZone.svelte';
	import MediaLoadingOverlay from '$components/media/MediaLoadingOverlay.svelte';
	import ProcessingProgress from '$components/media/ProcessingProgress.svelte';
	import VideoPresetPicker from '$components/media/VideoPresetPicker.svelte';
	import { getFFmpeg, cancelFFmpeg } from '$media/ffmpeg-loader';
	import { compressVideo } from '$media/processor';
	import { VIDEO_PRESETS } from '$media/presets';
	import type { VideoCompressConfig, LoadProgress, ProcessingProgress as PP } from '$media/types';

	let file = $state<File | null>(null);
	let preset = $state<string>('social');
	let processing = $state(false);
	let loadProgress = $state<LoadProgress>({ state: 'idle', percent: 0 });
	let processingProgress = $state<PP>({ percent: 0, timeElapsed: 0, estimatedTotal: 0 });
	let error = $state('');
	let result = $state<{ originalSize: number; resultSize: number; keptOriginal: boolean } | null>(null);

	// Local state for the custom preset panel — isolated from the imported constant.
	let customCrf = $state(28);
	let customAudioBitrate = $state('128k');
	let customMaxWidth = $state(1920);
	let customMaxHeight = $state(1080);
	let customFps = $state<number | null>(null);

	let canProcess = $derived(!!file && !processing && loadProgress.state === 'ready');

	let currentPreset = $derived(VIDEO_PRESETS.find(p => p.id === preset) || VIDEO_PRESETS[0]);

	// When user picks a named preset, copy its values into custom fields so a
	// subsequent switch to "custom" starts from something sensible.
	$effect(() => {
		if (preset !== 'custom') {
			const p = VIDEO_PRESETS.find(p => p.id === preset);
			if (p) {
				customCrf = p.crf;
				customAudioBitrate = p.audioBitrate;
				customMaxWidth = p.maxWidth;
				customMaxHeight = p.maxHeight;
				customFps = p.fps;
			}
		}
	});

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
			const config: VideoCompressConfig =
				preset === 'custom'
					? {
							preset: 'custom',
							crf: customCrf,
							audioBitrate: customAudioBitrate,
							maxWidth: customMaxWidth,
							maxHeight: customMaxHeight,
							fps: customFps
						}
					: {
							preset: preset as VideoCompressConfig['preset'],
							crf: currentPreset.crf,
							audioBitrate: currentPreset.audioBitrate,
							maxWidth: currentPreset.maxWidth,
							maxHeight: currentPreset.maxHeight,
							fps: currentPreset.fps
						};

			const mediaResult = await compressVideo(file, config, p => (processingProgress = p));

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
			// Rejection from ffmpeg.terminate() during cancel is expected — don't surface it.
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
		// Terminate the FFmpeg worker so the in-flight exec() actually stops.
		// The singleton is cleared so the next run reloads it.
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
			question: 'Does my video get uploaded to a server?',
			answer:
				'No. Compression runs entirely in your browser using FFmpeg.wasm — a WebAssembly build of FFmpeg. Your video never leaves your device. The first time you use any media tool, the FFmpeg.wasm binary (about 25 MB) downloads from a CDN and is cached by your browser for all future visits.'
		},
		{
			question: 'What codec does the compressor use?',
			answer:
				'The tool encodes output as H.264 (libx264) in an MP4 container. H.264 is supported by virtually every device and video player. Audio is re-encoded at the bitrate specified by the preset (96k for Email, 128k for Social and Web).'
		},
		{
			question: 'What do the presets actually do?',
			answer:
				'Each preset sets a CRF (Constant Rate Factor) value and maximum resolution. Email (CRF 32, 720p max, 30 fps) targets files under 25 MB for attachments. Social (CRF 26, 1080p max, 30 fps) balances quality and size for platforms like Twitter and Instagram. Web (CRF 23, 1080p max, original fps) keeps the best quality at a reasonable file size. Higher CRF = more compression = smaller file with some quality loss.'
		},
		{
			question: 'What if the compressed file is larger than the original?',
			answer:
				'The tool detects this automatically. If the re-encoded output would be larger than the original, it downloads the original file unchanged and shows a note explaining the situation. You can try a more aggressive CRF or lower resolution via the Custom preset.'
		},
		{
			question: 'What video formats can I compress?',
			answer:
				'FFmpeg.wasm can read most common video containers: MP4, MOV, AVI, MKV, WebM, and others. The output is always MP4 with H.264 video. If your source format is not recognized, you will see an error message.'
		}
	];
</script>

<ToolShell
	path="/media/compress-video"
	tagline="Reduce video file size for email, sharing, or storage — choose a preset or dial in custom settings."
	seoTitle="Compress Video Free Online — Reduce Video File Size"
	description="Reduce video file size for email or sharing. Choose presets or customize settings. Free, no upload — processed in your browser with FFmpeg.wasm."
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

					<VideoPresetPicker bind:selected={preset} presets={VIDEO_PRESETS} />

					{#if preset === 'custom'}
						<div class="space-y-4 rounded-lg border border-border bg-surface-alt p-4">
							<div class="grid gap-4 sm:grid-cols-2">
								<div>
									<label for="crf" class="block text-sm font-medium text-text">Quality (CRF)</label>
									<input
										id="crf"
										type="range"
										min="18"
										max="40"
										bind:value={customCrf}
										class="mt-2 w-full"
									/>
									<div class="mt-1 flex justify-between text-xs text-text-muted">
										<span>Higher quality</span>
										<span class="font-mono">{customCrf}</span>
										<span>Smaller file</span>
									</div>
								</div>

								<div>
									<label for="ab" class="block text-sm font-medium text-text">Audio Bitrate</label>
									<input
										id="ab"
										type="text"
										bind:value={customAudioBitrate}
										class="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
									/>
									<p class="mt-1 text-xs text-text-muted">e.g., 96k, 128k, 192k</p>
								</div>
							</div>

							<div class="grid gap-4 sm:grid-cols-3">
								<div>
									<label for="w" class="block text-sm font-medium text-text">Max Width</label>
									<input
										id="w"
										type="number"
										bind:value={customMaxWidth}
										class="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
									/>
								</div>

								<div>
									<label for="h" class="block text-sm font-medium text-text">Max Height</label>
									<input
										id="h"
										type="number"
										bind:value={customMaxHeight}
										class="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
									/>
								</div>

								<div>
									<label for="fps" class="block text-sm font-medium text-text">FPS</label>
									<input
										id="fps"
										type="number"
										bind:value={customFps}
										class="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
									/>
									<p class="mt-1 text-xs text-text-muted">Leave blank for original</p>
								</div>
							</div>
						</div>
					{/if}

					<button
						onclick={handleCompress}
						disabled={!canProcess}
						class="w-full rounded-lg bg-accent px-4 py-3 font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-accent/90"
					>
						{#if processing}
							<span>Processing...</span>
						{:else}
							Compress Video
						{/if}
					</button>

					{#if result}
						{#if result.keptOriginal}
							<div class="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
								<div class="font-medium">Already optimized</div>
								<p class="text-xs">
									This video is already smaller than what the compressor would produce. The original file was downloaded instead. Try a more aggressive quality setting or a lower resolution.
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
			<h2 class="font-display text-lg font-700">How video compression works here</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				Most online video compressors route your files through a server. Your footage gets uploaded, processed on hardware you don't control, then downloaded back. That approach is slow and exposes your content to a third party.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				This tool runs <strong class="font-medium text-text">FFmpeg.wasm</strong> — a full build of FFmpeg compiled to WebAssembly — directly in your browser tab. The first time you use any media tool on nah.tools, the WASM binary (roughly 25 MB) downloads from a CDN and is stored in your browser cache. Subsequent uses are instant. Nothing leaves your device during compression.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				The three built-in presets cover the most common use cases: shrinking a recording to fit under an email attachment limit, preparing a clip for social media upload, and reducing file size for web embedding while keeping good visual quality. The Custom preset exposes the underlying FFmpeg parameters — CRF, resolution cap, frame rate, and audio bitrate — so you have full control when the presets don't fit your needs.
			</p>
		</div>
	</section>
</ToolShell>

<MediaLoadingOverlay state={loadProgress.state} percent={loadProgress.percent} onRetry={handleRetry} />

{#if processing}
	<ProcessingProgress progress={processingProgress} onCancel={handleCancel} />
{/if}
