<script lang="ts">
	import ArticleShell from '$components/ArticleShell.svelte';

	const faqs = [
		{
			question: 'Does any of my audio get uploaded?',
			answer:
				'No. The page, runtime, and model assets may download over the network; browser caching can reduce later downloads. Your recording is processed locally and never leaves the device.'
		},
		{
			question: 'Which model should I pick?',
			answer:
				'Start with English Fast for English speech, use Multilingual for other supported languages, and try High Accuracy if smaller models make errors. Larger models need more resources; none guarantees an accurate transcript or identifies speakers.'
		},
		{
			question: 'Do I need an internet connection?',
			answer:
				'Plan to be online to load the page, runtime, and model assets. Processing is local once loaded, but cached files can be evicted and offline startup is not guaranteed. Test offline use in advance if you need it.'
		},
		{
			question: 'What formats can I export?',
			answer:
				'Plain text, SRT and VTT subtitle files, and a formatted PDF of notes.'
		}
	];
</script>

<ArticleShell
	path="/guides/transcribe-audio-without-uploading"
	dek="On-device speech-to-text means your recording never leaves your computer. Here's how it works, and which model to pick for what you're transcribing."
	seoTitle="How to Transcribe Audio Without Uploading It Anywhere | nah"
	description="Transcribe interviews, meetings, and voice memos entirely in your browser using on-device Whisper — no upload, no account, no cloud API. Here's how it works."
	publishedDate="2026-07-28"
	{faqs}
>
	<section class="space-y-4">
		<h2 class="font-display text-2xl font-700 text-text">Why on-device matters</h2>
		<p class="leading-relaxed text-text-muted">
			Most transcription tools work by uploading your audio to a server, running it through a
			cloud speech model, and sending the text back. That's fine for a lot of use cases, and it's a
			real problem for others — an interview under NDA, a legal or medical conversation, an HR
			meeting, anything where the recording itself is sensitive. On-device transcription sidesteps
			the question entirely: there's no server in the loop to trust.
		</p>
	</section>

	<section class="space-y-4">
		<h2 class="font-display text-2xl font-700 text-text">How it works</h2>
		<p class="leading-relaxed text-text-muted">
			nah.tools' <a href="/audio/transcribe" class="text-accent underline hover:text-accent-hover">transcription tool</a>
			runs OpenAI's Whisper model converted to ONNX format, executed in your browser using WebGPU when available, with a WebAssembly fallback. Model assets download from Hugging Face, and the page and runtime need assets too. Browser
			caching can reduce later downloads but does not guarantee offline access. Audio processing
			runs locally; the recording is not sent to a transcription service.
		</p>
	</section>

	<section class="space-y-4">
		<h2 class="font-display text-2xl font-700 text-text">Which model to pick</h2>
		<p class="leading-relaxed text-text-muted">Download size varies with the selected model and execution backend. Allow time and storage for model and runtime assets; the download indicator reports progress.</p>
		<ul class="list-disc space-y-2 pl-6">
			<li class="leading-relaxed text-text-muted"><strong class="text-text">English Fast</strong> — English-only, the smallest model and a fast starting point. Good default for a quick English voice memo.</li>
			<li class="leading-relaxed text-text-muted"><strong class="text-text">Multilingual</strong> — supports non-English languages; accuracy still depends on language and recording quality.</li>
			<li class="leading-relaxed text-text-muted"><strong class="text-text">High Accuracy</strong> — a larger model to try when the smaller models make errors. It does not identify speakers, and its output still needs review.</li>
		</ul>
	</section>

	<section class="space-y-4">
		<h2 class="font-display text-2xl font-700 text-text">Steps</h2>
		<ul class="list-disc space-y-2 pl-6">
			<li class="leading-relaxed text-text-muted">Open <a href="/audio/transcribe" class="text-accent underline hover:text-accent-hover">/audio/transcribe</a> and pick a model using the options above.</li>
			<li class="leading-relaxed text-text-muted">Drop in your audio or video file — model and runtime assets download when needed.</li>
			<li class="leading-relaxed text-text-muted">Wait for processing; larger models and longer recordings take more time, especially on lower-powered devices.</li>
			<li class="leading-relaxed text-text-muted">Export as plain text, SRT/VTT subtitles, or a formatted PDF of notes.</li>
		</ul>
		<p class="leading-relaxed text-text-muted">
			If the recording is noisy or has a wide dynamic range, running it through <a href="/audio/normalize" class="text-accent underline hover:text-accent-hover">audio normalization</a>
			first may help with uneven volume. Normalization does not remove background noise, and
			it does not guarantee better recognition. Always review the transcript against the recording.
		</p>
	</section>
</ArticleShell>
