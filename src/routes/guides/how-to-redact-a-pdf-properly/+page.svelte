<script lang="ts">
	import ArticleShell from '$components/ArticleShell.svelte';

	const faqs = [
		{
			question: 'Is drawing a black rectangle over text in a PDF editor good enough?',
			answer:
				'No. An ordinary rectangle annotation can sit on top of the page without removing its contents. Dedicated redaction tools can remove content when their redactions are applied. With an annotation alone, copying or extracting text may still reveal the covered content.'
		},
		{
			question: 'Does nah.tools redaction actually remove the text?',
			answer:
				'Yes, on any page you mark. The tool renders that page to a flattened image and rebuilds the PDF from it, so the original text stream is gone — not hidden, gone. Pages you don\'t mark are left as-is, with their original searchable text intact.'
		},
		{
			question: 'Will my redacted PDF still be searchable?',
			answer:
				'Redacted pages lose selectable and searchable text, because they\'re now images rather than text layers — that is a trade-off of this image-based method. Genuine redaction can also preserve searchable text outside removed regions. Untouched pages retain their original content.'
		},
		{
			question: 'Is this actually free and private?',
			answer:
				'Yes. Rendering and redaction both happen in your browser using pdfjs-dist and pdf-lib. The file is never uploaded, which matters more than usual here given what people redact.'
		}
	];
</script>

<ArticleShell
	path="/guides/how-to-redact-a-pdf-properly"
	dek="Drawing a black box over text doesn't remove it — the text is still sitting in the file, waiting for anyone with Ctrl+A. Here's what actual redaction requires."
	seoTitle="How to Redact a PDF Properly (Not Just Black Boxes) | nah"
	description="Covering text with a black rectangle in a PDF doesn't delete the underlying text — it's still selectable and extractable. Learn how real redaction works and do it free, in your browser."
	publishedDate="2026-07-28"
	{faqs}
>
	<section class="space-y-4">
		<h2 class="font-display text-2xl font-700 text-text">Why the black box trick fails</h2>
		<p class="leading-relaxed text-text-muted">
			A PDF can contain text, images, and other objects. When you add an ordinary rectangle
			annotation over a Social Security number or name, the original content can remain underneath.
			Dedicated redaction tools are different: they remove marked content when you apply the redactions.
		</p>
		<p class="leading-relaxed text-text-muted">
			That's a well-known failure mode. Anyone who selects all the text on the page and copies it,
			or runs the file through any text-extraction tool, gets the "redacted" content back in full.
			The black box only fools the eye, not the file.
		</p>
	</section>

	<section class="space-y-4">
		<h2 class="font-display text-2xl font-700 text-text">What real redaction requires</h2>
		<p class="leading-relaxed text-text-muted">
			Genuine redaction has to replace the underlying content, not draw over it. There are two
			honest ways to do that: strip the sensitive text out of the PDF's object structure entirely,
			or flatten the page to a raster image so there's no text stream left to extract in the first
			place.
		</p>
		<p class="leading-relaxed text-text-muted">
			nah.tools' <a href="/pdf/redact" class="text-accent underline hover:text-accent-hover">redaction tool</a> takes the second approach.
			When you mark a region and click Apply, that page is rendered to an image with your marked
			areas painted over in black, and the page's original text and vector content is replaced by
			that image. There's no text stream left behind to select or extract — because there's no text
			left on that page at all, redacted or otherwise.
		</p>
	</section>

	<section class="space-y-4">
		<h2 class="font-display text-2xl font-700 text-text">How to redact a PDF with nah.tools</h2>
		<ul class="list-disc space-y-2 pl-6">
			<li class="leading-relaxed text-text-muted">Open <a href="/pdf/redact" class="text-accent underline hover:text-accent-hover">/pdf/redact</a> and drop in your PDF.</li>
			<li class="leading-relaxed text-text-muted">Draw a rectangle over each region you want removed, on every page that needs it.</li>
			<li class="leading-relaxed text-text-muted">Review your marks — hover any region and click the X to remove it before applying, if you change your mind.</li>
			<li class="leading-relaxed text-text-muted">Click Apply, then download. The redactions in that downloaded copy are permanent.</li>
		</ul>
		<p class="leading-relaxed text-text-muted">
			Only the pages you mark get flattened. Any page without a redaction mark is copied through
			with their original page content. This is not a complete audit of metadata, attachments,
			comments, or sensitive information elsewhere in the document. Review the downloaded copy.
		</p>
	</section>

	<section class="space-y-4">
		<h2 class="font-display text-2xl font-700 text-text">The trade-offs</h2>
		<p class="leading-relaxed text-text-muted">
			With this method, redacted pages lose selectable text and may grow in size or lose fine
			detail when rasterized. Other genuine redaction methods can preserve searchable text outside
			the removed regions. Check every marked area at high zoom and confirm sensitive content
			is absent from search and text extraction before sharing. If you
			also need to lock the file down further, <a href="/pdf/protect" class="text-accent underline hover:text-accent-hover">password-protecting</a> the redacted PDF or adding a <a href="/pdf/watermark" class="text-accent underline hover:text-accent-hover">watermark</a> before sharing it are natural next steps.
		</p>
	</section>
</ArticleShell>
