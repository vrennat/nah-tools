<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import PdfToolLayout from '$components/pdf/PdfToolLayout.svelte';

	let files = $state<File[]>([]);
	let processing = $state(false);
	let error = $state('');
	let result = $state<{ originalSize: number; newSize: number } | null>(null);

	let file = $derived(files[0]);
	let canFlatten = $derived(!!file && !processing);

	function formatSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}

	async function flatten() {
		if (!canFlatten || !file) return;
		processing = true;
		error = '';
		result = null;

		try {
			const { flattenPDF } = await import('$pdf/processor');
			const { downloadPDF, makeFilename } = await import('$pdf/exporter');

			const buf = await file.arrayBuffer();
			const originalSize = buf.byteLength;
			const flattened = await flattenPDF(buf);
			const newSize = flattened.byteLength;

			result = { originalSize, newSize };
			downloadPDF(flattened, makeFilename('flattened', 'pdf'));
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to flatten PDF';
		} finally {
			processing = false;
		}
	}
</script>

<svelte:head>
	<title>Flatten PDF Online Free | nah</title>
	<meta
		name="description"
		content="Remove interactive form fields and annotations from PDFs, baking them into static content. Free, no upload — processed in your browser."
	/>
</svelte:head>

<PdfToolLayout
	title="Flatten PDF"
	description="Remove form fields and annotations, baking them into static content."
>
	<section class="mx-auto max-w-2xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<FileDropZone accept=".pdf" bind:files label="Drop a PDF here or click to browse" />

			<div class="mt-4 rounded-lg border border-border bg-surface-alt px-4 py-3">
				<p class="text-sm text-text-muted">
					Flattens interactive form fields (text inputs, checkboxes, dropdowns) into static
					content. If your PDF has no form fields, it will be re-saved with optimized structure.
				</p>
			</div>

			{#if result}
				<div role="alert" class="mt-4 rounded-lg bg-success/10 px-3 py-2">
					<p class="text-sm font-medium text-success">
						{formatSize(result.originalSize)} → {formatSize(result.newSize)}
						({Math.round((1 - result.newSize / result.originalSize) * 100)}% reduction)
					</p>
				</div>
			{/if}

			{#if error}
				<p role="alert" class="mt-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
			{/if}

			<div class="mt-6">
				<button
					type="button"
					class="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
					disabled={!canFlatten}
					onclick={flatten}
				>
					{#if processing}
						Flattening...
					{:else if !file}
						Upload a PDF to flatten
					{:else}
						Flatten PDF
					{/if}
				</button>
			</div>
		</div>

		<p class="text-center text-xs text-text-muted">
			<a href="/pdf" class="underline hover:text-accent">Back to all PDF tools</a>
		</p>
	</section>
</PdfToolLayout>
