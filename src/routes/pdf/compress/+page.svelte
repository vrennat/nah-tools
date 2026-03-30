<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import PdfToolLayout from '$components/pdf/PdfToolLayout.svelte';

	let files = $state<File[]>([]);
	let processing = $state(false);
	let error = $state('');
	let result = $state<{ originalSize: number; newSize: number } | null>(null);

	let file = $derived(files[0]);
	let canCompress = $derived(!!file && !processing);

	function formatSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}

	async function compress() {
		if (!canCompress || !file) return;
		processing = true;
		error = '';
		result = null;

		try {
			const { compressPDF } = await import('$pdf/processor');
			const { downloadPDF, makeFilename } = await import('$pdf/exporter');

			const buf = await file.arrayBuffer();
			const originalSize = buf.byteLength;
			const compressed = await compressPDF(buf);
			const newSize = compressed.byteLength;

			result = { originalSize, newSize };
			downloadPDF(compressed, makeFilename('compressed', 'pdf'));
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to compress PDF';
		} finally {
			processing = false;
		}
	}
</script>

<svelte:head>
	<title>Compress PDF Online Free | nah</title>
	<meta
		name="description"
		content="Reduce PDF file size by stripping metadata and optimizing structure. Free, no upload — processed in your browser."
	/>
</svelte:head>

<PdfToolLayout
	title="Compress PDF"
	description="Reduce file size by stripping metadata and optimizing structure."
>
	<section class="mx-auto max-w-2xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<FileDropZone accept=".pdf" bind:files label="Drop a PDF here or click to browse" />

			<div class="mt-4 rounded-lg border border-border bg-surface-alt px-4 py-3">
				<p class="text-sm text-text-muted">
					Client-side compression strips metadata and optimizes PDF structure. This typically
					achieves 10-30% reduction. For heavy compression of scanned documents (image
					recompression), a server-side tool like Stirling-PDF is needed.
				</p>
			</div>

			{#if result}
				<div class="mt-4 rounded-lg bg-success/10 px-4 py-3">
					<p class="text-sm font-medium text-success">
						{formatSize(result.originalSize)} → {formatSize(result.newSize)}
						({Math.round((1 - result.newSize / result.originalSize) * 100)}% reduction)
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
					disabled={!canCompress}
					onclick={compress}
				>
					{#if processing}
						Compressing...
					{:else if !file}
						Upload a PDF to compress
					{:else}
						Compress PDF
					{/if}
				</button>
			</div>
		</div>

		<p class="text-center text-xs text-text-muted">
			<a href="/pdf" class="underline hover:text-accent">Back to all PDF tools</a>
		</p>
	</section>
</PdfToolLayout>
