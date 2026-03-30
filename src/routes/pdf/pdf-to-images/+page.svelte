<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import ProgressBar from '$components/pdf/ProgressBar.svelte';
	import PdfToolLayout from '$components/pdf/PdfToolLayout.svelte';

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
</script>

<svelte:head>
	<title>Convert PDF to Images Online Free | nah</title>
	<meta
		name="description"
		content="Export PDF pages as PNG or JPG images. Choose quality and resolution. Free, no upload — processed in your browser."
	/>
</svelte:head>

<PdfToolLayout
	title="PDF to Images"
	description="Export PDF pages as PNG or JPG images."
>
	<section class="mx-auto max-w-2xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<FileDropZone accept=".pdf" bind:files label="Drop a PDF here or click to browse" />

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

		<p class="text-center text-xs text-text-muted">
			<a href="/pdf" class="underline hover:text-accent">Back to all PDF tools</a>
		</p>
	</section>
</PdfToolLayout>
