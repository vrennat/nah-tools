<script lang="ts">
	import ToolShell from '$components/ToolShell.svelte';
	import MediaDropZone from '$components/media/MediaDropZone.svelte';
	import MediaLoadingOverlay from '$components/media/MediaLoadingOverlay.svelte';
	import ProcessingProgress from '$components/media/ProcessingProgress.svelte';
	import { getFFmpeg, cancelFFmpeg } from '$media/ffmpeg-loader';
	import { removeSilence } from '$media/processor';
	import { AUDIO_FORMATS, type AudioFormat } from '$media/audio-types';
	import type { LoadProgress, ProcessingProgress as PP } from '$media/types';

	let file = $state<File | null>(null);
	let thresholdDb = $state(-45);
	let minSilenceDuration = $state(0.5);
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
			const mediaResult = await removeSilence(
				file,
				{ thresholdDb, minSilenceDuration, format },
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
			question: 'What does the silence threshold control?',
			answer:
				'The threshold sets the dB level below which audio is considered silence. A value of -45 dB means any audio quieter than -45 dBFS is treated as silence. Lower (more negative) values are more conservative — only removing very quiet sections. Higher values (e.g., -30 dB) are more aggressive and may remove low-level background noise along with actual silence.'
		},
		{
			question: 'What does the minimum silence duration control?',
			answer:
				'This is the shortest silence that will be removed. At 0.5 seconds, brief pauses shorter than half a second are kept intact — only longer gaps are trimmed. Increasing this value means only longer silences get removed, which is useful for preserving natural speech rhythm.'
		},
		{
			question: 'Does this remove silence from the middle of the recording as well?',
			answer:
				'This tool removes leading and trailing silence. It detects the first moment audio exceeds the threshold (trimming the silent start) and the last moment audio exceeds the threshold (trimming the silent end). Internal pauses within the audio are not removed, which preserves natural speech pacing.'
		},
		{
			question: 'Is my audio uploaded anywhere?',
			answer:
				'No. All processing runs in your browser using FFmpeg.wasm — a WebAssembly build of FFmpeg. The WASM binary (about 25 MB) downloads from a CDN on first use and is then cached. Your audio never leaves your device.'
		},
		{
			question: 'Why does the first run take a moment to start?',
			answer:
				'FFmpeg.wasm (about 25 MB) downloads on first use and is cached by your browser. After that, subsequent operations start immediately without any additional download.'
		}
	];
</script>

<ToolShell
	path="/audio/silence-remove"
	tagline="Trim leading and trailing silence from recordings automatically with adjustable threshold."
	seoTitle="Remove Silence from Audio Free Online — Auto Trim"
	description="Automatically remove leading and trailing silence from audio recordings. Adjust threshold and minimum duration. Free, no upload — runs in your browser with FFmpeg.wasm."
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

					<label class="block space-y-2">
						<span class="flex items-center justify-between text-sm font-medium text-text">
							<span>Silence Threshold</span>
							<span class="font-mono text-accent">{thresholdDb} dB</span>
						</span>
						<input
							type="range"
							min="-70"
							max="-20"
							step="1"
							bind:value={thresholdDb}
							class="w-full accent-accent"
						/>
						<div class="flex justify-between text-xs text-text-muted">
							<span>-70 dB (conservative)</span>
							<span>-20 dB (aggressive)</span>
						</div>
						<p class="text-xs text-text-muted">
							Audio below this level is treated as silence. Default -45 dB works well for clean recordings.
						</p>
					</label>

					<label class="block space-y-2">
						<span class="flex items-center justify-between text-sm font-medium text-text">
							<span>Minimum Silence Duration</span>
							<span class="font-mono text-accent">{minSilenceDuration}s</span>
						</span>
						<input
							type="range"
							min="0.1"
							max="5"
							step="0.1"
							bind:value={minSilenceDuration}
							class="w-full accent-accent"
						/>
						<div class="flex justify-between text-xs text-text-muted">
							<span>0.1s (trim short pauses)</span>
							<span>5s (only long gaps)</span>
						</div>
						<p class="text-xs text-text-muted">
							Silences shorter than this are kept. Default 0.5s preserves natural speech pauses.
						</p>
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
						{#if processing}Processing...{:else}Remove Silence{/if}
					</button>

					{#if result}
						<div class="space-y-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
							<div class="font-medium">Done!</div>
							<div class="space-y-1 text-xs">
								<div>Filename: {result.filename}</div>
								<div>
									Size: {formatSize(result.resultSize)} (from {formatSize(result.originalSize)}) —
									saved {formatSize(Math.max(0, result.originalSize - result.resultSize))}
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
			<h2 class="font-display text-lg font-700">Automatic silence trimming for cleaner recordings</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				Recordings often start and end with silence: time before you begin speaking, or after you stop. This is common in field recordings, voice memos, and podcast raw takes. Trimming that silence manually requires locating the exact sample where audio begins and ends. This tool automates that step.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				The tool uses FFmpeg's <strong class="font-medium text-text">silenceremove</strong> filter to detect where audio crosses the silence threshold, then trims the file to the active audio region. The threshold (in dB) controls what counts as silence, and the minimum duration controls the shortest silence worth removing. For most clean voice recordings, the defaults (-45 dB, 0.5 seconds) work without adjustment.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				Processing runs entirely in your browser with <strong class="font-medium text-text">FFmpeg.wasm</strong>. No upload, no account, no size limits beyond your device's available memory.
			</p>
		</div>
	</section>
</ToolShell>

<MediaLoadingOverlay state={loadProgress.state} percent={loadProgress.percent} onRetry={handleRetry} />

{#if processing}
	<ProcessingProgress progress={processingProgress} onCancel={handleCancel} />
{/if}
