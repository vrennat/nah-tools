<script lang="ts">
	import ToolShell from '$components/ToolShell.svelte';
	import MediaLoadingOverlay from '$components/media/MediaLoadingOverlay.svelte';
	import ProcessingProgress from '$components/media/ProcessingProgress.svelte';
	import { getFFmpeg, cancelFFmpeg } from '$media/ffmpeg-loader';
	import { convertAudio } from '$media/processor';
	import type { LoadProgress, ProcessingProgress as PP } from '$media/types';

	type RecordState = 'idle' | 'recording' | 'paused' | 'stopped';

	let recordState = $state<RecordState>('idle');
	let elapsedSeconds = $state(0);
	let micError = $state('');
	let previewUrl = $state('');
	let recordedBlob = $state<Blob | null>(null);
	let recordedMimeType = $state('');

	// FFmpeg conversion state (for MP3 download)
	let converting = $state(false);
	let loadProgress = $state<LoadProgress>({ state: 'idle', percent: 0 });
	let processingProgress = $state<PP>({ percent: 0, timeElapsed: 0, estimatedTotal: 0 });
	let convertError = $state('');

	let mediaRecorder: MediaRecorder | null = null;
	let stream: MediaStream | null = null;
	let chunks: BlobPart[] = [];
	let timerInterval: ReturnType<typeof setInterval> | null = null;

	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}

	function startTimer() {
		timerInterval = setInterval(() => {
			elapsedSeconds += 1;
		}, 1000);
	}

	function stopTimer() {
		if (timerInterval !== null) {
			clearInterval(timerInterval);
			timerInterval = null;
		}
	}

	async function startRecording() {
		micError = '';
		chunks = [];
		elapsedSeconds = 0;

		try {
			stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		} catch (e) {
			if (e instanceof Error) {
				if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
					micError = 'Microphone permission denied. Allow microphone access in your browser and try again.';
				} else if (e.name === 'NotFoundError') {
					micError = 'No microphone found. Connect a microphone and try again.';
				} else {
					micError = `Could not access microphone: ${e.message}`;
				}
			} else {
				micError = 'Could not access microphone.';
			}
			return;
		}

		// Pick the best supported MIME type for the current browser.
		const preferredTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg'];
		const mimeType = preferredTypes.find((t) => MediaRecorder.isTypeSupported(t)) ?? '';

		mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
		recordedMimeType = mediaRecorder.mimeType;

		mediaRecorder.ondataavailable = (e) => {
			if (e.data.size > 0) chunks.push(e.data);
		};

		mediaRecorder.onstop = () => {
			recordedBlob = new Blob(chunks, { type: recordedMimeType || 'audio/webm' });
			if (previewUrl) URL.revokeObjectURL(previewUrl);
			previewUrl = URL.createObjectURL(recordedBlob);
			stopStream();
		};

		mediaRecorder.start(100);
		recordState = 'recording';
		startTimer();
	}

	function pauseRecording() {
		if (mediaRecorder?.state === 'recording') {
			mediaRecorder.pause();
			recordState = 'paused';
			stopTimer();
		}
	}

	function resumeRecording() {
		if (mediaRecorder?.state === 'paused') {
			mediaRecorder.resume();
			recordState = 'recording';
			startTimer();
		}
	}

	function stopRecording() {
		stopTimer();
		mediaRecorder?.stop();
		recordState = 'stopped';
	}

	function stopStream() {
		stream?.getTracks().forEach((t) => t.stop());
		stream = null;
	}

	function downloadRaw() {
		if (!recordedBlob) return;
		// Derive a reasonable extension from the MIME type.
		const ext = recordedMimeType.includes('ogg') ? '.ogg' : '.webm';
		const url = URL.createObjectURL(recordedBlob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `recording${ext}`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	async function initFFmpeg() {
		if (loadProgress.state !== 'idle') return;
		try {
			await getFFmpeg((p) => (loadProgress = p));
		} catch (e) {
			convertError = e instanceof Error ? e.message : 'Failed to load FFmpeg';
			loadProgress = { state: 'error', percent: 0 };
		}
	}

	async function downloadMp3() {
		if (!recordedBlob) return;
		convertError = '';

		// Load FFmpeg if not already loaded.
		if (loadProgress.state === 'idle') {
			await initFFmpeg();
		}
		// Re-read state after the async call — the state type is narrowed before the
		// await so we can't use the narrowed result directly.
		if (loadProgress.state !== 'ready') return;

		converting = true;
		try {
			const file = new File([recordedBlob], 'recording.webm', { type: recordedMimeType || 'audio/webm' });
			const result = await convertAudio(file, 'mp3', (p) => (processingProgress = p));
			const url = URL.createObjectURL(result.blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = 'recording.mp3';
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch (e) {
			if (!(e instanceof Error && e.message.includes('terminate'))) {
				convertError = e instanceof Error ? e.message : 'MP3 conversion failed';
			}
		} finally {
			converting = false;
		}
	}

	function handleRetry() {
		loadProgress = { state: 'idle', percent: 0 };
		initFFmpeg();
	}

	function handleCancel() {
		cancelFFmpeg();
		converting = false;
		loadProgress = { state: 'idle', percent: 0 };
	}

	function startOver() {
		if (previewUrl) URL.revokeObjectURL(previewUrl);
		recordedBlob = null;
		previewUrl = '';
		recordState = 'idle';
		elapsedSeconds = 0;
		micError = '';
		convertError = '';
	}

	$effect(() => {
		return () => {
			stopTimer();
			stopStream();
			if (previewUrl) URL.revokeObjectURL(previewUrl);
		};
	});

	const faqs = [
		{
			question: 'Is anything uploaded when I record?',
			answer:
				'No. The recording uses your browser\'s MediaRecorder API, which captures audio locally. Playback preview and downloads are entirely in-browser. MP3 conversion uses FFmpeg.wasm, also in-browser. Nothing leaves your device at any point.'
		},
		{
			question: 'What format does the recording save as?',
			answer:
				'The browser chooses the format: Chrome and Edge record as WebM/Opus; Firefox may use OGG/Opus. Both are widely supported. You can download the raw recording in the browser\'s native format, or use the "Download MP3" button to convert it — MP3 conversion uses FFmpeg.wasm and requires the ~25 MB engine to load.'
		},
		{
			question: 'Can I pause and resume a recording?',
			answer:
				'Yes. The pause button suspends audio capture without splitting the recording. Resume continues from where you paused. The elapsed timer also pauses and resumes with the recording.'
		},
		{
			question: 'Does the MP3 conversion cost anything or require an account?',
			answer:
				'No. The MP3 conversion uses the same FFmpeg.wasm engine as the other audio tools on this site. It runs entirely in your browser, is free, and requires no account.'
		},
		{
			question: 'Why does the first MP3 conversion take longer?',
			answer:
				'FFmpeg.wasm (about 25 MB) downloads on first use and is cached by your browser. After that, subsequent conversions start immediately. The raw download is always instant since it does not require FFmpeg.'
		}
	];
</script>

<ToolShell
	path="/audio/record"
	tagline="Record audio from your microphone — pause, preview, then download as WebM or convert to MP3."
	seoTitle="Record Audio Online Free — Voice Recorder, No Upload"
	description="Record audio directly in your browser using your microphone. Pause and resume, preview the recording, then download as WebM or MP3. Free, nothing uploaded."
	{faqs}
>
	<section class="mx-auto max-w-2xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			{#if recordState === 'idle'}
				<div class="flex flex-col items-center gap-4 py-8 text-center">
					<div class="flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 text-accent">
						<svg class="h-10 w-10" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
						</svg>
					</div>
					<div>
						<p class="text-sm text-text-muted">Click to request microphone access and begin recording.</p>
						<p class="mt-1 text-xs text-text-muted">Nothing is uploaded. All audio stays on your device.</p>
					</div>
					{#if micError}
						<div class="w-full rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
							{micError}
						</div>
					{/if}
					<button
						onclick={startRecording}
						class="rounded-lg bg-accent px-6 py-3 font-medium text-white transition-all duration-200 hover:bg-accent/90"
					>
						Start Recording
					</button>
				</div>

			{:else if recordState === 'recording' || recordState === 'paused'}
				<div class="flex flex-col items-center gap-6 py-4">
					<div class="flex items-center gap-3">
						{#if recordState === 'recording'}
							<span class="h-3 w-3 animate-pulse rounded-full bg-red-500"></span>
							<span class="font-mono text-2xl font-medium tabular-nums text-text">{formatTime(elapsedSeconds)}</span>
							<span class="text-sm text-red-500">Recording</span>
						{:else}
							<span class="h-3 w-3 rounded-full bg-yellow-400"></span>
							<span class="font-mono text-2xl font-medium tabular-nums text-text">{formatTime(elapsedSeconds)}</span>
							<span class="text-sm text-yellow-600 dark:text-yellow-400">Paused</span>
						{/if}
					</div>

					<div class="flex gap-3">
						{#if recordState === 'recording'}
							<button
								onclick={pauseRecording}
								class="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent"
							>
								<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
									<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
								</svg>
								Pause
							</button>
						{:else}
							<button
								onclick={resumeRecording}
								class="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent"
							>
								<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
									<path d="M8 5v14l11-7z"/>
								</svg>
								Resume
							</button>
						{/if}
						<button
							onclick={stopRecording}
							class="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
						>
							<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
								<path d="M6 6h12v12H6z"/>
							</svg>
							Stop
						</button>
					</div>
				</div>

			{:else}
				<!-- recordState === 'stopped' -->
				<div class="space-y-5">
					<div class="flex items-center gap-3 rounded-lg border border-border bg-surface-alt p-3 text-sm text-text-muted">
						<svg class="h-4 w-4 shrink-0 text-green-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
						</svg>
						<span>Recording complete — {formatTime(elapsedSeconds)}</span>
					</div>

					{#if previewUrl}
						<div class="overflow-hidden rounded-lg border border-border bg-surface-alt">
							<audio src={previewUrl} controls class="w-full"></audio>
						</div>
					{/if}

					<div class="flex flex-col gap-2 sm:flex-row">
						<button
							onclick={downloadRaw}
							class="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent"
						>
							Download WebM / OGG
						</button>
						<button
							onclick={downloadMp3}
							disabled={converting || (loadProgress.state !== 'idle' && loadProgress.state !== 'ready')}
							class="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:enabled:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{#if converting}Converting to MP3...{:else}Download MP3{/if}
						</button>
					</div>

					{#if convertError}
						<div class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
							{convertError}
						</div>
					{/if}

					<button
						onclick={startOver}
						class="w-full rounded-lg border border-border px-4 py-2 text-sm text-text-muted transition-colors hover:border-accent hover:text-accent"
					>
						Record again
					</button>
				</div>
			{/if}
		</div>

		<div class="space-y-4 rounded-xl border border-border bg-surface-alt p-6">
			<h2 class="font-display text-lg font-700">In-browser voice recorder — nothing uploaded</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				Browser-based voice recorders typically send your audio to a server for storage or processing. This one does not. The recording uses the browser's <strong class="font-medium text-text">MediaRecorder API</strong> to capture audio directly in memory. The playback preview is a local object URL. The raw download is assembled from the captured chunks without any network request.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				MP3 conversion, when requested, uses <strong class="font-medium text-text">FFmpeg.wasm</strong> — the same engine used by the other audio tools on this site. The ~25 MB WASM binary loads on first use and is cached by your browser. The conversion happens locally and the resulting MP3 is downloaded directly to your device.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				Supports pause and resume during recording, a live elapsed timer, and in-browser playback before downloading. Works in Chrome, Edge, Firefox, and Safari.
			</p>
		</div>
	</section>
</ToolShell>

<MediaLoadingOverlay state={loadProgress.state} percent={loadProgress.percent} onRetry={handleRetry} />

{#if converting}
	<ProcessingProgress progress={processingProgress} onCancel={handleCancel} />
{/if}
