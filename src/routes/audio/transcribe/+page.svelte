<script lang="ts">
	import { browser } from '$app/environment';
	import ToolShell from '$components/ToolShell.svelte';
	import MediaDropZone from '$components/media/MediaDropZone.svelte';
	import MediaLoadingOverlay from '$components/media/MediaLoadingOverlay.svelte';
	import { getFFmpeg, cancelFFmpeg } from '$media/ffmpeg-loader';
	import { extractPcmForTranscription } from '$media/processor';
	import type { LoadProgress, ProcessingProgress as FFmpegProgress } from '$media/types';
	import type { ModelDownloadProgress, TranscribeProgress, TranscriptChunk, TranscribeBackend } from '$transcribe/types';
	import { AVAILABLE_TRANSCRIBE_MODELS, DEFAULT_TRANSCRIBE_MODEL } from '$transcribe/models';
	import { toTxt, toSrt, toVtt } from '$transcribe/formats';

	// ---------------------------------------------------------------------------
	// State
	// ---------------------------------------------------------------------------

	let file = $state<File | null>(null);
	let selectedModelId = $state(DEFAULT_TRANSCRIBE_MODEL.id);
	let includeTimestamps = $state(false);

	type Phase =
		| 'idle'
		| 'ffmpeg-loading'
		| 'decoding'
		| 'model-loading'
		| 'transcribing'
		| 'done'
		| 'error';

	let phase = $state<Phase>('idle');
	let error = $state('');

	// FFmpeg load progress
	let ffmpegLoad = $state<LoadProgress>({ state: 'idle', percent: 0 });
	let ffmpegProgress = $state<FFmpegProgress>({ percent: 0, timeElapsed: 0, estimatedTotal: 0 });

	// Model download progress
	let modelProgress = $state<ModelDownloadProgress>({ percent: 0, loaded: 0, total: 0, status: 'downloading' });

	// Transcription progress
	let transcribeProgress = $state<TranscribeProgress>({ percent: 0, chunksCompleted: 0 });

	// Results
	let chunks = $state<TranscriptChunk[]>([]);
	let backend = $state<TranscribeBackend | null>(null);
	let activeTab = $state<'text' | 'srt' | 'vtt'>('text');

	// ---------------------------------------------------------------------------
	// Derived
	// ---------------------------------------------------------------------------

	const selectedModel = $derived(
		AVAILABLE_TRANSCRIBE_MODELS.find((m) => m.id === selectedModelId) ?? DEFAULT_TRANSCRIBE_MODEL
	);

	const canTranscribe = $derived(!!file && phase === 'idle');

	const txtOutput = $derived(toTxt(chunks));
	const srtOutput = $derived(toSrt(chunks));
	const vttOutput = $derived(toVtt(chunks));

	const activeOutput = $derived(
		activeTab === 'srt' ? srtOutput : activeTab === 'vtt' ? vttOutput : txtOutput
	);

	const activeExtension = $derived(
		activeTab === 'srt' ? '.srt' : activeTab === 'vtt' ? '.vtt' : '.txt'
	);

	// ---------------------------------------------------------------------------
	// Helpers
	// ---------------------------------------------------------------------------

	function formatMB(bytes: number): string {
		return (bytes / 1024 / 1024).toFixed(0);
	}

	function formatSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}

	function stem(filename: string): string {
		return filename.replace(/\.[^.]+$/, '');
	}

	// ---------------------------------------------------------------------------
	// Handlers
	// ---------------------------------------------------------------------------

	function onFileSelect(selected: File) {
		file = selected;
		chunks = [];
		error = '';
		phase = 'idle';
		backend = null;
	}

	async function handleTranscribe() {
		if (!file || !browser) return;

		chunks = [];
		error = '';
		backend = null;
		phase = 'ffmpeg-loading';
		ffmpegLoad = { state: 'idle', percent: 0 };

		try {
			// Step 1: ensure FFmpeg is loaded (shared singleton, cached after first use)
			await getFFmpeg((p) => {
				ffmpegLoad = p;
			});

			// Step 2: decode to 16 kHz mono float32 PCM
			phase = 'decoding';
			const pcm = await extractPcmForTranscription(file, (p) => {
				ffmpegProgress = p;
			});

			// Step 3: load the transcription worker and model
			phase = 'model-loading';
			modelProgress = { percent: 0, loaded: 0, total: 0, status: 'downloading' };

			// Dynamic import so the worker bundle is fully separate
			const { transcribe: runTranscribe } = await import('$transcribe/client');

			// Step 4: transcribe
			phase = 'transcribing';
			transcribeProgress = { percent: 0, chunksCompleted: 0 };

			const result = await runTranscribe(
				pcm,
				{ modelId: selectedModelId },
				(p) => {
					modelProgress = p;
					// Keep the phase as model-loading until the model is fully ready
					if (p.status === 'downloading' && p.percent < 100) {
						phase = 'model-loading';
					}
				},
				(p) => {
					transcribeProgress = p;
					phase = 'transcribing';
				}
			);

			chunks = result.chunks;
			backend = result.backend;
			phase = 'done';
		} catch (e) {
			error = e instanceof Error ? e.message : 'Transcription failed.';
			phase = 'error';
		}
	}

	function handleCancel() {
		cancelFFmpeg();
		phase = 'idle';
		ffmpegLoad = { state: 'idle', percent: 0 };
	}

	function handleRetry() {
		ffmpegLoad = { state: 'idle', percent: 0 };
		phase = 'idle';
	}

	function copyToClipboard() {
		if (browser) navigator.clipboard.writeText(activeOutput).catch(() => {});
	}

	function downloadOutput() {
		if (!file) return;
		const blob = new Blob([activeOutput], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = stem(file.name) + activeExtension;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	async function downloadPdf() {
		if (!file || chunks.length === 0) return;
		const { exportTranscriptAsPdf } = await import('$transcribe/export-pdf');
		await exportTranscriptAsPdf(chunks, file.name, { includeTimestamps });
	}

	// ---------------------------------------------------------------------------
	// FAQs
	// ---------------------------------------------------------------------------

	const faqs = [
		{
			question: 'Does my audio get uploaded to a server?',
			answer:
				'No. Transcription runs entirely in your browser using Whisper, an open-source speech recognition model from OpenAI. The audio never leaves your device. The Whisper model files download once from Hugging Face and are then cached locally — subsequent uses are fully offline.'
		},
		{
			question: 'How large is the model download?',
			answer:
				'The English Fast model (whisper-tiny.en) downloads approximately 39 MB on first use. The Multilingual model (whisper-base) is approximately 73 MB. The High Accuracy model (whisper-small) is approximately 237 MB. All sizes are for the default quantization (q8). After the first download, the model is cached in your browser and no further network traffic occurs.'
		},
		{
			question: 'Which model should I use for English speech?',
			answer:
				'English Fast (whisper-tiny.en) is the right starting point for most English content — meetings, interviews, lectures, and podcasts. It is the smallest model and runs fastest. Switch to High Accuracy (whisper-small) if you need better results on technical jargon, heavy accents, or noisy audio. The Multilingual model is optimized for non-English languages.'
		},
		{
			question: 'How fast is transcription?',
			answer:
				'Speed depends entirely on your hardware and which backend the browser uses. On devices with a compatible GPU, the WebGPU backend is used and transcription is significantly faster than CPU. Without WebGPU, the WebAssembly backend runs on CPU. As a rough frame of reference: a device running in CPU mode might process a 10-minute file in anywhere from 2 to 15 minutes depending on the processor. No specific numbers are guaranteed.'
		},
		{
			question: 'What is the practical limit on file length?',
			answer:
				'There is no hard limit imposed by this tool. In practice, longer files require more RAM to hold the decoded PCM in memory and more processing time. Files up to about 2 hours are generally manageable on modern devices. For very long recordings, consider extracting the audio track first (use the Extract Audio tool) to reduce the file size before transcribing.'
		}
	];
</script>

<ToolShell
	path="/audio/transcribe"
	tagline="Transcribe any audio or video file entirely in your browser — no uploads, no accounts."
	seoTitle="Free Online Audio Transcription — Whisper AI, No Upload"
	description="Convert speech to text using Whisper, an open-source AI model from OpenAI, running directly in your browser. Drop any audio or video file and get a plain text transcript, an SRT subtitle file, or a VTT caption file — all processed on your device. Nothing is uploaded. The model downloads once and is cached locally for offline use. Export your transcript as PDF notes with optional timestamps."
	{faqs}
>
	<section class="mx-auto max-w-2xl space-y-6">
		<!-- Drop zone + model picker card -->
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<MediaDropZone
				accept="audio/*,video/*"
				{onFileSelect}
				label="Drop audio or video here, or click to browse"
			/>

			{#if file}
				<div class="mt-4 rounded-lg border border-border bg-surface-alt p-3 text-sm text-text-muted">
					<span class="font-medium text-text">{file.name}</span>
					<span class="ml-2">({formatSize(file.size)})</span>
				</div>
			{/if}

			<!-- Model picker -->
			<div class="mt-4 space-y-2">
				<p class="text-sm font-medium text-text">Whisper model</p>
				<div class="flex flex-wrap gap-2">
					{#each AVAILABLE_TRANSCRIBE_MODELS as model}
						<button
							type="button"
							disabled={phase !== 'idle'}
							onclick={() => (selectedModelId = model.id)}
							class="rounded-md border px-3 py-1.5 text-sm font-medium transition-colors
								{selectedModelId === model.id
								? 'border-accent bg-accent/10 text-accent'
								: 'border-border text-text-muted hover:border-accent/50 hover:text-text'}
								{phase !== 'idle' ? 'cursor-not-allowed opacity-50' : ''}"
							title="{model.description} — Best for: {model.bestFor}"
						>
							{model.name}
						</button>
					{/each}
				</div>
				<p class="text-xs text-text-muted">
					{selectedModel.sizeLabel} one-time download &middot; {selectedModel.bestFor}
				</p>
			</div>

			<!-- Transcribe button -->
			<button
				onclick={handleTranscribe}
				disabled={!canTranscribe}
				class="mt-4 w-full rounded-lg bg-accent px-4 py-3 font-medium text-white transition-all duration-200 hover:enabled:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{phase === 'idle' ? 'Transcribe' : 'Transcribing…'}
			</button>
		</div>

		<!-- Progress states -->
		{#if phase === 'ffmpeg-loading' || phase === 'decoding'}
			<div class="rounded-xl border border-border bg-surface p-6">
				<p class="mb-3 text-sm font-medium text-text">
					{phase === 'ffmpeg-loading' ? 'Loading audio decoder…' : 'Decoding audio to PCM…'}
				</p>
				<div class="h-2 overflow-hidden rounded-full bg-border">
					<div
						class="h-full rounded-full bg-accent transition-all duration-150"
						style="width: {phase === 'decoding' ? ffmpegProgress.percent : ffmpegLoad.percent}%"
					></div>
				</div>
				{#if phase === 'decoding'}
					<p class="mt-2 text-xs text-text-muted">{ffmpegProgress.percent}%</p>
				{/if}
			</div>
		{/if}

		{#if phase === 'model-loading'}
			<div class="rounded-xl border border-border bg-surface p-6 text-center">
				<div class="mb-3 text-sm font-medium text-text">
					{#if modelProgress.status === 'cached'}
						Loading cached model…
					{:else}
						One-time model download: {selectedModel.name} ({selectedModel.sizeLabel})
					{/if}
				</div>
				{#if modelProgress.status !== 'cached' && modelProgress.total > 0}
					<div class="mx-auto max-w-md">
						<div class="h-2 overflow-hidden rounded-full bg-border">
							<div
								class="h-full rounded-full bg-accent transition-all duration-150"
								style="width: {modelProgress.percent}%"
							></div>
						</div>
						<p class="mt-2 text-xs text-text-muted">
							{formatMB(modelProgress.loaded)} / {formatMB(modelProgress.total)} MB &mdash; {modelProgress.percent}%
						</p>
					</div>
				{/if}
				<p class="mt-3 text-xs text-text-muted">
					Cached in your browser after this download &mdash; free to use offline.
				</p>
			</div>
		{/if}

		{#if phase === 'transcribing'}
			<div class="rounded-xl border border-border bg-surface p-6">
				<p class="mb-3 text-sm font-medium text-text">Transcribing…</p>
				<div class="h-2 overflow-hidden rounded-full bg-border">
					<div
						class="h-full rounded-full bg-accent transition-all duration-150"
						style="width: {transcribeProgress.percent}%"
					></div>
				</div>
				<p class="mt-2 text-xs text-text-muted">
					{transcribeProgress.percent}% &mdash; speed depends on your hardware
				</p>
			</div>
		{/if}

		<!-- Error -->
		{#if phase === 'error'}
			<div class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
				{error}
			</div>
		{/if}

		<!-- Results panel -->
		{#if phase === 'done' && chunks.length > 0}
			<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
				<!-- Header row: backend badge + tabs -->
				<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
					<div class="flex items-center gap-3">
						<span class="text-sm font-medium text-text">Transcript</span>
						{#if backend === 'webgpu'}
							<span class="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
								<svg class="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
									<path d="M13 10V3L4 14h7v7l9-11h-7z" />
								</svg>
								GPU Accelerated
							</span>
						{:else if backend === 'wasm'}
							<span class="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning">
								<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								CPU Mode
							</span>
						{/if}
					</div>

					<!-- Format tabs -->
					<div class="flex gap-1 rounded-lg border border-border p-0.5">
						{#each (['text', 'srt', 'vtt'] as const) as tab}
							<button
								type="button"
								onclick={() => (activeTab = tab)}
								class="rounded-md px-3 py-1 text-xs font-medium transition-colors
									{activeTab === tab
									? 'bg-accent text-white'
									: 'text-text-muted hover:text-text'}"
							>
								{tab === 'text' ? 'Text' : tab.toUpperCase()}
							</button>
						{/each}
					</div>
				</div>

				<!-- Transcript output -->
				<textarea
					readonly
					value={activeOutput}
					class="h-64 w-full resize-y rounded-lg border border-border bg-surface-alt p-3 font-mono text-xs text-text focus:outline-none"
					aria-label="Transcript output"
				></textarea>

				<!-- Action row -->
				<div class="mt-3 flex flex-wrap items-center gap-2">
					<button
						type="button"
						onclick={copyToClipboard}
						class="rounded-lg border border-border px-3 py-1.5 text-sm text-text hover:bg-surface-alt"
					>
						Copy
					</button>
					<button
						type="button"
						onclick={downloadOutput}
						class="rounded-lg border border-border px-3 py-1.5 text-sm text-text hover:bg-surface-alt"
					>
						Download {activeTab === 'text' ? '.txt' : activeTab === 'srt' ? '.srt' : '.vtt'}
					</button>
					<button
						type="button"
						onclick={downloadPdf}
						class="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent/90"
					>
						Download PDF Notes
					</button>

					<label class="ml-auto flex cursor-pointer items-center gap-1.5 text-xs text-text-muted">
						<input
							type="checkbox"
							bind:checked={includeTimestamps}
							class="accent-accent"
						/>
						Include timestamps in PDF
					</label>
				</div>
			</div>
		{/if}

		<!-- SEO prose -->
		<div class="space-y-4 rounded-xl border border-border bg-surface-alt p-6">
			<h2 class="font-display text-lg font-700">On-device audio transcription — free, private, no upload</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				This tool converts speech to text using
				<strong class="font-medium text-text">Whisper</strong>, an open-source automatic speech
				recognition model developed by OpenAI, running entirely inside your browser via
				WebAssembly and optionally WebGPU. No audio is transmitted to any server at any point.
				The model is downloaded once from the Hugging Face Hub CDN and cached in your browser —
				after the initial download, transcription works with no internet connection.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				Three model sizes are available. The English Fast model is the right choice for most
				English recordings — meetings, interviews, lectures, and podcasts — and is the smallest
				download at around 39 MB. The Multilingual model adds support for non-English languages
				at around 73 MB. The High Accuracy model provides better results on technically complex
				content, overlapping speech, or heavy accents at around 237 MB.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				Output is available in three formats:
				<strong class="font-medium text-text">plain text</strong> for direct reading and editing,
				<strong class="font-medium text-text">SRT</strong> for video subtitle tracks, and
				<strong class="font-medium text-text">VTT</strong> for web video captions (HTML5
				&lt;track&gt; elements). All three formats include word-level timestamps from Whisper's
				output. A <strong class="font-medium text-text">PDF notes export</strong> is also
				available, with optional timestamps per paragraph, formatted for reading and printing.
			</p>
		</div>
	</section>
</ToolShell>

<MediaLoadingOverlay state={ffmpegLoad.state} percent={ffmpegLoad.percent} onRetry={handleRetry} />
