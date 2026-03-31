<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import PptxToolLayout from '$components/pptx/PptxToolLayout.svelte';

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
</script>

<svelte:head>
	<title>Extract Images from PowerPoint Online Free | nah</title>
	<meta
		name="description"
		content="Pull all embedded images from a PowerPoint presentation. Free, no upload — processed entirely in your browser."
	/>
</svelte:head>

<PptxToolLayout
	title="Extract Images"
	description="Pull all embedded images from a PPTX file."
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

		<p class="text-center text-xs text-text-muted">
			<a href="/pptx" class="underline hover:text-accent">Back to all PowerPoint tools</a>
		</p>
	</section>
</PptxToolLayout>
