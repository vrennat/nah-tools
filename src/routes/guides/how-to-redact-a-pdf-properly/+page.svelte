<script lang="ts">
	import ArticleShell from '$components/ArticleShell.svelte';

	const faqs = [
		{
			question: 'Is drawing a black rectangle over text in a PDF editor good enough?',
			answer:
				'No. Most PDF editors — including the annotation tools built into Preview, Acrobat, and browser PDF viewers — draw the rectangle as a separate layer on top of the page. The text underneath is untouched: select-all, copy-paste, or any text-extraction tool still recovers it.'
		},
		{
			question: 'Does nah.tools redaction actually remove the text?',
			answer:
				'Yes, on any page you mark. The tool renders that page to a flattened image and rebuilds the PDF from it, so the original text stream is gone — not hidden, gone. Pages you don\'t mark are left as-is, with their original searchable text intact.'
		},
		{
			question: 'Will my redacted PDF still be searchable?',
			answer:
				'Redacted pages lose selectable and searchable text, because they\'re now images rather than text layers — that\'s the price of genuine redaction. Untouched pages keep full text fidelity.'
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
			A PDF is a text document with a visual layer drawn on top of it, not a picture. When you use
			the annotation or "redact" tool built into a PDF viewer to draw a black rectangle over a Social
			Security number or a name, most of the time you're adding a new shape to the page — the
			original text stream underneath is completely untouched.
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
			as-is, keeping its original text, fonts, and file size untouched.
		</p>
	</section>

	<section class="space-y-4">
		<h2 class="font-display text-2xl font-700 text-text">The trade-offs</h2>
		<p class="leading-relaxed text-text-muted">
			Redacted pages stop being searchable or selectable, and they get larger, since a rasterized
			image takes more space than the vector text and graphics it replaced. Both are the cost of
			doing this correctly — a redaction that's still searchable is a redaction that failed. If you
			also need to lock the file down further, <a href="/pdf/protect" class="text-accent underline hover:text-accent-hover">password-protecting</a> the redacted PDF or adding a <a href="/pdf/watermark" class="text-accent underline hover:text-accent-hover">watermark</a> before sharing it are natural next steps.
		</p>
	</section>
</ArticleShell>
