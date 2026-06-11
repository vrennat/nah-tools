<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import ProgressBar from '$components/pdf/ProgressBar.svelte';
	import ToolShell from '$components/ToolShell.svelte';

	let files = $state<File[]>([]);
	let format = $state<'png' | 'jpg'>('png');
	let quality = $state(92);
	let scale = $state(2);
	let processing = $state(false);
	let progress = $state({ current: 0, total: 0 });
	let error = $state('');

	let file = $derived(files[0]);
	let canExport = $derived(!!file && !processing);

	async function exportImages() {
		if (!canExport || !file) return;
		processing = true;
		error = '';
		progress = { current: 0, total: 0 };

		try {
			const { pdfToImages } = await import('$pdf/renderer');
			const { downloadAsZip, downloadBlob, makeFilename } = await import('$pdf/exporter');

			const buf = await file.arrayBuffer();
			const blobs = await pdfToImages(
				buf,
				{ format, quality: quality / 100, scale },
				(current, total) => {
					progress = { current, total };
				}
			);

			if (blobs.length === 1) {
				downloadBlob(blobs[0], makeFilename('page-1', format === 'jpg' ? 'jpg' : 'png'));
			} else {
				const zipFiles = blobs.map((blob, i) => ({
					name: `page-${String(i + 1).padStart(3, '0')}.${format}`,
					data: blob
				}));
				await downloadAsZip(zipFiles, makeFilename('pdf-pages', 'zip'));
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to export images';
		} finally {
			processing = false;
		}
	}

	const faqs = [
		{
			question: 'How does resolution work?',
			answer:
				'The scale setting multiplies the PDF\'s native resolution. 1x renders at 72 DPI (screen resolution), 2x at 144 DPI, and 3x at 216 DPI. For print-quality images, 2x or 3x is recommended. Higher scale means larger file sizes.'
		},
		{
			question: 'What is the difference between PNG and JPG output?',
			answer:
				'PNG is lossless — every pixel is preserved exactly. JPG uses lossy compression, which produces smaller files at some quality cost. For documents with text, PNG is usually preferable. For photos, JPG at 80-95% quality is typically indistinguishable from PNG at a fraction of the size.'
		},
		{
			question: 'What do I get for a multi-page PDF?',
			answer:
				'Single-page PDFs download as one image file. Multi-page PDFs are packaged as a ZIP archive with one numbered image per page (e.g., page-001.png, page-002.png).'
		},
		{
			question: 'Are my files uploaded?',
			answer:
				'No. The PDF is rendered page-by-page in your browser using PDF.js and the Canvas API. No data leaves your device.'
		},
		{
			question: 'Will text remain selectable in the exported images?',
			answer:
				'No. The output is a raster image — a pixel snapshot of each page. Text is not selectable in the resulting PNG or JPG. If you need vector output with editable text, use the PDF to SVG tool instead.'
		}
	];
</script>

<ToolShell
	path="/pdf/pdf-to-images"
	tagline="Export every PDF page as a PNG or JPG image. Choose resolution and quality, then download."
	seoTitle="PDF to Images Free — PNG or JPG Export | nah.tools"
	description="Export PDF pages as PNG or JPG images. Choose quality and resolution. Free, no upload — processed in your browser."
	{faqs}
>
	<section class="mx-auto max-w-2xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<FileDropZone accept=".pdf" acceptPendingFile={true} bind:files label="Drop a PDF here or click to browse" />

			{#if file}
				<div class="mt-4 space-y-4">
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="format" class="mb-1 block text-sm font-medium text-text">Format</label>
							<select
								id="format"
								bind:value={format}
								class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
							>
								<option value="png">PNG</option>
								<option value="jpg">JPG</option>
							</select>
						</div>
						<div>
							<label for="scale" class="mb-1 block text-sm font-medium text-text"
								>Resolution</label
							>
							<select
								id="scale"
								bind:value={scale}
								class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
							>
								<option value={1}>1x (72 DPI)</option>
								<option value={2}>2x (144 DPI)</option>
								<option value={3}>3x (216 DPI)</option>
							</select>
						</div>
					</div>

					{#if format === 'jpg'}
						<div>
							<label for="quality" class="mb-1 block text-sm font-medium text-text"
								>Quality: {quality}%</label
							>
							<input
								id="quality"
								type="range"
								min="10"
								max="100"
								step="5"
								bind:value={quality}
								class="w-full accent-accent"
							/>
						</div>
					{/if}
				</div>
			{/if}

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
					onclick={exportImages}
				>
					{#if processing}
						Exporting...
					{:else if !file}
						Upload a PDF
					{:else}
						Export as {format.toUpperCase()}
					{/if}
				</button>
			</div>
		</div>

		<div class="space-y-4 rounded-xl border border-border bg-surface-alt p-6">
			<h2 class="font-display text-lg font-700">Render PDF pages to images in your browser</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				Extracting images from a PDF is useful any time you need a visual representation
				of a page — thumbnails for a document preview, slides converted to images for
				a presentation, or scanned pages pulled out for editing. This tool renders each
				page using <strong class="font-medium text-text">PDF.js</strong> and the browser's
				Canvas API, producing accurate pixel representations without server involvement.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				Choose PNG for lossless output where text sharpness matters, or JPG with an
				adjustable quality slider for smaller files where some compression is acceptable.
				The resolution selector scales the render: 2x (144 DPI) is a good default for
				screen and email use; 3x (216 DPI) is suitable for printing. Multi-page PDFs
				are bundled into a ZIP with sequentially numbered files.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				Note that the output is a raster snapshot — text is not selectable in the resulting
				images. If you need vector output with editable paths, use the PDF to SVG tool instead.
			</p>
		</div>
	</section>
</ToolShell>
