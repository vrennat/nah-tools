<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import ProgressBar from '$components/pdf/ProgressBar.svelte';
	import ToolShell from '$components/ToolShell.svelte';
	import { isHeic, convertHeicToJpeg } from '$lib/heic';

	let files = $state<File[]>([]);
	let pageSize = $state<'fit' | 'a4' | 'letter'>('fit');
	let processing = $state(false);
	let convertingHeic = $state(false);
	let progress = $state({ current: 0, total: 0 });
	let error = $state('');
	let dragIndex = $state<number | null>(null);

	let canConvert = $derived(files.length > 0 && !processing && !convertingHeic);

	function moveFile(from: number, to: number) {
		if (from === to) return;
		const updated = [...files];
		const [item] = updated.splice(from, 1);
		updated.splice(to, 0, item);
		files = updated;
	}

	// Convert any HEIC files to JPEG when files change
	$effect(() => {
		const heicFiles = files.filter(isHeic);
		if (heicFiles.length === 0) return;

		convertingHeic = true;
		Promise.all(
			files.map(async (f) => (isHeic(f) ? convertHeicToJpeg(f) : f))
		).then((converted) => {
			files = converted;
			convertingHeic = false;
		}).catch(() => {
			error = 'Failed to convert one or more HEIC files';
			convertingHeic = false;
		});
	});

	function getImageType(file: File): 'png' | 'jpg' {
		return file.type === 'image/png' ? 'png' : 'jpg';
	}

	async function convert() {
		if (!canConvert) return;
		processing = true;
		error = '';
		progress = { current: 0, total: files.length };

		try {
			const { imagesToPDF } = await import('$pdf/processor');
			const { downloadPDF, makeFilename } = await import('$pdf/exporter');

			const images = await Promise.all(
				files.map(async (f) => ({
					data: await f.arrayBuffer(),
					type: getImageType(f)
				}))
			);

			const result = await imagesToPDF(images, pageSize, (current, total) => {
				progress = { current, total };
			});

			downloadPDF(result, makeFilename('images', 'pdf'));
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to convert images';
		} finally {
			processing = false;
		}
	}

	const faqs = [
		{
			question: 'Which image formats are supported?',
			answer:
				'The tool accepts JPG, PNG, and HEIC/HEIF files. HEIC images (common from iPhone cameras) are automatically converted to JPEG before being embedded in the PDF.'
		},
		{
			question: 'What do the page size options do?',
			answer:
				'"Fit to image" creates a PDF where each page is exactly the dimensions of the source image — no borders, no scaling. A4 and Letter size the page to the chosen paper format and center-fit the image within it, which may add white margins for images with different aspect ratios.'
		},
		{
			question: 'Can I set the order of images in the PDF?',
			answer:
				'Yes. When you add more than one image, a drag-and-drop list appears. The order you set there is the order pages appear in the final PDF.'
		},
		{
			question: 'Are my images uploaded to a server?',
			answer:
				'No. All processing happens in your browser using the pdf-lib library. Your images never leave your device.'
		},
		{
			question: 'Is there a limit on how many images I can convert?',
			answer:
				'No hard limit is enforced. Very large batches or high-resolution images may be slow on low-memory devices since all image data is held in memory during conversion.'
		}
	];
</script>

<ToolShell
	path="/pdf/images-to-pdf"
	tagline="Turn JPG, PNG, or HEIC photos into a single PDF document. Drag to reorder, choose page size."
	seoTitle="Images to PDF Free — JPG, PNG, HEIC | nah.tools"
	description="Convert JPG, PNG, or HEIC images to PDF. Drag to reorder, choose page size. Free, no upload — processed in your browser."
	{faqs}
>
	<section class="mx-auto max-w-2xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<FileDropZone
				accept=".jpg,.jpeg,.png,.heic,.heif"
				multiple={true}
				bind:files
				label="Drop images here or click to browse"
			/>

			{#if files.length > 1}
				<div class="mt-4 space-y-2">
					<p class="text-sm font-medium text-text">Image order (drag to reorder)</p>
					<ul class="space-y-1">
						{#each files as file, i}
							<li
								class="flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors {dragIndex === i
									? 'border-accent bg-accent/5'
									: 'border-border bg-surface'}"
								draggable="true"
								role="listitem"
								ondragstart={() => (dragIndex = i)}
								ondragover={(e) => {
									e.preventDefault();
									if (dragIndex !== null && dragIndex !== i) {
										moveFile(dragIndex, i);
										dragIndex = i;
									}
								}}
								ondragend={() => (dragIndex = null)}
							>
								<svg
									class="h-4 w-4 shrink-0 cursor-grab text-text-muted"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M4 8h16M4 16h16"
									/>
								</svg>
								<span class="min-w-0 flex-1 truncate text-text">{file.name}</span>
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			{#if files.length > 0}
				<div class="mt-4">
					<label for="pageSize" class="mb-1 block text-sm font-medium text-text">Page size</label>
					<select
						id="pageSize"
						bind:value={pageSize}
						class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					>
						<option value="fit">Fit to image</option>
						<option value="a4">A4</option>
						<option value="letter">Letter</option>
					</select>
				</div>
			{/if}

			{#if convertingHeic}
				<div class="mt-4 flex items-center gap-2 rounded-lg bg-accent/5 border border-accent/20 px-3 py-2 text-sm text-text-muted">
					<div class="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent"></div>
					Converting HEIC files...
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
					disabled={!canConvert}
					onclick={convert}
				>
					{#if processing}
						Converting...
					{:else if files.length === 0}
						Add images to convert
					{:else}
						Convert {files.length} image{files.length > 1 ? 's' : ''} to PDF
					{/if}
				</button>
			</div>
		</div>

		<div class="space-y-4 rounded-xl border border-border bg-surface-alt p-6">
			<h2 class="font-display text-lg font-700">Convert images to PDF without uploading</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				Whether you're assembling a photo portfolio, packaging scanned documents, or sending
				iPhone photos as a single attachment, converting images to PDF is a routine task that
				most tools handle by routing your files through a remote server. This tool does it
				entirely in your browser using <strong class="font-medium text-text">pdf-lib</strong>,
				a JavaScript PDF library that runs locally.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				Drop any number of JPG, PNG, or HEIC images. HEIC files — the default format from
				Apple's camera app — are automatically converted to JPEG before embedding, so you
				don't need to pre-convert them. Set the page size to "Fit to image" for a tight
				page that matches the source dimensions, or choose A4 or Letter if you need a
				standard paper size. Drag the file list to control page order before converting.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				The output is a standard PDF with one image per page, ready to email, print, or
				archive. Nothing is transmitted — the download begins directly from your browser.
			</p>
		</div>
	</section>
</ToolShell>
