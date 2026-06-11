<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import ProgressBar from '$components/pdf/ProgressBar.svelte';
	import ToolShell from '$components/ToolShell.svelte';

	let files = $state<File[]>([]);
	let processing = $state(false);
	let progress = $state({ current: 0, total: 0 });
	let error = $state('');

	let file = $derived(files[0]);
	let canExport = $derived(!!file && !processing);

	async function exportSVG() {
		if (!canExport || !file) return;
		processing = true;
		error = '';
		progress = { current: 0, total: 0 };

		try {
			const { pdfToSVG } = await import('$pdf/renderer');
			const { downloadAsZip, downloadBlob, makeFilename } = await import('$pdf/exporter');

			const buf = await file.arrayBuffer();
			const blobs = await pdfToSVG(buf, (current, total) => {
				progress = { current, total };
			});

			if (blobs.length === 1) {
				downloadBlob(blobs[0], makeFilename('page-1', 'svg'));
			} else {
				const zipFiles = blobs.map((blob, i) => ({
					name: `page-${String(i + 1).padStart(3, '0')}.svg`,
					data: blob
				}));
				await downloadAsZip(zipFiles, makeFilename('pdf-pages', 'zip'));
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to convert to SVG';
		} finally {
			processing = false;
		}
	}

	const faqs = [
		{
			question: 'What makes SVG output different from PNG or JPG?',
			answer:
				'SVG is a vector format. Lines, shapes, and text in the output are represented as mathematical paths, not pixels. This means the SVG can be scaled to any size without quality loss, and text and path elements are individually selectable and editable in a vector editor like Inkscape or Illustrator.'
		},
		{
			question: 'Does the SVG contain editable text?',
			answer:
				'Yes, when the source PDF contains actual text (not scanned images). PDF.js converts text runs into SVG text elements, which are selectable and editable. For scanned PDFs where pages are raster images, the SVG output will embed those images — run OCR first if you need selectable text.'
		},
		{
			question: 'What do I get for a multi-page PDF?',
			answer:
				'Single-page PDFs produce one .svg file. Multi-page PDFs are bundled into a ZIP archive with one numbered SVG per page (e.g., page-001.svg, page-002.svg).'
		},
		{
			question: 'Are my files uploaded?',
			answer:
				'No. Conversion uses PDF.js running in your browser to render each page as SVG markup. Your PDF is never sent to a server.'
		},
		{
			question: 'Why is my SVG large?',
			answer:
				'PDF pages converted to SVG can be significantly larger than the original PDF because SVG stores every path and text element as XML text, which is verbose. If file size is a concern, a tool like SVGO can compress the output significantly without visible quality loss.'
		}
	];
</script>

<ToolShell
	path="/pdf/pdf-to-svg"
	tagline="Convert PDF pages to true vector SVG — editable paths and text, infinite scale."
	seoTitle="PDF to SVG Free — Vector Conversion | nah.tools"
	description="Convert PDF pages to true vector SVG with editable paths and text. Free, no upload — processed in your browser."
	{faqs}
>
	<section class="mx-auto max-w-2xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<FileDropZone accept=".pdf" bind:files label="Drop a PDF here or click to browse" />

			{#if error}
				<p class="mt-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
			{/if}

			{#if processing}
				<div class="mt-4">
					<ProgressBar current={progress.current} total={progress.total} />
				</div>
			{/if}

			<div class="mt-6">
				<button
					type="button"
					class="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
					disabled={!canExport}
					onclick={exportSVG}
				>
					{#if processing}
						Converting...
					{:else if !file}
						Upload a PDF
					{:else}
						Convert to SVG
					{/if}
				</button>
			</div>
		</div>

		<div class="space-y-4 rounded-xl border border-border bg-surface-alt p-6">
			<h2 class="font-display text-lg font-700">Convert PDF to vector SVG for editing and scaling</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				PDF and SVG are both vector formats at heart — PDFs store content as path
				instructions and text runs, and SVG does the same using XML. Converting between
				them makes PDF content available in tools that work natively with SVG: vector
				editors like Inkscape or Affinity Designer, web pages, and design tools that
				accept SVG imports.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				This tool uses <strong class="font-medium text-text">PDF.js</strong> to render each
				page as SVG markup in your browser. Paths, shapes, and text from the original PDF
				are preserved as editable SVG elements. The output scales to any resolution
				without pixelation, unlike a raster export. For PDFs that contain actual text,
				the text elements in the SVG remain selectable.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				Multi-page PDFs are exported as a ZIP of numbered SVG files. If you only need
				a pixel image rather than a vector, the PDF to Images tool produces PNG or JPG
				output instead.
			</p>
		</div>
	</section>
</ToolShell>
