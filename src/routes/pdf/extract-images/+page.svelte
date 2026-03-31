<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import ProgressBar from '$components/pdf/ProgressBar.svelte';
	import PdfToolLayout from '$components/pdf/PdfToolLayout.svelte';
	import type { ExtractedImage } from '$pdf/types';

	let files = $state<File[]>([]);
	let processing = $state(false);
	let progress = $state({ current: 0, total: 0 });
	let error = $state('');
	let images = $state<ExtractedImage[]>([]);
	let done = $state(false);

	let file = $derived(files[0]);

	$effect(() => {
		if (file && !processing) {
			extract();
		}
	});

	async function extract() {
		if (!file) return;
		processing = true;
		error = '';
		images = [];
		done = false;
		progress = { current: 0, total: 0 };

		try {
			const { extractImages } = await import('$pdf/renderer');
			const buf = await file.arrayBuffer();
			images = await extractImages(buf, (current, total) => {
				progress = { current, total };
			});
			done = true;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to extract images';
		} finally {
			processing = false;
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
</script>

<svelte:head>
	<title>Extract Images from PDF Online Free | nah</title>
	<meta
		name="description"
		content="Pull all embedded images from a PDF. Download individually or as a ZIP. Free, no upload — processed in your browser."
	/>
</svelte:head>

<PdfToolLayout
	title="Extract Images"
	description="Pull all embedded images from a PDF."
>
	<section class="mx-auto max-w-4xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			{#if !done}
				<FileDropZone accept=".pdf" bind:files label="Drop a PDF here or click to browse" />
			{/if}

			{#if error}
				<p role="alert" class="mt-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
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

		<p class="text-center text-xs text-text-muted">
			<a href="/pdf" class="underline hover:text-accent">Back to all PDF tools</a>
		</p>
	</section>
</PdfToolLayout>
