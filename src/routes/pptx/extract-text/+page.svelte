<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import ToolShell from '$components/ToolShell.svelte';
	import type { ExtractedText } from '$pptx/types';

	let files = $state<File[]>([]);
	let processing = $state(false);
	let error = $state('');
	let slides = $state<ExtractedText[]>([]);

	let file = $derived(files[0]);
	let canExtract = $derived(!!file && !processing);

	let allText = $derived(
		slides.map((s) => `--- Slide ${s.slideNumber} ---\n${s.text}`).join('\n\n')
	);

	async function extract() {
		if (!canExtract || !file) return;
		processing = true;
		error = '';
		slides = [];

		try {
			const { extractText } = await import('$pptx/processor');
			const buf = await file.arrayBuffer();
			slides = await extractText(buf);

			if (slides.every((s) => !s.text.trim())) {
				error = 'No text found in this presentation.';
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to extract text';
		} finally {
			processing = false;
		}
	}

	function copyToClipboard() {
		navigator.clipboard.writeText(allText);
	}

	function downloadText() {
		const blob = new Blob([allText], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = file ? file.name.replace('.pptx', '.txt') : 'extracted-text.txt';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	const faqs = [
		{
			question: 'Are my files uploaded when extracting text?',
			answer:
				'No. The text extraction runs entirely in your browser. The PPTX is opened in memory, the slide XML is parsed locally, and results are displayed in the page — nothing is sent to a server.'
		},
		{
			question: 'Does the extracted text preserve slide structure?',
			answer:
				'Text is grouped by slide and labelled with the slide number. Within each slide, text runs are collected and grouped by paragraph. The order follows the order of text elements in the slide XML, which generally matches the visual reading order but may differ for complex multi-column layouts.'
		},
		{
			question: 'Are speaker notes included in the extracted text?',
			answer:
				'No. The extractor reads only the slide content XML (ppt/slides/slideN.xml). Speaker notes are stored in separate notesSlide files and are not included in the extraction output.'
		},
		{
			question: 'What text is not extracted?',
			answer:
				'Text embedded inside images, text rendered by chart data labels, and WordArt stored as paths rather than text elements will not appear in the output. Only plain DrawingML text runs (<a:t> elements) are captured.'
		},
		{
			question: 'Can I download the result?',
			answer:
				'Yes. After extraction, use the "Download .txt" button to save the full text as a plain text file, or "Copy all" to copy it to your clipboard.'
		}
	];
</script>

<ToolShell
	path="/pptx/extract-text"
	tagline="Get all slide text in one place — copy to clipboard or download as plain text."
	seoTitle="Extract Text from PowerPoint Free — Slide by Slide | nah.tools"
	description="Extract all text from a PowerPoint presentation slide by slide. Free, no upload — processed entirely in your browser."
	{faqs}
>
	<section class="mx-auto max-w-2xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<FileDropZone accept=".pptx" bind:files label="Drop a PPTX file here or click to browse" />

			{#if error}
				<p class="mt-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
			{/if}

			<div class="mt-6">
				<button
					type="button"
					class="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
					disabled={!canExtract}
					onclick={extract}
				>
					{#if processing}
						Extracting...
					{:else if !file}
						Upload a PPTX to extract text
					{:else}
						Extract Text
					{/if}
				</button>
			</div>
		</div>

		{#if slides.length > 0}
			<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
				<div class="flex items-center justify-between">
					<h2 class="text-sm font-medium text-text">
						Extracted from {slides.length} slide{slides.length === 1 ? '' : 's'}
					</h2>
					<div class="flex gap-2">
						<button
							type="button"
							class="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text transition-colors hover:bg-surface-alt"
							onclick={copyToClipboard}
						>
							Copy all
						</button>
						<button
							type="button"
							class="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text transition-colors hover:bg-surface-alt"
							onclick={downloadText}
						>
							Download .txt
						</button>
					</div>
				</div>

				<div class="mt-4 max-h-96 space-y-4 overflow-y-auto">
					{#each slides as slide}
						{#if slide.text.trim()}
							<div>
								<p class="mb-1 text-xs font-medium text-text-muted">Slide {slide.slideNumber}</p>
								<pre class="whitespace-pre-wrap rounded-lg bg-surface-alt px-3 py-2 font-mono text-sm text-text">{slide.text}</pre>
							</div>
						{/if}
					{/each}
				</div>
			</div>
		{/if}

		<div class="space-y-4 rounded-xl border border-border bg-surface-alt p-6">
			<h2 class="font-display text-lg font-700">Uses for extracted presentation text</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				Slide text extraction has a straightforward use case: you have a deck and you need its
				content as plain text. Maybe you are feeding it into a summary tool, checking it for
				compliance language, searching for a phrase across many presentations, or handing it off to
				a translator.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				The extractor parses the DrawingML text elements in each slide's XML, groups them by
				paragraph, and outputs them labelled by slide number. The result is a clean text file with
				no formatting artifacts — just the words as they appeared in the slides.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				Because the processing is entirely client-side, you can run it on presentations containing
				sensitive internal data without the content ever leaving your machine.
			</p>
		</div>
	</section>
</ToolShell>
