<script lang="ts">
	import ArticleShell from '$components/ArticleShell.svelte';

	const faqs = [
		{
			question: 'What is the actual attachment size limit for email?',
			answer:
				'It varies by provider, but 25MB has been Gmail\'s long-standing cap, and most other major providers sit at or below that. Treat 25MB as the safe upper bound to aim for unless you know your recipient\'s exact limit.'
		},
		{
			question: 'How does video compression actually shrink the file?',
			answer:
				'Three levers: a lower constant rate factor target (which controls how aggressively each frame is compressed), a capped resolution so there are fewer pixels to encode, and a lower audio bitrate. The "Email-friendly" preset caps resolution at 1280×720 and drops audio to 96kbps.'
		},
		{
			question: 'Will my video look noticeably worse?',
			answer:
				'Some quality loss is unavoidable when the goal is a specific target size rather than a specific quality. For talking-head or screen-recording footage the difference is usually minor; for high-motion or highly detailed footage it\'s more visible.'
		},
		{
			question: 'Is this actually free and private?',
			answer:
				'Yes. Compression runs through FFmpeg.wasm entirely in your browser. The one-time ~25MB WASM binary downloads from a CDN on first use and is cached afterward — your video itself is never uploaded.'
		}
	];
</script>

<ArticleShell
	path="/guides/compress-video-for-email"
	dek="Most email providers cap attachments around 25MB. Here's how video compression actually works, and how to shrink a clip to fit without turning it to mush."
	seoTitle="How to Compress a Video for Email (Free, No Upload) | nah"
	description="Gmail and most providers cap attachments around 25MB. Learn how video compression actually works and shrink your video to fit, free and entirely in your browser."
	publishedDate="2026-07-28"
	{faqs}
>
	<section class="space-y-4">
		<h2 class="font-display text-2xl font-700 text-text">Why your video is too big to email</h2>
		<p class="leading-relaxed text-text-muted">
			A phone-shot video at 1080p or 4K can easily run 100–300MB per minute of footage, depending
			on the device and lighting. Email attachment limits haven't kept pace — Gmail has capped
			attachments at 25MB for years, and most other providers sit at or below that. A 30-second clip
			from a modern phone can blow past that limit on its own.
		</p>
	</section>

	<section class="space-y-4">
		<h2 class="font-display text-2xl font-700 text-text">How compression actually shrinks a video</h2>
		<p class="leading-relaxed text-text-muted">
			Video compression works on three levers at once. The main one is the constant rate factor
			(CRF) — a quality target the encoder uses to decide how much detail to throw away per frame;
			a higher CRF means smaller files and softer detail. The second is resolution: fewer pixels
			means less data to encode, so downscaling a 4K video to 720p cuts file size dramatically before
			the encoder even gets involved. The third is audio bitrate, which matters less for size but
			adds up.
		</p>
		<p class="leading-relaxed text-text-muted">
			nah.tools' <a href="/media/compress-video" class="text-accent underline hover:text-accent-hover">video compressor</a>
			has an "Email-friendly" preset that combines all three: it caps resolution at 1280×720,
			targets a CRF of 32 (moderately aggressive), and drops audio to 96kbps — tuned specifically to
			land most clips under 25MB without needing to guess at settings yourself.
		</p>
	</section>

	<section class="space-y-4">
		<h2 class="font-display text-2xl font-700 text-text">Steps</h2>
		<ul class="list-disc space-y-2 pl-6">
			<li class="leading-relaxed text-text-muted">Open <a href="/media/compress-video" class="text-accent underline hover:text-accent-hover">/media/compress-video</a> and drop in your video.</li>
			<li class="leading-relaxed text-text-muted">Pick the "Email-friendly" preset.</li>
			<li class="leading-relaxed text-text-muted">Run the compression and check the resulting file size before attaching it.</li>
		</ul>
	</section>

	<section class="space-y-4">
		<h2 class="font-display text-2xl font-700 text-text">When compression alone isn't enough</h2>
		<p class="leading-relaxed text-text-muted">
			A long clip or a source file with a very high starting bitrate might still land above 25MB
			even at the email preset. Two honest options at that point: <a href="/media/trim-video" class="text-accent underline hover:text-accent-hover">trim the clip</a>
			down to just the part that matters before compressing, or, if the visual isn't essential, <a href="/media/extract-audio" class="text-accent underline hover:text-accent-hover">pull out just the audio</a> —
			audio files are a fraction of the size of video. For anything that genuinely needs to stay
			long-form and high-resolution, a shared link is a better fit than an attachment; no amount of
			compression settings changes that trade-off.
		</p>
	</section>
</ArticleShell>
