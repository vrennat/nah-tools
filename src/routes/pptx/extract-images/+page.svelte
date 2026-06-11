<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import ToolShell from '$components/ToolShell.svelte';

	let files = $state<File[]>([]);
	let processing = $state(false);
	let error = $state('');
	let imageCount = $state<number | null>(null);

	let file = $derived(files[0]);
	let canExtract = $derived(!!file && !processing);

	async function extract() {
		if (!canExtract || !file) return;
		processing = true;
		error = '';
		imageCount = null;

		try {
			const { extractImages } = await import('$pptx/processor');
			const { downloadBlob, downloadAsZip, makeFilename } = await import('$pptx/exporter');

			const buf = await file.arrayBuffer();
			const images = await extractImages(buf);

			if (images.length === 0) {
				error = 'No images found in this presentation.';
				return;
			}

			imageCount = images.length;

			if (images.length === 1) {
				downloadBlob(images[0].data, images[0].name);
			} else {
				const zipFiles = images.map((img) => ({
					name: img.name,
					data: img.data
				}));
				await downloadAsZip(zipFiles, makeFilename('images', 'zip'));
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to extract images';
		} finally {
			processing = false;
		}
	}

	const faqs = [
		{
			question: 'Are my files uploaded when extracting images?',
			answer:
				'No. The extraction runs entirely in your browser. Your PPTX is opened in memory with JSZip, the media files are read out, and the download is offered locally — nothing is sent to a server.'
		},
		{
			question: 'Which image formats can be extracted?',
			answer:
				'The tool extracts all files from the ppt/media/ directory inside the PPTX. This includes PNG, JPEG, GIF, SVG, BMP, TIFF, EMF, and WMF assets depending on what was embedded in the presentation.'
		},
		{
			question: 'Why might extracted images look different from what I see on the slide?',
			answer:
				'The tool extracts the raw embedded media files as they were stored, without applying any crop, color correction, or artistic effect that PowerPoint renders on top. What you get is the original asset before any in-app transformation.'
		},
		{
			question: 'How are the images delivered?',
			answer:
				'If the presentation contains a single image, it downloads directly as that file. If there are multiple images, they are packaged into a ZIP archive named images.zip with the original filenames preserved.'
		},
		{
			question: 'Are chart images and diagram backgrounds extracted too?',
			answer:
				'Only files explicitly stored in the ppt/media/ folder are extracted. Charts rendered as vector XML and SmartArt drawn as shapes are not included — those are not stored as media assets inside the PPTX.'
		}
	];
</script>

<ToolShell
	path="/pptx/extract-images"
	tagline="Pull every embedded image out of a presentation and download them all at once."
	seoTitle="Extract Images from PowerPoint Free | nah.tools"
	description="Pull all embedded images from a PowerPoint presentation. Free, no upload — processed entirely in your browser."
	{faqs}
>
	<section class="mx-auto max-w-2xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<FileDropZone accept=".pptx" bind:files label="Drop a PPTX file here or click to browse" />

			{#if imageCount !== null}
				<div class="mt-4 rounded-lg bg-success/10 px-4 py-3">
					<p class="text-sm font-medium text-success">
						Extracted {imageCount} image{imageCount === 1 ? '' : 's'}
					</p>
				</div>
			{/if}

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
						Upload a PPTX to extract images
					{:else}
						Extract Images
					{/if}
				</button>
			</div>
		</div>

		<div class="space-y-4 rounded-xl border border-border bg-surface-alt p-6">
			<h2 class="font-display text-lg font-700">Recovering images from a presentation</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				A PowerPoint file is a ZIP archive containing XML slide definitions and a media folder of
				all embedded images, audio clips, and video thumbnails. When you or a colleague pastes an
				image into a slide, PowerPoint stores the original file at full resolution inside that
				archive — but there is no obvious way to get it back out without right-clicking every image
				individually.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				This tool opens the PPTX with JSZip, reads every file from the media folder, and offers
				them all as a download. A single image downloads directly; multiple images come as a ZIP
				with the original filenames intact. The original PPTX is not modified.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				Common use cases include recovering high-resolution photos from a deck you received without
				the original assets, pulling graphics out of a client presentation to reuse in another
				document, or archiving all visual assets from a campaign deck before it is deleted.
			</p>
		</div>
	</section>
</ToolShell>
