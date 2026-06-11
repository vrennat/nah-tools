<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import ProgressBar from '$components/pdf/ProgressBar.svelte';
	import ToolShell from '$components/ToolShell.svelte';
	import type { ExtractedImage } from '$pdf/types';

	let files = $state<File[]>([]);
	let processing = $state(false);
	let progress = $state({ current: 0, total: 0 });
	let error = $state('');
	let images = $state<ExtractedImage[]>([]);
	let done = $state(false);

	let file = $derived(files[0]);
	// Monotonically increasing counter so in-flight extractions can detect that
	// a newer file has been dropped and silently discard their results.
	let extractVersion = 0;

	$effect(() => {
		if (file) {
			extract(file);
		}
	});

	async function extract(targetFile: File) {
		const version = ++extractVersion;
		processing = true;
		error = '';
		images = [];
		done = false;
		progress = { current: 0, total: 0 };

		try {
			const { extractImages } = await import('$pdf/renderer');
			const buf = await targetFile.arrayBuffer();
			// Abort if a newer file was dropped while we were reading
			if (version !== extractVersion) return;
			const result = await extractImages(buf, (current, total) => {
				if (version === extractVersion) progress = { current, total };
			});
			// Abort if superseded during extraction
			if (version !== extractVersion) return;
			images = result;
			done = true;
		} catch (e) {
			if (version === extractVersion) {
				error = e instanceof Error ? e.message : 'Failed to extract images';
			}
		} finally {
			if (version === extractVersion) processing = false;
		}
	}

	async function downloadImage(img: ExtractedImage) {
		const { downloadBlob } = await import('$pdf/exporter');
		downloadBlob(img.blob, `${img.id}.png`);
	}

	async function downloadAll() {
		const { downloadAsZip } = await import('$pdf/exporter');
		const zipFiles = images.map((img) => ({
			name: `${img.id}.png`,
			data: img.blob
		}));
		const baseName = file?.name.replace(/\.pdf$/i, '') ?? 'images';
		await downloadAsZip(zipFiles, `${baseName}-images.zip`);
	}

	function reset() {
		files = [];
		images = [];
		done = false;
		error = '';
	}

	let pageCount = $derived(new Set(images.map((img) => img.pageNumber)).size);

	const faqs = [
		{
			question: 'What images does this extract?',
			answer:
				'The tool extracts images that are embedded as discrete image objects in the PDF — photos, illustrations, logos, and other raster graphics stored as XObject streams. It does not capture background colors, drawn shapes, or vector paths.'
		},
		{
			question: 'What format are the extracted images?',
			answer:
				'Images are exported as PNG files regardless of the original embedded format (JPEG, PNG, JBIG2, etc.). The tool renders each image object through the browser Canvas API, which outputs PNG.'
		},
		{
			question: 'Why does the page show no images found?',
			answer:
				'Some PDFs contain no embedded image objects — for example, text-only documents, or PDFs where visual elements are drawn as vector graphics rather than embedded raster images. Scanned PDFs usually contain images, but the image may be a full-page scan stored as one object rather than individual photos.'
		},
		{
			question: 'Can I download all images at once?',
			answer:
				'Yes. When multiple images are found, a "Download All as ZIP" button packages everything into a single ZIP archive with filenames indicating which page each image came from.'
		},
		{
			question: 'Are my files uploaded?',
			answer:
				'No. Extraction uses PDF.js running in your browser to parse the image streams. Your file is never transmitted anywhere.'
		}
	];
</script>

<ToolShell
	path="/pdf/extract-images"
	tagline="Pull every embedded image out of a PDF and download them individually or as a ZIP."
	seoTitle="Extract Images from PDF Free — No Upload | nah.tools"
	description="Pull all embedded images from a PDF. Download individually or as a ZIP. Free, no upload — processed in your browser."
	{faqs}
>
	<section class="mx-auto max-w-4xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			{#if !done}
				<FileDropZone accept=".pdf" bind:files label="Drop a PDF here or click to browse" />
			{/if}

			{#if error}
				<p class="mt-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
			{/if}

			{#if processing}
				<div class="mt-4">
					<ProgressBar current={progress.current} total={progress.total} />
				</div>
			{/if}

			{#if done && images.length === 0}
				<div class="py-12 text-center">
					<p class="text-text-muted">No images found in this PDF.</p>
					<button
						type="button"
						class="mt-4 text-sm text-accent underline hover:text-accent-hover"
						onclick={reset}
					>
						Try another file
					</button>
				</div>
			{/if}

			{#if done && images.length > 0}
				<div class="space-y-4">
					<div class="flex items-center justify-between">
						<p class="text-sm text-text-muted">
							Found {images.length} image{images.length === 1 ? '' : 's'} across {pageCount} page{pageCount === 1 ? '' : 's'}
						</p>
						<div class="flex gap-3">
							<button
								type="button"
								class="text-sm text-accent underline hover:text-accent-hover"
								onclick={reset}
							>
								New file
							</button>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
						{#each images as img (img.id)}
							<button
								type="button"
								class="rounded-lg border border-border bg-surface-alt p-3 cursor-pointer hover:border-accent/50 transition text-left"
								onclick={() => downloadImage(img)}
							>
								<div class="flex items-center justify-center overflow-hidden rounded bg-surface">
									<img
										src={img.dataUrl}
										alt="Extracted from page {img.pageNumber}"
										class="max-h-40 object-contain"
									/>
								</div>
								<div class="mt-2 flex items-center justify-between">
									<span class="inline-flex items-center rounded bg-accent/10 px-1.5 py-0.5 text-xs font-medium text-accent">
										Page {img.pageNumber}
									</span>
									<span class="text-xs text-text-muted">
										{img.width} &times; {img.height}
									</span>
								</div>
							</button>
						{/each}
					</div>

					<button
						type="button"
						class="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
						onclick={downloadAll}
					>
						Download All as ZIP
					</button>
				</div>
			{/if}
		</div>

		<div class="space-y-4 rounded-xl border border-border bg-surface-alt p-6">
			<h2 class="font-display text-lg font-700">Extract embedded images from any PDF</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				PDFs commonly contain images embedded as discrete objects in the file structure —
				product photos in a catalog, diagrams in a report, logos in a contract. Retrieving
				those originals is useful when you need to reuse the assets without screenshotting
				or re-downloading from a source you no longer have.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				This tool uses <strong class="font-medium text-text">PDF.js</strong> to parse the
				PDF's object graph in your browser and locate image XObjects on each page.
				Images are rendered to a canvas and exported as PNG files. A thumbnail grid lets
				you preview what was found and download images individually by clicking them, or
				grab everything at once as a ZIP archive.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				The tool extracts raster image objects only. Vector graphics drawn as PDF path
				instructions — such as SVG-style diagrams — are not extracted as images; for
				those, use the PDF to SVG converter to get a vector representation of the whole page.
			</p>
		</div>
	</section>
</ToolShell>
