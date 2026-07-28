<script lang="ts">
	import ArticleShell from '$components/ArticleShell.svelte';

	const faqs = [
		{
			question: 'Does any of my audio get uploaded?',
			answer:
				'No. The only network request is a one-time download of the Whisper model itself (from Hugging Face), which the browser caches afterward. Your recording is processed locally and never leaves the device.'
		},
		{
			question: 'Which model should I pick?',
			answer:
				'English Fast (~39MB) for quick English-only transcripts, Multilingual (~73MB) as the default balance for anything non-English or accented, and High Accuracy (~237MB) for technical vocabulary, multiple speakers, or noisy audio where mistakes are costly.'
		},
		{
			question: 'Do I need an internet connection?',
			answer:
				'Only the first time, to download the model. After that it\'s cached by the browser and transcription runs fully offline — though the page itself still needs to load, so you\'re not fully disconnected.'
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
			runs OpenAI's Whisper model converted to ONNX format, executed entirely in your browser via
			WebAssembly. The first time you use it, the model downloads from Hugging Face's CDN — that's
			the only network request involved. After that, the browser caches it, and every transcription
			from then on runs locally with no network round-trip for the audio itself.
		</p>
	</section>

	<section class="space-y-4">
		<h2 class="font-display text-2xl font-700 text-text">Which model to pick</h2>
		<ul class="list-disc space-y-2 pl-6">
			<li class="leading-relaxed text-text-muted"><strong class="text-text">English Fast (~39MB)</strong> — English-only, the smallest download, the quickest to process. Good default for a quick English voice memo.</li>
			<li class="leading-relaxed text-text-muted"><strong class="text-text">Multilingual (~73MB)</strong> — handles non-English languages and accented speech noticeably better, at a moderate size increase.</li>
			<li class="leading-relaxed text-text-muted"><strong class="text-text">High Accuracy (~237MB)</strong> — the largest download, best suited to technical vocabulary, multiple speakers, or audio with background noise, where getting it wrong costs more than the extra download and processing time.</li>
		</ul>
	</section>

	<section class="space-y-4">
		<h2 class="font-display text-2xl font-700 text-text">Steps</h2>
		<ul class="list-disc space-y-2 pl-6">
			<li class="leading-relaxed text-text-muted">Open <a href="/audio/transcribe" class="text-accent underline hover:text-accent-hover">/audio/transcribe</a> and pick a model based on the table above.</li>
			<li class="leading-relaxed text-text-muted">Drop in your audio or video file — the model downloads once, on first use.</li>
			<li class="leading-relaxed text-text-muted">Wait for processing; larger models and longer recordings take more time, especially on lower-powered devices.</li>
			<li class="leading-relaxed text-text-muted">Export as plain text, SRT/VTT subtitles, or a formatted PDF of notes.</li>
		</ul>
		<p class="leading-relaxed text-text-muted">
			If the recording is noisy or has a wide dynamic range, running it through <a href="/audio/normalize" class="text-accent underline hover:text-accent-hover">audio normalization</a>
			first can make speech more consistent for the model to pick up, before you transcribe.
		</p>
	</section>
</ArticleShell>
